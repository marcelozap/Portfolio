import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleDesk, type DeskConfig, type DeskDependencies } from '../src/lib/desk/server';
import {
  bridgeStatus,
  parseBridgeDescriptor,
  XIV_BRIDGE_STOP,
} from '../src/lib/desk/bridge-contracts';

// Synthetic injected SDK responses only: no SQL, environment, network, or provider calls.
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const bridgeId = 'aaaaaaaa-3333-4333-8333-333333333333';
const otherId = 'bbbbbbbb-4444-4444-8444-444444444444';
const hash = 'a'.repeat(64);
const token = 'b'.repeat(64);
const session = 'codex:synthetic_browser_bridge';
const now = Date.now();
const createdAt = new Date(now - 60000).toISOString();
const expiresAt = new Date(now + 3600000).toISOString();
const stop = '2026-09-19T23:52:32Z';
const day = 86400000;
const metadataKeys = [
  'id',
  'session',
  'created_at',
  'expires_at',
  'revoked_at',
  'last_seen_at',
].sort();
const config: DeskConfig = {
  url: 'https://fixture.invalid',
  key: 'not-a-real-key',
  owner,
  origin: 'https://desk.example',
  secure: true,
};
function descriptor(overrides: Record<string, unknown> = {}) {
  return { id: bridgeId, session, token_sha256: hash, expires_at: expiresAt, ...overrides };
}
function metadata(overrides: Record<string, unknown> = {}) {
  return {
    id: bridgeId,
    session,
    created_at: createdAt,
    expires_at: expiresAt,
    revoked_at: null,
    last_seen_at: null,
    owner_id: owner,
    token_sha256: hash,
    token,
    private_debug: 'SYNTHETIC-PRIVATE-METADATA',
    ...overrides,
  };
}
type ProviderError = { code: string; message: string; details?: string; hint?: string };
function fixture(user: string | null = owner, member = true) {
  const queries: Array<{ table: string; columns: string; filters: Array<[string, unknown]> }> = [];
  const rpcs: Array<{ name: string; args: Record<string, unknown> }> = [];
  const state = {
    rows: [metadata()] as unknown,
    rpcData: undefined as unknown,
    rpcError: null as ProviderError | null,
    rpcThrow: null as unknown,
    rpcEnvelope: null as { value: unknown } | null,
    authError: false,
    memberError: false,
  };
  let authentications = 0;
  const client = {
    auth: {
      async getUser() {
        authentications++;
        return {
          data: { user: user ? { id: user } : null },
          error: state.authError ? { message: 'SYNTHETIC-PRIVATE-AUTH' } : null,
        };
      },
    },
    from(table: string) {
      assert.equal(table, 'xiv_desk_members', 'Bridge APIs must use RPCs instead of table reads.');
      const call = { table, columns: '', filters: [] as Array<[string, unknown]> };
      queries.push(call);
      const query = {
        select(columns: string) {
          call.columns = columns;
          return query;
        },
        eq(name: string, value: unknown) {
          call.filters.push([name, value]);
          return query;
        },
        async maybeSingle() {
          return {
            data: member ? { user_id: owner } : null,
            error: state.memberError ? { message: 'SYNTHETIC-PRIVATE-MEMBERSHIP' } : null,
          };
        },
      };
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      rpcs.push({ name, args });
      if (state.rpcThrow !== null) throw state.rpcThrow;
      if (state.rpcEnvelope !== null) return state.rpcEnvelope.value;
      const value =
        name === 'xiv_research_bridge_list'
          ? state.rows
          : name === 'xiv_research_bridge_register'
            ? metadata({
                id: args.p_bridge_id,
                session: args.p_session,
                expires_at: args.p_expires_at,
              })
            : metadata({ id: args.p_bridge_id, revoked_at: new Date(now).toISOString() });
      return {
        data: state.rpcData === undefined ? value : state.rpcData,
        error: state.rpcError,
      };
    },
  };
  const deps: DeskDependencies = {
    config: () => config,
    context: () => ({ client: client as unknown as SupabaseClient, cookies: [] }),
  };
  return {
    deps,
    state,
    queries,
    rpcs,
    get authentications() {
      return authentications;
    },
  };
}
function request(path: string, body?: unknown, headers: Record<string, string> = {}) {
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
async function run(
  path = 'research/bridges',
  body?: unknown,
  f = fixture(),
  headers: Record<string, string> = {},
) {
  const response = await handleDesk(
    request(path, body, headers),
    path.split('?')[0].split('/'),
    f.deps,
  );
  return { response, data: await response.json(), fixture: f };
}
function noPrivateData(data: unknown) {
  const text = JSON.stringify(data);
  for (const secret of [owner, hash, token, 'token_sha256', 'SYNTHETIC-PRIVATE', 'private_debug'])
    assert.ok(!text.includes(secret), 'Private value in API response: ' + secret);
}
function safeFailure(data: Record<string, unknown>) {
  assert.deepEqual(Object.keys(data), ['error']);
  assert.equal(typeof data.error, 'string');
  noPrivateData(data);
}
function envelope(data: Record<string, unknown>, kind: 'bridge' | 'bridges') {
  assert.deepEqual(Object.keys(data).sort(), [kind, 'server_time'].sort());
  assert.equal(typeof data.server_time, 'string');
  assert.ok(Math.abs(Date.now() - Date.parse(data.server_time as string)) < 60000);
  noPrivateData(data);
}
function privateResponse(response: Response) {
  assert.match(response.headers.get('cache-control')!, /private.*no-store/);
  assert.equal(response.headers.get('CDN-Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), 'no-store');
  assert.equal(response.headers.get('vary'), 'Cookie');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('x-robots-tag')!, /noindex/);
}
function uncertainWrite(data: Record<string, unknown>) {
  safeFailure(data);
  assert.match(data.error as string, /bridge/i);
  assert.match(data.error as string, /read|reload|refresh|check|review|list/i);
  assert.match(data.error as string, /retry|again/i);
}
const routes: Array<[string, unknown?]> = [
  ['research/bridges'],
  ['research/bridges/register', descriptor()],
  ['research/bridges/revoke', { id: bridgeId }],
];

test('bridge routes require a verified enabled owner before any capability RPC', async () => {
  for (const [path, body] of routes) {
    for (const [f, status] of [
      [fixture(null), 401],
      [fixture(other), 403],
      [fixture(owner, false), 403],
    ] as const) {
      const denied = await run(path, body, f);
      assert.equal(denied.response.status, status, path);
      assert.equal(f.rpcs.length, 0);
      safeFailure(denied.data);
      privateResponse(denied.response);
    }
  }
  for (const [key, status] of [
    ['authError', 401],
    ['memberError', 503],
  ] as const) {
    const f = fixture();
    f.state[key] = true;
    const denied = await run('research/bridges', undefined, f);
    assert.equal(denied.response.status, status);
    assert.equal(f.rpcs.length, 0);
    safeFailure(denied.data);
  }
});

test('origin and fetch protections reject bridge requests before contacting authentication', async () => {
  for (const [path, body] of routes) {
    const invalid: Record<string, string>[] = [
      { Origin: 'https://foreign.example' },
      { 'X-XIV-Desk': '' },
      { 'Sec-Fetch-Site': 'cross-site' },
      ...(body === undefined ? [] : [{ Origin: '' }]),
    ];
    for (const headers of invalid) {
      const f = fixture();
      const denied = await run(path, body, f, headers);
      assert.equal(denied.response.status, 403);
      assert.equal(f.authentications, 0);
      assert.equal(f.rpcs.length, 0);
      safeFailure(denied.data);
    }
  }
});

test('bridge listing uses only the owner RPC and returns metadata without capability material', async () => {
  for (const rows of [
    [],
    [metadata(), metadata({ id: otherId, session: 'claude:synthetic_other_bridge' })],
  ]) {
    const f = fixture();
    f.state.rows = rows;
    const page = await run('research/bridges', undefined, f);
    assert.equal(page.response.status, 200);
    assert.deepEqual(f.rpcs, [{ name: 'xiv_research_bridge_list', args: {} }]);
    assert.deepEqual(f.queries, [
      {
        table: 'xiv_desk_members',
        columns: 'user_id',
        filters: [
          ['user_id', owner],
          ['enabled', true],
        ],
      },
    ]);
    envelope(page.data, 'bridges');
    assert.equal(page.data.bridges.length, rows.length);
    for (const row of page.data.bridges) assert.deepEqual(Object.keys(row).sort(), metadataKeys);
    privateResponse(page.response);
  }
});

test('invalid list responses and duplicate bridge identities fail closed', async () => {
  for (const rows of [
    null,
    {},
    'SYNTHETIC-PRIVATE-METADATA',
    [null],
    [metadata(), metadata()],
    [metadata(), metadata({ id: bridgeId, session: 'claude:synthetic_duplicate' })],
  ]) {
    const f = fixture();
    f.state.rows = rows;
    const failed = await run('research/bridges', undefined, f);
    assert.equal(failed.response.status, 503);
    safeFailure(failed.data);
    assert.equal(failed.data.bridges, undefined);
  }
});

test('registration sends the exact descriptor RPC and strips hash and token fields from its response', async () => {
  for (const expires_at of [expiresAt, expiresAt.replace(/\.\d{3}Z$/, 'Z')]) {
    const body = descriptor({ expires_at });
    const f = fixture();
    const registered = await run('research/bridges/register', body, f);
    assert.equal(registered.response.status, 200);
    assert.deepEqual(f.rpcs, [
      {
        name: 'xiv_research_bridge_register',
        args: {
          p_bridge_id: bridgeId,
          p_session: session,
          p_token_sha256: hash,
          p_expires_at: expires_at,
        },
      },
    ]);
    envelope(registered.data, 'bridge');
    assert.deepEqual(Object.keys(registered.data.bridge).sort(), metadataKeys);
    assert.equal(registered.data.bridge.id, bridgeId);
    assert.equal(registered.data.bridge.session, session);
    assert.equal(Date.parse(registered.data.bridge.expires_at), Date.parse(expires_at));
    privateResponse(registered.response);
  }
});

test('registration rejects malformed descriptors and additional fields before an RPC', async () => {
  const bodies: unknown[] = [
    null,
    [],
    {},
    { id: bridgeId, session, token_sha256: hash },
    ...[bridgeId.toUpperCase(), bridgeId + '\n', null, 'bad'].map((id) => descriptor({ id })),
    ...[null, '', 'codex:short', session + '\n', 'codex:has spaces', 'other:synthetic_bridge'].map(
      (session) => descriptor({ session }),
    ),
    ...[null, token.toUpperCase(), 'a'.repeat(63), hash + '\n'].map((token_sha256) =>
      descriptor({ token_sha256 }),
    ),
    ...[
      null,
      'not-a-date',
      new Date(now - 1).toISOString(),
      '2026-09-19T23:52:32.001Z',
      expiresAt.replace('Z', '+00:00'),
    ].map((expires_at) => descriptor({ expires_at })),
    ...[
      ['owner_id', owner],
      ['token', token],
      ['bearer_token', token],
      ['created_at', createdAt],
      ['revoked_at', null],
      ['role', 'worker'],
      ['id|session', 'Joined keys'],
    ].map(([key, value]) => descriptor({ [String(key)]: value })),
  ];
  for (const body of bodies) {
    const f = fixture();
    const failed = await run('research/bridges/register', body, f);
    assert.equal(failed.response.status, 400);
    assert.equal(f.rpcs.length, 0);
    safeFailure(failed.data);
  }
});

test('revocation uses exactly one bridge identity and requires a revoked matching response', async () => {
  const f = fixture();
  const revoked = await run('research/bridges/revoke', { id: bridgeId }, f);
  assert.equal(revoked.response.status, 200);
  assert.deepEqual(f.rpcs, [
    { name: 'xiv_research_bridge_revoke', args: { p_bridge_id: bridgeId } },
  ]);
  envelope(revoked.data, 'bridge');
  assert.deepEqual(Object.keys(revoked.data.bridge).sort(), metadataKeys);
  assert.ok(Number.isFinite(Date.parse(revoked.data.bridge.revoked_at)));
  for (const body of [
    null,
    [],
    {},
    { id: bridgeId.toUpperCase() },
    { id: bridgeId + '\n' },
    { id: bridgeId, token },
    { id: bridgeId, owner_id: owner },
  ]) {
    const invalid = fixture();
    const failed = await run('research/bridges/revoke', body, invalid);
    assert.equal(failed.response.status, 400);
    assert.equal(invalid.rpcs.length, 0);
    safeFailure(failed.data);
  }
  for (const row of [metadata(), metadata({ id: otherId, revoked_at: createdAt })]) {
    const invalid = fixture();
    invalid.state.rpcData = row;
    const failed = await run('research/bridges/revoke', { id: bridgeId }, invalid);
    assert.equal(failed.response.status, 503);
    uncertainWrite(failed.data);
  }
});

test('all bridge routes reject unknown and duplicate query parameters before RPC calls', async () => {
  for (const [path, body] of routes) {
    for (const query of [
      'offset=0',
      'owner_id=' + owner,
      'id=x&id=y',
      'token=' + token,
      'offset=0&%6fffset=0',
    ]) {
      const f = fixture();
      const failed = await run(path + '?' + query, body, f);
      assert.equal(failed.response.status, 400);
      assert.equal(f.rpcs.length, 0);
      safeFailure(failed.data);
    }
  }
});

test('unsupported bridge subroutes and worker actions never invoke bridge RPCs', async () => {
  for (const path of [
    'research/bridges/read',
    'research/bridges/apply',
    'research/bridges/claim',
    'research/bridges/renew',
    'research/bridges/complete',
    'research/bridges/block',
    'research/bridges/register/extra',
    'research/bridges/' + bridgeId,
  ]) {
    for (const body of [undefined, { id: bridgeId, token }]) {
      const f = fixture();
      const failed = await run(path, body, f);
      assert.equal(failed.response.status, 404, path);
      assert.equal(f.rpcs.length, 0);
      safeFailure(failed.data);
    }
  }
  for (const [path, body] of [
    ['research/bridges', {}],
    ['research/bridges/register', undefined],
    ['research/bridges/revoke', undefined],
  ] as const) {
    const f = fixture();
    assert.equal((await run(path, body, f)).response.status, 404);
    assert.equal(f.rpcs.length, 0);
  }
  const f = fixture();
  const response = await handleDesk(
    new NextRequest('https://desk.example/api/desk/research/bridges/register', {
      method: 'PUT',
      headers: { 'X-XIV-Desk': '1', Origin: config.origin },
    }),
    ['research', 'bridges', 'register'],
    f.deps,
  );
  assert.equal(response.status, 405);
  assert.equal(f.authentications, 0);
});

test('SQL failures use safe HTTP codes and conflicts advise re-reading bridge state', async () => {
  for (const [path, body] of routes) {
    for (const [code, status] of [
      ['40001', 409],
      ['42501', 403],
      ['22023', 400],
      ['XX000', 503],
    ] as const) {
      const f = fixture();
      f.state.rpcError = {
        code,
        message: 'SYNTHETIC-PRIVATE-SQL ' + token,
        details: hash,
        hint: owner,
      };
      const failed = await run(path, body, f);
      assert.equal(failed.response.status, status);
      safeFailure(failed.data);
      if (status === 409) assert.match(failed.data.error, /read|reload|refresh|check|review|list/i);
      if (status === 503 && body !== undefined) uncertainWrite(failed.data);
      privateResponse(failed.response);
    }
  }
});

test('uncertain writes never claim success and direct the owner to inspect bridges before retrying', async () => {
  for (const [path, body] of routes.filter((route) => route[1] !== undefined)) {
    for (const mode of ['throw', 'null', 'array', 'string']) {
      const f = fixture();
      if (mode === 'throw')
        f.state.rpcThrow = new Error('SYNTHETIC-PRIVATE-PROVIDER ' + hash + token);
      else
        f.state.rpcData =
          mode === 'null' ? null : mode === 'array' ? [] : 'SYNTHETIC-PRIVATE-RESULT';
      const failed = await run(path, body, f);
      assert.equal(failed.response.status, 503);
      uncertainWrite(failed.data);
      assert.equal(f.rpcs.length, 1);
    }
    for (const value of [undefined, null, [], 42, 'SYNTHETIC-PRIVATE-RPC-ENVELOPE', {}]) {
      const f = fixture();
      f.state.rpcEnvelope = { value };
      const failed = await run(path, body, f);
      assert.equal(failed.response.status, 503);
      uncertainWrite(failed.data);
      assert.equal(f.rpcs.length, 1);
    }
  }
  const f = fixture();
  f.state.rpcThrow = new Error('SYNTHETIC-PRIVATE-PROVIDER');
  const failed = await run('research/bridges', undefined, f);
  assert.equal(failed.response.status, 503);
  safeFailure(failed.data);
});

test('registration verifies returned identity, session and expiry down to microseconds', async () => {
  for (const overrides of [
    { id: otherId },
    { session: 'claude:synthetic_different_bridge' },
    { expires_at: new Date(Date.parse(expiresAt) + 1).toISOString() },
    { expires_at: expiresAt.replace(/(\.\d{3})Z$/, '$1001Z') },
  ]) {
    const f = fixture();
    f.state.rpcData = metadata(overrides);
    const failed = await run('research/bridges/register', descriptor(), f);
    assert.equal(failed.response.status, 503);
    uncertainWrite(failed.data);
  }
  const f = fixture();
  f.state.rpcData = metadata({ expires_at: expiresAt.replace(/(\.\d{3})Z$/, '$1000+00:00') });
  const sameInstant = await run('research/bridges/register', descriptor(), f);
  assert.equal(sameInstant.response.status, 200);
  envelope(sameInstant.data, 'bridge');
});

test('metadata rejects invalid fields, impossible calendars and inconsistent lifecycle times', async () => {
  const invalid = [
    { id: bridgeId.toUpperCase() },
    { id: bridgeId + '\n' },
    { session: session + '\n' },
    { session: 'other:synthetic_session' },
    { created_at: undefined },
    { created_at: null },
    { created_at: '2026-02-30T00:00:00Z' },
    { created_at: '0000-01-01T00:00:00Z' },
    { created_at: '2026-09-08T24:00:00Z' },
    { created_at: createdAt + '\n' },
    { created_at: createdAt.replace('Z', '-04:00') },
    { expires_at: createdAt },
    { expires_at: new Date(Date.parse(createdAt) - 1).toISOString() },
    { created_at: '2026-08-01T00:00:00Z', expires_at: '2026-08-15T00:00:00.001Z' },
    { expires_at: '2026-09-19T23:52:32.000001Z' },
    { revoked_at: undefined },
    { revoked_at: 'not-a-date' },
    { revoked_at: new Date(Date.parse(createdAt) - 1).toISOString() },
    { last_seen_at: undefined },
    { last_seen_at: '2026-09-08T12:00:60Z' },
    { last_seen_at: new Date(Date.parse(createdAt) - 1).toISOString() },
    { revoked_at: createdAt, last_seen_at: expiresAt },
    {
      created_at: '2026-09-08T00:00:00.000002Z',
      revoked_at: '2026-09-08T00:00:00.000001Z',
    },
    {
      created_at: '2026-09-08T00:00:00.000002Z',
      last_seen_at: '2026-09-08T00:00:00.000001Z',
    },
  ];
  for (const overrides of invalid) {
    const f = fixture();
    f.state.rows = [metadata(overrides)];
    const failed = await run('research/bridges', undefined, f);
    assert.equal(failed.response.status, 503, JSON.stringify(overrides));
    safeFailure(failed.data);
  }
});

test('metadata accepts SQL UTC precision and lifecycle observations later than expiration', async () => {
  for (const fraction of ['', '.1', '.12', '.123', '.1234', '.12345', '.123456']) {
    for (const zone of ['Z', '+00:00']) {
      const f = fixture();
      f.state.rows = [
        metadata({
          created_at: `2026-09-08T00:00:00${fraction}${zone}`,
          expires_at: '2026-09-08T01:00:00Z',
          revoked_at: '2026-09-09T00:00:00Z',
          last_seen_at: '2026-09-08T01:00:00.000001Z',
        }),
      ];
      const accepted = await run('research/bridges', undefined, f);
      assert.equal(accepted.response.status, 200);
      assert.equal(accepted.data.bridges[0].revoked_at, '2026-09-09T00:00:00Z');
      assert.equal(accepted.data.bridges[0].last_seen_at, '2026-09-08T01:00:00.000001Z');
      envelope(accepted.data, 'bridges');
    }
  }
});

test('browser descriptor parsing preserves exact canonical fields and enforces stable expiry boundaries', () => {
  const stableNow = Date.parse('2026-09-01T00:00:00.000Z');
  for (const value of [
    descriptor({ expires_at: '2026-09-01T00:00:01Z', session: 'codex:' + 'a'.repeat(8) }),
    descriptor({ expires_at: '2026-09-15T00:00:00.000Z', session: 'claude:' + 'a'.repeat(128) }),
  ])
    assert.deepEqual(parseBridgeDescriptor(value, stableNow), value);
  for (const expires_at of [
    '2026-09-01T00:00:00Z',
    '2026-08-31T23:59:59.999Z',
    '2026-09-15T00:00:00.001Z',
  ])
    assert.throws(() => parseBridgeDescriptor(descriptor({ expires_at }), stableNow));
  const nearDeadline = Date.parse(stop) - day;
  assert.deepEqual(
    parseBridgeDescriptor(descriptor({ expires_at: stop }), nearDeadline),
    descriptor({ expires_at: stop }),
  );
  assert.throws(() =>
    parseBridgeDescriptor(descriptor({ expires_at: '2026-09-19T23:52:32.001Z' }), nearDeadline),
  );
  assert.equal(Date.parse(String(XIV_BRIDGE_STOP)), Date.parse(stop));
});

test('browser descriptor parsing rejects normalization, control characters and noncanonical expiry formats', () => {
  const stableNow = Date.parse('2026-09-01T00:00:00Z');
  const valid = descriptor({ expires_at: '2026-09-08T00:00:00Z' });
  for (const value of [
    { ...valid, id: bridgeId.toUpperCase() },
    { ...valid, id: bridgeId + '\n' },
    { ...valid, session: ' codex:synthetic_session' },
    { ...valid, session: 'codex:synthetic_\u0000_session' },
    { ...valid, session: 'codex:synthetic_é_session' },
    { ...valid, session: 'codex:' + 'a'.repeat(129) },
    { ...valid, token_sha256: hash.toUpperCase() },
    { ...valid, token_sha256: hash + '\n' },
    { ...valid, token },
    ...[
      '2026-09-08T00:00:00.1Z',
      '2026-09-08T00:00:00.12Z',
      '2026-09-08T00:00:00.1234Z',
      '2026-09-08T00:00:00.123456Z',
      '2026-09-08T00:00:00+00:00',
      '2026-09-08T00:00:00z',
      '2026-09-08T00:00:00Z\n',
      '2026-09-08 00:00:00Z',
      '2026-02-30T00:00:00Z',
    ].map((expires_at) => ({ ...valid, expires_at })),
  ])
    assert.throws(() => parseBridgeDescriptor(value, stableNow));
});

test('bridge status gives revocation priority and treats the expiration instant as expired', () => {
  const bridge = metadata({
    created_at: '2026-09-08T00:00:00Z',
    expires_at: '2026-09-09T00:00:00Z',
  });
  assert.equal(bridgeStatus(bridge, Date.parse('2026-09-08T23:59:59.999Z')), 'approved');
  assert.equal(bridgeStatus(bridge, Date.parse('2026-09-09T00:00:00Z')), 'expired');
  assert.equal(bridgeStatus(bridge, Date.parse('2026-09-10T00:00:00Z')), 'expired');
  const revoked = metadata({ ...bridge, revoked_at: '2026-09-08T01:00:00Z' });
  assert.equal(bridgeStatus(revoked, Date.parse('2026-09-08T02:00:00Z')), 'revoked');
  assert.equal(bridgeStatus(revoked, Date.parse('2026-09-10T00:00:00Z')), 'revoked');
  assert.equal(bridgeStatus(metadata()), 'approved');
  const submillisecond = metadata({ expires_at: '2026-09-09T00:00:00.000001Z' });
  assert.equal(bridgeStatus(submillisecond, Date.parse('2026-09-09T00:00:00.000Z')), 'approved');
  assert.equal(bridgeStatus(submillisecond, Date.parse('2026-09-09T00:00:00.001Z')), 'expired');
});

test('success and uncertain failures preserve strict cookies and private cache headers', async () => {
  for (const fail of [false, true]) {
    const f = fixture();
    const base = f.deps.context;
    f.deps.context = (request, settings) => ({
      ...base(request, settings),
      cookies: [
        {
          name: 'xiv-private-desk.0',
          value: 'synthetic-refreshed-cookie',
          options: { httpOnly: false, secure: false, sameSite: 'lax', path: '/wrong-path' },
        },
      ],
    });
    if (fail) f.state.rpcThrow = new Error('SYNTHETIC-PRIVATE-PROVIDER');
    const saved = await run('research/bridges/register', descriptor(), f);
    assert.equal(saved.response.status, fail ? 503 : 200);
    privateResponse(saved.response);
    noPrivateData(saved.data);
    const cookie = saved.response.cookies.get('xiv-private-desk.0');
    assert.equal(cookie?.httpOnly, true);
    assert.equal(cookie?.secure, true);
    assert.equal(cookie?.sameSite, 'strict');
    assert.equal(cookie?.path, '/');
  }
});
