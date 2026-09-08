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
import {
  RESEARCH_MAX_OFFSET,
  RESEARCH_PAGE_SIZE,
  isResearchId,
  researchCancelInput,
  researchCreateInput,
  researchOffset,
  researchRetryInput,
  researchStorageError,
  researchSummaryColumns,
  shapeResearchSummary,
  shapeResearchTask,
} from './research';
import {
  bridgeMetadataMatchesDescriptor,
  bridgeRevokeInput,
  parseBridgeDescriptor,
  shapeBridgeList,
  shapeBridgeMetadata,
} from './bridge-contracts';

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
function clearSessionCookies(request: NextRequest, context: Context) {
  // A refreshed session can use a different number of cookie chunks. Clear
  // both the incoming names and any newly queued names, including PKCE state.
  const names = new Set([
    ...request.cookies.getAll().map((cookie) => cookie.name),
    ...context.cookies.map((cookie) => cookie.name),
  ]);
  for (const name of names)
    if (
      /^xiv-private-desk(?:-code-verifier|-flows-code-verifier|-flow-[A-Za-z0-9_-]{8,64}-code-verifier)?(?:\.\d+)?$/.test(
        name,
      )
    )
      context.cookies.push({ name, value: '', options: { maxAge: 0 } });
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
    // PKCE binds the recovery link to this browser. Only the fixed recovery
    // page can be a return address; the request cannot supply a redirect.
    if (request.method === 'POST' && action === 'reset-start') {
      const body = exact(await bodyOf(request), ['email']);
      const email = text(body.email, 320).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new DeskError(400, 'Enter your email address.');
      const reset = await client.auth.resetPasswordForEmail(email, {
        redirectTo: config.origin + '/desk/recover',
      });
      if (reset.error) {
        if (reset.error.status === 429)
          throw new DeskError(429, 'Please wait before requesting another reset email.');
        throw new DeskError(503, 'The reset email could not be requested. Please try again later.');
      }
      return respond({
        ok: true,
        message:
          'If this email belongs to an account, a reset link has been requested. Open it in this same browser.',
      });
    }
    if (request.method === 'POST' && action === 'reset-exchange') {
      const raw = await bodyOf(request);
      const body = exact(raw, raw?.flowId === undefined ? ['code'] : ['code', 'flowId']);
      const code = text(body.code, 2048);
      const flowId = body.flowId === undefined ? undefined : text(body.flowId, 64);
      if (
        !code ||
        /\s/.test(code) ||
        (flowId !== undefined && !/^[A-Za-z0-9_-]{8,64}$/.test(flowId))
      )
        throw new DeskError(400, 'This reset link is not valid. Request a new one.');
      const exchanged = await client.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );
      if (exchanged.error)
        throw new DeskError(
          401,
          'This reset link expired or belongs to another browser. Request a new one here.',
        );
      try {
        await ownerOf(client, config.owner);
      } catch (error) {
        await client.auth.signOut({ scope: 'local' });
        throw error;
      }
      return respond({ ok: true });
    }
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
      clearSessionCookies(request, context);
      return respond({ ok: true });
    }
    const owner = await ownerOf(client, config.owner);
    if (path[0] === 'research' && path[1] === 'bridges') {
      const listing = request.method === 'GET' && path.length === 2;
      const mutation =
        request.method === 'POST' && path.length === 3 && ['register', 'revoke'].includes(path[2]);
      if (!listing && !mutation)
        throw new DeskError(404, 'This bridge approval action is not available.');
      researchOffset(request.nextUrl.searchParams, false);
      const failure = (code?: string) => {
        if (code === '42501')
          return new DeskError(403, 'This account cannot manage that bridge approval.');
        if (code === '22023')
          return new DeskError(400, 'The bridge approval request is invalid or expired.');
        if (code === '40001')
          return new DeskError(
            409,
            'This bridge approval changed. Refresh the list before continuing.',
          );
        return new DeskError(
          503,
          listing
            ? 'Bridge approvals could not be read. Refresh the list before continuing.'
            : 'The bridge change could not be confirmed. Refresh the bridge list before retrying.',
        );
      };
      if (listing) {
        let result;
        try {
          result = await client.rpc('xiv_research_bridge_list', {});
        } catch {
          throw failure();
        }
        if (!result || typeof result !== 'object') throw failure();
        if (result.error) throw failure(result.error.code);
        return respond({
          bridges: shapeBridgeList(result.data),
          server_time: new Date().toISOString(),
        });
      }
      const body = await bodyOf(request);
      const registering = path[2] === 'register';
      const descriptor = registering ? parseBridgeDescriptor(body) : null;
      const id = descriptor?.id ?? bridgeRevokeInput(body).id;
      let result;
      try {
        result = descriptor
          ? await client.rpc('xiv_research_bridge_register', {
              p_bridge_id: descriptor.id,
              p_session: descriptor.session,
              p_token_sha256: descriptor.token_sha256,
              p_expires_at: descriptor.expires_at,
            })
          : await client.rpc('xiv_research_bridge_revoke', { p_bridge_id: id });
      } catch {
        throw failure();
      }
      if (!result || typeof result !== 'object') throw failure();
      if (result.error) throw failure(result.error.code);
      try {
        const bridge = shapeBridgeMetadata(result.data);
        if (
          bridge.id !== id ||
          (descriptor && !bridgeMetadataMatchesDescriptor(bridge, descriptor)) ||
          (!descriptor && bridge.revoked_at === null)
        )
          throw failure();
        return respond({ bridge, server_time: new Date().toISOString() });
      } catch {
        // The provider may have committed even when its response cannot be trusted.
        throw failure();
      }
    }
    if (path[0] === 'research') {
      const listing = request.method === 'GET' && path.length === 1;
      const detail = request.method === 'GET' && path.length === 2 && isResearchId(path[1]);
      const mutation =
        request.method === 'POST' &&
        path.length === 2 &&
        ['create', 'cancel', 'retry'].includes(path[1]);
      // Browser routes cannot claim work, impersonate a worker, or submit results.
      if (!listing && !detail && !mutation)
        throw new DeskError(404, 'This research action is not available.');
      const offset = researchOffset(request.nextUrl.searchParams, listing);
      // Session approval and last use come from the separate bridge metadata.
      // Task records cannot establish whether a worker is currently online.
      const envelope = () => ({ server_time: new Date().toISOString() });
      if (listing) {
        const result = await client
          .from('xiv_research_tasks')
          .select(researchSummaryColumns)
          .eq('owner_id', owner)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(offset, offset + RESEARCH_PAGE_SIZE);
        if (result.error) throw researchStorageError(result.error);
        if (!Array.isArray(result.data) || result.data.length > RESEARCH_PAGE_SIZE + 1)
          throw researchStorageError({});
        const tasks = result.data.map((row) => shapeResearchSummary(row, owner));
        return respond({
          tasks: tasks.slice(0, RESEARCH_PAGE_SIZE),
          next_offset:
            tasks.length > RESEARCH_PAGE_SIZE && offset + RESEARCH_PAGE_SIZE <= RESEARCH_MAX_OFFSET
              ? offset + RESEARCH_PAGE_SIZE
              : null,
          ...envelope(),
        });
      }
      if (detail) {
        const result = await client
          .from('xiv_research_tasks')
          .select(researchSummaryColumns + ',result')
          .eq('owner_id', owner)
          .eq('id', path[1])
          .maybeSingle();
        if (result.error) throw researchStorageError(result.error);
        if (result.data === null) throw new DeskError(404, 'Research task not found.');
        return respond({ task: shapeResearchTask(result.data, owner, path[1]), ...envelope() });
      }
      const body = await bodyOf(request);
      const operation = path[1];
      let id: string, version: number, payload: Record<string, unknown>;
      if (operation === 'create') {
        const input = researchCreateInput(body);
        id = input.id;
        version = 0;
        payload = { question: input.question, scope: 'public_primary_sources' };
      } else if (operation === 'cancel') {
        const input = researchCancelInput(body);
        id = input.id;
        version = input.version;
        payload = { reason: input.reason };
      } else {
        const input = researchRetryInput(body);
        id = input.id;
        version = input.version;
        payload = {};
      }
      const result = await client.rpc('xiv_research_apply', {
        p_task_id: id,
        p_expected_version: version,
        p_action: operation,
        p_payload: payload,
      });
      if (result.error) throw researchStorageError(result.error);
      return respond({ task: shapeResearchTask(result.data, owner, id), ...envelope() });
    }
    if (request.method === 'POST' && action === 'reset-password') {
      const body = exact(await bodyOf(request), ['password']);
      const password = text(body.password, 1024);
      if (Array.from(password).length < 12)
        throw new DeskError(400, 'Use at least 12 characters for your new password.');
      const updated = await client.auth.updateUser({ password });
      if (updated.error) {
        if (updated.error.status === 422 || updated.error.status === 400)
          throw new DeskError(400, 'Choose a different password with at least 12 characters.');
        throw new DeskError(503, 'Your password could not be updated. Please try again.');
      }
      // The user submits this change. Keep the response truthful if provider
      // sign-out fails after the password was successfully updated.
      try {
        await client.auth.signOut({ scope: 'global' });
      } catch {
        /* Clear this browser below; other sessions may last until expiry. */
      }
      clearSessionCookies(request, context);
      return respond({ ok: true });
    }
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
