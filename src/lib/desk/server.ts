import { createHash } from 'node:crypto';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  DeskError,
  day,
  draftInput,
  emptyState,
  exact,
  reportPattern,
  revision,
  text,
  uuidPattern,
  validateState,
} from './contracts';

export type DeskConfig = {
  url: string;
  key: string;
  owner: string;
  origin: string;
  secure: boolean;
};
type CookieWrite = { name: string; value: string; options: CookieOptions };
type Context = { client: SupabaseClient; cookies: CookieWrite[] };
export type DeskDependencies = {
  config: () => DeskConfig;
  context: (request: NextRequest, config: DeskConfig) => Context;
};

export function readConfig(): DeskConfig {
  const url = process.env.XIV_DESK_SUPABASE_URL || '';
  const key = process.env.XIV_DESK_SUPABASE_PUBLISHABLE_KEY || '';
  const owner = process.env.XIV_DESK_OWNER_ID || '';
  const origin = process.env.XIV_DESK_ORIGIN || '';
  const secure = process.env.NODE_ENV === 'production';
  if (!url || !key || !uuidPattern.test(owner) || !origin)
    throw new DeskError(
      503,
      'Your private desk is being connected. Login and online saving are not available yet.',
    );
  try {
    const provider = new URL(url),
      site = new URL(origin);
    const local = (u: URL) =>
      u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname);
    if (
      provider.username ||
      provider.password ||
      site.origin !== origin ||
      (provider.protocol !== 'https:' && (secure || !local(provider))) ||
      (site.protocol !== 'https:' && (secure || !local(site)))
    )
      throw new Error('Invalid private configuration');
  } catch {
    throw new DeskError(503, 'The private connection needs configuration.');
  }
  return { url, key, owner, origin, secure };
}

