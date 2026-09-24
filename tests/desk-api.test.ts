import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleDesk, type DeskConfig, type DeskDependencies } from '../src/lib/desk/server';
import { DeskError, day, emptyState, exact, validateState } from '../src/lib/desk/contracts';

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const config: DeskConfig = {
  url: 'https://fixture.invalid',
  key: 'not-a-real-key',
  owner,
  origin: 'https://desk.example',
  secure: true,
};
const cardId = '33333333-3333-4333-8333-333333333333';
const note = '  SYNTHETIC: SPY calls.\nKeep the original text.  ';
function state() {
  return {
    ...emptyState(),
    cards: [{ id: cardId, raw: note, source: 'typed', filename: null, position: [0, 0, 110] }],
  };
}
function req(path: string, body?: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://desk.example/api/desk/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'X-XIV-Desk': '1',
      Origin: config.origin,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
function fixture(user: string | null = owner, member = true) {
  const calls: unknown[] = [];
  const reports = new Map<string, unknown>();
  let logout = 0,
    version = 1,
    saved: Record<string, unknown> = state();
  const client = {
    auth: {
      getUser: async () => ({ data: { user: user ? { id: user } : null }, error: null }),
      signInWithPassword: async () => ({ error: null }),
      resetPasswordForEmail: async (email: string, options: { redirectTo: string }) => {
        calls.push(['reset-start', email, options]);
        return { error: null as null | { status: number } };
      },
      exchangeCodeForSession: async (code: string, options?: { flowId: string }) => {
        calls.push(['reset-exchange', code, options]);
        return { error: null as null | { status: number } };
      },
      updateUser: async (attributes: { password: string }) => {
        calls.push(['reset-password', attributes]);
        return { error: null as null | { status: number } };
      },
      signOut: async () => {
        logout++;
        return { error: null };
      },
    },
    from(table: string) {
      const filters: Record<string, unknown> = {};
      const query = {
        select() {
          return query;
        },
        eq(name: string, value: unknown) {
          filters[name] = value;
          return query;
        },
        order() {
          return query;
        },
        limit() {
          return query;
        },
        async maybeSingle() {
          calls.push([table, { ...filters }]);
          if (table === 'xiv_desk_members')
            return { data: member ? { user_id: owner } : null, error: null };
          if (table === 'xiv_desk_days')
            return { data: { day: filters.day, revision: version, state: saved }, error: null };
          return {
            data: reports.has(String(filters.id))
              ? { body: reports.get(String(filters.id)) }
              : null,
            error: null,
          };
        },
        single() {
          return query.maybeSingle();
        },
        async insert(value: Record<string, unknown>) {
          calls.push(['insert', value]);
          if (value.owner_id !== owner) throw new Error('Wrong owner in write');
          if (reports.has(String(value.id))) return { error: { code: '23505' } };
          reports.set(String(value.id), value.body);
          return { error: null };
        },
        then(resolve: (value: unknown) => unknown) {
          return Promise.resolve({ data: [], error: null }).then(resolve);
        },
      };
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      calls.push([name, args]);
      if (args.p_revision !== version) return { error: { code: '40001' }, data: null };
      saved = args.p_state as Record<string, unknown>;
      version++;
      return { error: null, data: { day: args.p_day, revision: version, state: saved } };
    },
  };
  const deps: DeskDependencies = {
    config: () => config,
    context: () => ({ client: client as unknown as SupabaseClient, cookies: [] }),
  };
  return {
    deps,
    client,
    calls,
    reports,
    get logout() {
      return logout;
    },
  };
}
async function run(
  path: string,
  body?: unknown,
  f = fixture(),
  headers: Record<string, string> = {},
) {
  const response = await handleDesk(req(path, body, headers), path.split('/'), f.deps);
  return { response, data: await response.json(), fixture: f };
}
const draft = () => ({
  day: '2026-09-08',
  revision: 1,
  card: cardId,
  confirmed: true,
  input: {
    instrument: 'SPY',
    notes: note,
    sources: [],
    direction: 'long_call',
    entry_zone: '',
    invalidation: '',
  },
});

test('missing configuration fails closed without an authentication bypass', async () => {
  const response = await handleDesk(req('bootstrap'), ['bootstrap'], {
    config() {
      throw new DeskError(503, 'Connection needed');
    },
    context() {
      throw new Error('Must not run');
    },
  });
  assert.equal(response.status, 503);
  assert.match(response.headers.get('cache-control')!, /no-store/);
});
test('all private routes reject a missing user before querying notes', async () => {
  for (const path of ['bootstrap', 'state?day=2026-09-08', 'reports', 'report/' + '0'.repeat(64)]) {
    const f = fixture(null);
    const result = await run(path, undefined, f);
    assert.equal(result.response.status, 401);
    assert.equal(f.calls.length, 0);
    assert.equal(result.response.headers.get('Vercel-CDN-Cache-Control'), 'no-store');
  }
});
test('verified foreign identity and revoked member cannot access owner notes', async () => {
  for (const f of [fixture(other), fixture(owner, false)]) {
    const result = await run('save', { day: '2026-09-08', revision: 1, state: state() }, f);
    assert.equal(result.response.status, 403);
    assert.ok(!f.calls.some((v) => JSON.stringify(v).includes('xiv_desk_save')));
  }
});
test('origin and fetch marker are required even for a valid signed-in owner', async () => {
  const attempts: Record<string, string>[] = [
    { Origin: 'https://foreign.example' },
    { 'X-XIV-Desk': '' },
    { 'Sec-Fetch-Site': 'cross-site' },
    { Origin: '' },
  ];
  for (const headers of attempts) {
    const f = fixture();
    const result = await run(
      'save',
      { day: '2026-09-08', revision: 1, state: state() },
      f,
      headers,
    );
    assert.equal(result.response.status, 403);
    assert.equal(f.calls.length, 0);
  }
});
test('save/read use verified owner and return a newer persisted revision', async () => {
  const f = fixture(),
    changed = { ...state(), capture: 'Unsaved on another device until submitted' };
  const saved = await run('save', { day: '2026-09-08', revision: 1, state: changed }, f);
  assert.equal(saved.response.status, 200);
  assert.equal(saved.data.revision, 2);
  const response = await handleDesk(req('state?day=2026-09-08'), ['state'], f.deps);
  assert.deepEqual((await response.json()).state, changed);
  assert.ok(f.calls.some((v) => JSON.stringify(v).includes('"owner_id":"' + owner + '"')));
});
test('stale save is a conflict and leaves the newer data intact', async () => {
  const f = fixture();
  await run('save', { day: '2026-09-08', revision: 1, state: { ...state(), capture: 'newer' } }, f);
  const stale = await run(
    'save',
    { day: '2026-09-08', revision: 1, state: { ...state(), capture: 'stale' } },
    f,
  );
  assert.equal(stale.response.status, 409);
  assert.match(stale.data.error, /Export/);
  const response = await handleDesk(req('state?day=2026-09-08'), ['state'], f.deps);
  assert.equal((await response.json()).state.capture, 'newer');
});
test('foreign owner parameters, duplicate dates and malformed data are refused', async () => {
  const result = await run('save', {
    owner_id: other,
    day: '2026-09-08',
    revision: 1,
    state: state(),
  });
  assert.equal(result.response.status, 400);
  const response = await handleDesk(
    req('state?day=2026-09-08&day=2026-09-09'),
    ['state'],
    fixture().deps,
  );
  assert.equal(response.status, 400);
  assert.throws(() => day('2026-02-30'));
  assert.throws(() => day('0000-01-01'));
  for (const malformed of [
    { ...state(), camera: { rx: NaN, ry: 0, zoom: 1 } },
    { ...state(), cards: [...state().cards, ...state().cards] },
    { ...state(), capture: 'x'.repeat(20001) },
    { ...state(), extra: 'unknown' },
  ])
    assert.throws(() => validateState(malformed));
});
test('draft requires explicit confirmation, saved revision and exact raw notes', async () => {
  for (const body of [
    { ...draft(), confirmed: false },
    { ...draft(), revision: 0 },
    { ...draft(), input: { ...draft().input, notes: 'Changed' } },
    { ...draft(), card: other },
    { ...draft(), input: { ...draft().input, sources: ['invented'] } },
  ]) {
    const f = fixture();
    const result = await run('draft', body, f);
    assert.ok([400, 409].includes(result.response.status));
    assert.equal(f.reports.size, 0);
  }
});
test('object keys cannot alias joined field names and sources must be strings', () => {
  assert.throws(() => exact({ 'a|b': 1 }, ['a', 'b']));
  assert.throws(() =>
    validateState({ ...state(), cards: [{ ...state().cards[0], source: ['typed'] }] }),
  );
});
test('confirmed draft preserves original note and retry creates only one report', async () => {
  const f = fixture(),
    first = await run('draft', draft(), f),
    second = await run('draft', draft(), f);
  assert.equal(first.response.status, 200);
  assert.equal(second.data.id, first.data.id);
  assert.equal(f.reports.size, 1);
  assert.equal(first.data.report.capture.raw, note);
  assert.match(first.data.display, /not independently verified/);
  const opened = await run('report/' + first.data.id, undefined, f);
  assert.match(opened.data.display, /SAVED SNAPSHOT/);
});
test('login of a verified non-owner signs the new session back out', async () => {
  const f = fixture(other),
    result = await run(
      'login',
      { email: 'synthetic@example.invalid', password: 'not-a-real-password' },
      f,
    );
  assert.equal(result.response.status, 403);
  assert.equal(f.logout, 1);
});
test('logout clears HttpOnly cookies even if the auth provider fails', async () => {
  const f = fixture();
  f.client.auth.signOut = async () => {
    throw new Error('Synthetic outage');
  };
  const result = await run('logout', {}, f, {
    Cookie: 'xiv-private-desk.0=synthetic;xiv-private-desk.1=synthetic',
  });
  assert.equal(result.response.status, 200);
  const cookies = result.response.headers.get('set-cookie')!;
  assert.match(cookies, /Max-Age=0/);
  assert.match(cookies, /HttpOnly/);
  assert.match(cookies, /Secure/);
  assert.match(cookies, /SameSite=strict/);
});
test('historical data routes never fall back to the local trade store', async () => {
  for (const path of ['history', 'quant', 'review']) {
    const f = fixture(),
      result = await run(path, {}, f);
    assert.equal(result.response.status, 501);
    assert.equal(f.calls.length, 1);
  }
});

test('password reset requests use a fixed redirect and reveal no private records', async () => {
  const f = fixture(null);
  const result = await run('reset-start', { email: 'synthetic@example.invalid' }, f);
  assert.equal(result.response.status, 200);
  assert.equal(result.data.ok, true);
  assert.match(result.data.message, /If this email/);
  assert.deepEqual(f.calls, [
    [
      'reset-start',
      'synthetic@example.invalid',
      {
        redirectTo: 'https://desk.example/desk/recover',
      },
    ],
  ]);
  assert.match(result.response.headers.get('cache-control')!, /no-store/);
  for (const body of [
    { email: 'synthetic@example.invalid', redirectTo: 'https://foreign.invalid' },
    { email: 'invalid' },
  ]) {
    const blocked = fixture(null);
    assert.equal((await run('reset-start', body, blocked)).response.status, 400);
    assert.equal(blocked.calls.length, 0);
  }
});

test('all recovery actions reject cross-site requests before invoking auth', async () => {
  for (const [action, body] of [
    ['reset-start', { email: 'synthetic@example.invalid' }],
    ['reset-exchange', { code: 'synthetic-code' }],
    ['reset-password', { password: 'a-synthetic-new-password' }],
  ] as const) {
    const attempts: Record<string, string>[] = [
      { Origin: 'https://foreign.invalid' },
      { 'X-XIV-Desk': '' },
    ];
    for (const headers of attempts) {
      const f = fixture();
      assert.equal((await run(action, body, f, headers)).response.status, 403);
      assert.equal(f.calls.length, 0);
    }
  }
});

test('recovery respects mail rate limits and reports provider failures honestly', async () => {
  for (const [providerStatus, expectedStatus] of [
    [429, 429],
    [500, 503],
  ]) {
    const f = fixture(null);
    f.client.auth.resetPasswordForEmail = async () => ({ error: { status: providerStatus } });
    const result = await run('reset-start', { email: 'synthetic@example.invalid' }, f);
    assert.equal(result.response.status, expectedStatus);
    assert.equal(result.data.ok, undefined);
  }
});

test('recovery exchanges a code through the provider then verifies owner and membership', async () => {
  const accepted = await run('reset-exchange', {
    code: 'synthetic-code',
    flowId: 'synthetic-flow-id',
  });
  assert.equal(accepted.response.status, 200);
  assert.deepEqual(accepted.fixture.calls[0], [
    'reset-exchange',
    'synthetic-code',
    { flowId: 'synthetic-flow-id' },
  ]);
  for (const f of [fixture(other), fixture(owner, false), fixture(null)]) {
    const result = await run('reset-exchange', { code: 'synthetic-code' }, f);
    assert.ok([401, 403].includes(result.response.status));
    assert.equal(f.logout, 1);
    assert.ok(!f.calls.some((call) => JSON.stringify(call).includes('xiv_desk_days')));
  }
  const expired = fixture();
  expired.client.auth.exchangeCodeForSession = async () => ({ error: { status: 400 } });
  assert.equal(
    (await run('reset-exchange', { code: 'expired-code' }, expired)).response.status,
    401,
  );
  assert.equal(expired.calls.length, 0);
});

test('recovery rejects malformed codes and arbitrary exchange fields', async () => {
  for (const body of [
    { code: '' },
    { code: 'has whitespace' },
    { code: 'x', flowId: 'bad' },
    { code: 'x', owner_id: owner },
    { code: 'x', redirectTo: 'https://foreign.invalid' },
  ]) {
    const f = fixture();
    assert.equal((await run('reset-exchange', body, f)).response.status, 400);
    assert.equal(f.calls.length, 0);
  }
});

test('only the verified enabled owner can submit a new password', async () => {
  for (const f of [fixture(null), fixture(other), fixture(owner, false)]) {
    const result = await run('reset-password', { password: 'synthetic-new-password' }, f);
    assert.ok([401, 403].includes(result.response.status));
    assert.ok(!f.calls.some((call) => JSON.stringify(call).includes('reset-password')));
  }
  for (const body of [
    { password: 'too-short' },
    { password: 'x'.repeat(1025) },
    { password: 'synthetic-new-password', email: 'different@example.invalid' },
  ]) {
    const f = fixture();
    assert.equal((await run('reset-password', body, f)).response.status, 400);
    assert.ok(!f.calls.some((call) => JSON.stringify(call).includes('reset-password')));
  }
});

test('successful password reset clears browser cookies even if global sign-out fails', async () => {
  const f = fixture();
  f.client.auth.signOut = async () => {
    throw new Error('Synthetic sign-out outage');
  };
  const result = await run('reset-password', { password: 'synthetic-new-password' }, f, {
    Cookie: 'xiv-private-desk.0=synthetic;xiv-private-desk.1=synthetic',
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.data.ok, true);
  assert.deepEqual(f.calls[1], ['reset-password', { password: 'synthetic-new-password' }]);
  assert.ok(!JSON.stringify(result.data).includes('synthetic-new-password'));
  const cookies = result.response.headers.get('set-cookie')!;
  for (const pattern of [/Max-Age=0/, /HttpOnly/, /Secure/, /SameSite=strict/])
    assert.match(cookies, pattern);
});

test('password rejection preserves the session and never reports successful reset', async () => {
  const f = fixture();
  f.client.auth.updateUser = async () => ({ error: { status: 422 } });
  const result = await run('reset-password', { password: 'synthetic-new-password' }, f);
  assert.equal(result.response.status, 400);
  assert.equal(f.logout, 0);
  assert.equal(result.data.ok, undefined);
});

test('logout and password reset clear newly queued cookie chunks and PKCE state', async () => {
  for (const [action, body] of [
    ['logout', {}],
    ['reset-password', { password: 'synthetic-new-password' }],
  ] as const) {
    const f = fixture();
    const base = f.deps.context;
    f.deps.context = (request, settings) => ({
      ...base(request, settings),
      cookies: [
        { name: 'xiv-private-desk.2', value: 'new-synthetic-chunk', options: {} },
        { name: 'xiv-private-desk-code-verifier', value: 'synthetic-verifier', options: {} },
      ],
    });
    const result = await run(action, body, f, { Cookie: 'xiv-private-desk.0=old-synthetic' });
    assert.equal(result.response.status, 200);
    for (const name of [
      'xiv-private-desk.0',
      'xiv-private-desk.2',
      'xiv-private-desk-code-verifier',
    ]) {
      const cookie = result.response.cookies.get(name);
      assert.equal(cookie?.value, '');
      assert.equal(cookie?.maxAge, 0);
    }
  }
});

test('real SSR SDK persists a browser-bound PKCE verifier during reset request without network', async () => {
  let providerCalls = 0;
  const pending: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const client = createServerClient(config.url, config.key, {
    cookieOptions: {
      name: 'xiv-private-desk',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    },
    cookies: {
      getAll: () => [],
      setAll: (values) => {
        pending.push(...values);
      },
    },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        assert.equal(url.origin, 'https://fixture.invalid');
        assert.equal(url.pathname, '/auth/v1/recover');
        assert.equal(url.searchParams.get('redirect_to'), 'https://desk.example/desk/recover');
        assert.equal(init?.method, 'POST');
        const payload = JSON.parse(String(init?.body));
        assert.equal(payload.email, 'synthetic@example.invalid');
        assert.equal(payload.code_challenge_method, 's256');
        assert.match(payload.code_challenge, /^[A-Za-z0-9_-]{43}$/);
        providerCalls++;
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
      },
    },
  });
  const response = await handleDesk(
    req('reset-start', { email: 'synthetic@example.invalid' }),
    ['reset-start'],
    {
      config: () => config,
      context: () => ({ client, cookies: pending }),
    },
  );
  assert.equal(response.status, 200);
  assert.equal(providerCalls, 1);
  const cookies = response.cookies.getAll();
  assert.ok(cookies.some((cookie) => cookie.name.startsWith('xiv-private-desk-code-verifier')));
  for (const cookie of cookies) {
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, 'strict');
  }
  assert.ok(!JSON.stringify(await response.json()).includes('code_verifier'));
});