const defaultDependencies: DeskDependencies = {
  config: readConfig,
  context(request, config) {
    const pending = new Map<string, CookieWrite>();
    const context: Context = { client: null as unknown as SupabaseClient, cookies: [] };
    context.client = createServerClient(config.url, config.key, {
      cookieOptions: {
        name: 'xiv-private-desk',
        path: '/',
        httpOnly: true,
        secure: config.secure,
        sameSite: 'strict',
        maxAge: 604800,
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          for (const v of values) pending.set(v.name, v);
          context.cookies = [...pending.values()];
        },
      },
    });
    return context;
  },
};

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Vary: 'Cookie',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  Pragma: 'no-cache',
  Expires: '0',
};
export function checkOrigin(request: NextRequest, config: DeskConfig) {
  if (request.headers.get('x-xiv-desk') !== '1')
    throw new DeskError(403, 'Open this action from your private desk.');
  const origin = request.headers.get('origin');
  if (
    (origin && origin !== config.origin) ||
    (request.method !== 'GET' && origin !== config.origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new DeskError(403, 'This request is not from your private desk.');
}
async function bodyOf(request: NextRequest) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json')
    throw new DeskError(400, 'Use a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new DeskError(400, 'The request is empty.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2 * 1024 * 1024) {
        await reader.cancel();
        throw new DeskError(413, 'The day is too large. Keep your unsaved notes and export them.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new DeskError(400, 'The request is not valid JSON.');
  }
}
async function ownerOf(client: SupabaseClient, owner: string) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new DeskError(401, 'Sign in to your private desk.');
  if (data.user.id !== owner)
    throw new DeskError(403, 'This account does not have access to the private desk.');
  const member = await client
    .from('xiv_desk_members')
    .select('user_id')
    .eq('user_id', data.user.id)
    .eq('enabled', true)
    .maybeSingle();
  if (member.error) throw new DeskError(503, 'The private storage connection needs attention.');
  if (!member.data)
    throw new DeskError(403, 'This account does not have access to the private desk.');
  return data.user.id;
}
async function loadDay(client: SupabaseClient, owner: string, date: string) {
  const result = await client
    .from('xiv_desk_days')
    .select('day,revision,state')
    .eq('owner_id', owner)
    .eq('day', date)
    .maybeSingle();
  if (result.error)
    throw new DeskError(
      503,
      'Your saved day could not be loaded. Try again without replacing your notes.',
    );
  if (!result.data)
    return { day: date, revision: 0, state: emptyState() as Record<string, unknown> };
  return {
    day: day(result.data.day),
    revision: revision(result.data.revision),
    state: validateState(result.data.state),
  };
}

export async function handleDesk(
  request: NextRequest,
  path: string[],
  deps: DeskDependencies = defaultDependencies,
) {
  let context: Context | undefined, config: DeskConfig | undefined;
  function respond(value: unknown, status = 200) {
    const response = NextResponse.json(value, { status, headers: privateHeaders });
    for (const cookie of context?.cookies || [])
      response.cookies.set(cookie.name, cookie.value, {
        ...cookie.options,
        httpOnly: true,
        secure: config?.secure ?? true,
        sameSite: 'strict',
        path: '/',
      });
    return response;
  }
  try {
    config = deps.config();
    checkOrigin(request, config);
    if (!['GET', 'POST'].includes(request.method))
      return respond({ error: 'Method not allowed.' }, 405);
    context = deps.context(request, config);
    const client = context.client,
      action = path.join('/');
    if (request.method === 'POST' && action === 'login') {
      const body = exact(await bodyOf(request), ['email', 'password']);
      const email = text(body.email, 320).trim(),
        password = text(body.password, 1024);
      if (!email || !password) throw new DeskError(400, 'Enter your email and password.');
      const login = await client.auth.signInWithPassword({ email, password });
      if (login.error) throw new DeskError(401, 'Sign-in failed. Check your email and password.');
      try {
        await ownerOf(client, config.owner);
      } catch (error) {
        await client.auth.signOut({ scope: 'local' });
        throw error;
      }
      return respond({ ok: true });
    }
    if (request.method === 'POST' && action === 'logout') {
      exact(await bodyOf(request), []);
      try {
        await client.auth.signOut({ scope: 'local' });
      } catch {
        /* Clear local cookies below even during an upstream outage. */
      }
      // Clear this browser's session even when the upstream sign-out service is unavailable.
      for (const cookie of request.cookies.getAll())
        if (/^xiv-private-desk(?:\.\d+)?$/.test(cookie.name)) {
          context.cookies.push({ name: cookie.name, value: '', options: { maxAge: 0 } });
        }
      return respond({ ok: true });
    }
    const owner = await ownerOf(client, config.owner);
    if (request.method === 'GET') {
      if (action === 'bootstrap') {
        const now = new Date();
        return respond({
          today: new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(now),
          weekday: new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            weekday: 'long',
          }).format(now),
          label: new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(now),
          timezone: 'America/New_York',
          catalog: [],
          cloud: true,
        });
      }
      if (action === 'state') {
        const query = request.nextUrl.searchParams;
        if (query.getAll('day').length !== 1 || [...query.keys()].some((k) => k !== 'day'))
          throw new DeskError(400, 'Choose one day.');
        return respond(await loadDay(client, owner, day(query.get('day'))));
      }
      if (action === 'reports') {
        const result = await client
          .from('xiv_desk_reports')
          .select('id,role,created_at')
          .eq('owner_id', owner)
          .order('created_at', { ascending: false })
          .limit(100);
        if (result.error) throw new DeskError(503, 'Saved reports could not be loaded.');
        return respond(
          (result.data || []).map((row) => ({ id: row.id, role: row.role, at: row.created_at })),
        );
      }
      if (path.length === 2 && path[0] === 'report' && reportPattern.test(path[1])) {
        const result = await client
          .from('xiv_desk_reports')
          .select('body')
          .eq('owner_id', owner)
          .eq('id', path[1])
          .maybeSingle();
        if (result.error) throw new DeskError(503, 'That report could not be loaded.');
        if (!result.data) throw new DeskError(404, 'Report not found.');
        return respond({
          display:
            'SAVED SNAPSHOT · operator notes, not independently verified\n\n' +
            text(result.data.body.display, 24000),
        });
      }
    } else {
      const body = await bodyOf(request);
      if (action === 'save') {
        const values = exact(body, ['day', 'revision', 'state']);
        const date = day(values.day),
          version = revision(values.revision),
          state = validateState(values.state);
        const result = await client.rpc('xiv_desk_save', {
          p_day: date,
          p_revision: version,
          p_state: state,
        });
        if (result.error?.code === '40001')
          throw new DeskError(
            409,
            'Another device saved a newer day. Export your unsaved text before refreshing.',
          );
        if (result.error)
          throw new DeskError(
            503,
            'Saving failed. Keep this tab open and export your unsaved notes before retrying.',
          );
        return respond(result.data);
      }
      if (action === 'draft') {
        const values = exact(body, ['day', 'revision', 'card', 'confirmed', 'input']);
        if (values.confirmed !== true)
          throw new DeskError(400, 'Confirm the current thought first.');
        const date = day(values.day),
          version = revision(values.revision),
          input = draftInput(values.input);
        const saved = await loadDay(client, owner, date);
        if (saved.revision !== version)
          throw new DeskError(409, 'The saved thought changed. Review it before confirming.');
        const cards = saved.state.cards as Array<Record<string, unknown>>;
        const card = cards.find((card) => card.id === values.card);
        if (!card || input.notes !== card.raw)
          throw new DeskError(400, 'The draft must match your saved thought.');
        const id = createHash('sha256')
          .update(JSON.stringify([owner, date, version, card.id, input]))
          .digest('hex');
        const display = [
          'Research Analyst',
          'PREPARATION DRAFT — ' + input.instrument,
          '',
          input.notes,
          '',
          input.direction && 'Direction: ' + input.direction,
          input.entry_zone && 'Entry: ' + input.entry_zone,
          input.invalidation && 'Invalidation: ' + input.invalidation,
          '',
          'Operator notes, not independently verified. No AI, prices or broker orders.',
          'This organizes your thought; it does not establish a trade thesis, return or approval.',
        ].join('\n');
        const report = {
          role: 'Research Analyst',
          generated_at: new Date().toISOString(),
          display,
          capture: {
            day: date,
            workspace_revision: version,
            card_id: card.id,
            source: card.source,
            raw: card.raw,
          },
          input,
        };
        const inserted = await client
          .from('xiv_desk_reports')
          .insert({ owner_id: owner, id, role: 'Research Analyst', body: report });
        if (inserted.error && inserted.error.code !== '23505')
          throw new DeskError(
            503,
            'The report was not saved. Your thought remains saved separately.',
          );
        const result = await client
          .from('xiv_desk_reports')
          .select('body')
          .eq('owner_id', owner)
          .eq('id', id)
          .single();
        if (result.error) throw new DeskError(503, 'The saved report could not be reopened.');
        return respond({
          id,
          report: result.data.body,
          display: result.data.body.display,
          saved: true,
        });
      }
      if (['history', 'quant', 'review'].includes(action))
        throw new DeskError(
          501,
          'Historical Gold review is available on your desktop. No trade history has been uploaded to this website.',
        );
    }
    throw new DeskError(404, 'This desk action is not available.');
  } catch (error) {
    return respond(
      {
        error:
          error instanceof DeskError
            ? error.message
            : 'The private desk could not complete this action. Keep your unsaved notes.',
      },
      error instanceof DeskError ? error.status : 503,
    );
  }
}
