import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleDesk, type DeskConfig, type DeskDependencies } from '../src/lib/desk/server';

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const taskId = 'aaaaaaaa-3333-4333-8333-333333333333';
const claimId = 'bbbbbbbb-4444-4444-8444-444444444444';
const instant = '2026-09-08T12:00:00.000Z';
const question = '  SYNTHETIC: What does the published filing say?\nPreserve this wording.  ';
const config: DeskConfig = {
  url: 'https://fixture.invalid',
  key: 'not-a-real-key',
  owner,
  origin: 'https://desk.example',
  secure: true,
};
const summaryKeys = [
  'id',
  'question',
  'scope',
  'role',
  'version',
  'status',
  'created_at',
  'updated_at',
  'worker_session',
  'claimed_at',
  'lease_expires_at',
  'completed_at',
  'blocked_reason',
  'cancel_reason',
].sort();
function task(overrides: Record<string, unknown> = {}) {
  return {
    owner_id: owner,
    id: taskId,
    question,
    scope: 'public_primary_sources',
    role: 'research_analyst',
    version: 1,
    status: 'queued',
    created_at: instant,
    updated_at: instant,
    worker_session: null,
    claim_id: null,
    claimed_at: null,
    lease_expires_at: null,
    completed_at: null,
    blocked_reason: null,
    cancel_reason: null,
    result: null,
    internal_debug: 'SYNTHETIC-PRIVATE-ROW-FIELD',
    ...overrides,
  };
}
function result(overrides: Record<string, unknown> = {}) {
  return {
    text: 'SYNTHETIC: The primary source describes the published process.',
    sources: [
      {
        url: 'https://primary.example:443/filing/%E2%9C%93?section=1#notes',
        title: 'Synthetic primary filing',
        retrieved_at: '2026-09-08T11:59:59.123456Z',
      },
    ],
    limitations: 'Synthetic test evidence only; no source was fetched.',
    ...overrides,
  };
}
const claimed = {
  version: 2,
  worker_session: 'codex:synthetic_session',
  claim_id: claimId,
  claimed_at: instant,
};
function completed(overrides: Record<string, unknown> = {}) {
  return task({
    ...claimed,
    version: 3,
    status: 'completed',
    completed_at: instant,
    result: result(),
    ...overrides,
  });
}
type DbError = { code: string; message: string; details?: string; hint?: string };
type QueryCall = {
  table: string;
  columns: string;
  filters: Array<[string, unknown]>;
  orders: Array<[string, unknown]>;
  range?: [number, number];
};
function fixture(user: string | null = owner, member = true) {
  const queries: QueryCall[] = [];
  const rpcs: Array<{ name: string; args: Record<string, unknown> }> = [];
  const database = {
    rows: [task()] as unknown,
    detail: task() as unknown,
    error: null as DbError | null,
    rpcError: null as DbError | null,
    rpcData: undefined as unknown,
  };
  let authentications = 0;
  const client = {
    auth: {
      async getUser() {
        authentications++;
        return { data: { user: user ? { id: user } : null }, error: null };
      },
    },
    from(table: string) {
      const call: QueryCall = { table, columns: '', filters: [], orders: [] };
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
        order(name: string, options: unknown) {
          call.orders.push([name, options]);
          return query;
        },
        range(start: number, end: number) {
          call.range = [start, end];
          return query;
        },
        async maybeSingle() {
          if (table === 'xiv_desk_members')
            return { data: member ? { user_id: owner } : null, error: null };
          assert.equal(table, 'xiv_research_tasks');
          return { data: database.detail, error: database.error };
        },
        then(resolve: (value: unknown) => unknown) {
          assert.equal(table, 'xiv_research_tasks');
          return Promise.resolve({ data: database.rows, error: database.error }).then(resolve);
        },
      };
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      rpcs.push({ name, args });
      const payload = args.p_payload as Record<string, unknown>;
      const next = task({
        id: args.p_task_id,
        version: Number(args.p_expected_version) + 1,
        ...(args.p_action === 'create' ? { question: payload.question } : {}),
        ...(args.p_action === 'cancel'
          ? { status: 'cancelled', cancel_reason: payload.reason }
          : {}),
      });
      return {
        data: database.rpcData === undefined ? next : database.rpcData,
        error: database.rpcError,
      };
    },
  };
  const deps: DeskDependencies = {
    config: () => config,
    context: () => ({ client: client as unknown as SupabaseClient, cookies: [] }),
  };
  return {
    deps,
    database,
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
  path = 'research',
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
function researchQueries(f: ReturnType<typeof fixture>) {
  return f.queries.filter((query) => query.table === 'xiv_research_tasks');
}
function envelope(data: Record<string, unknown>, kind: 'tasks' | 'task') {
  assert.deepEqual(
    Object.keys(data).sort(),
    (kind === 'tasks' ? ['tasks', 'next_offset', 'server_time'] : ['task', 'server_time']).sort(),
  );
  assert.equal(Object.hasOwn(data, 'connection'), false);
  assert.equal(typeof data.server_time, 'string');
  const time = Date.parse(data.server_time as string);
  assert.ok(Number.isFinite(time));
  assert.ok(Math.abs(Date.now() - time) < 60_000);
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

test('research reads and mutations require the verified enabled owner', async () => {
  const routes: Array<[string, unknown?]> = [
    ['research'],
    ['research/' + taskId],
    ['research/create', { id: taskId, question }],
    ['research/cancel', { id: taskId, version: 1, reason: 'Synthetic cancellation' }],
    ['research/retry', { id: taskId, version: 1 }],
  ];
  for (const [path, body] of routes) {
    for (const [f, status] of [
      [fixture(null), 401],
      [fixture(other), 403],
      [fixture(owner, false), 403],
    ] as const) {
      const denied = await run(path, body, f);
      assert.equal(denied.response.status, status, path);
      assert.equal(researchQueries(f).length, 0);
      assert.equal(f.rpcs.length, 0);
      privateResponse(denied.response);
    }
  }
});

test('research enforces origin and fetch protections before contacting authentication', async () => {
  const attempts: Record<string, string>[] = [
    { Origin: 'https://foreign.example' },
    { Origin: '' },
    { 'X-XIV-Desk': '' },
    { 'Sec-Fetch-Site': 'cross-site' },
  ];
  for (const headers of attempts) {
    const f = fixture();
    const denied = await run('research/create', { id: taskId, question }, f, headers);
    assert.equal(denied.response.status, 403);
    assert.equal(f.authentications, 0);
    assert.equal(f.queries.length, 0);
    assert.equal(f.rpcs.length, 0);
  }
  for (const headers of attempts.filter((headers) => headers.Origin !== '')) {
    const f = fixture();
    assert.equal((await run('research', undefined, f, headers)).response.status, 403);
    assert.equal(f.authentications, 0);
  }
});

test('list uses a verified owner filter, deterministic ordering and a 21-row page probe', async () => {
  for (const offset of [0, 20]) {
    const f = fixture();
    const rows = Array.from({ length: 21 }, (_, index) =>
      task({ id: `${index.toString(16).padStart(8, '0')}-3333-4333-8333-333333333333` }),
    );
    f.database.rows = rows;
    const page = await run(offset ? 'research?offset=' + offset : 'research', undefined, f);
    assert.equal(page.response.status, 200);
    envelope(page.data, 'tasks');
    assert.equal(page.data.tasks.length, 20);
    assert.equal(page.data.next_offset, offset + 20);
    assert.deepEqual(
      page.data.tasks.map((row: { id: string }) => row.id),
      rows.slice(0, 20).map((row) => row.id),
    );
    for (const row of page.data.tasks) assert.deepEqual(Object.keys(row).sort(), summaryKeys);
    const [query] = researchQueries(f);
    assert.deepEqual(query.filters, [['owner_id', owner]]);
    assert.deepEqual(query.orders, [
      ['created_at', { ascending: false }],
      ['id', { ascending: false }],
    ]);
    assert.deepEqual(query.range, [offset, offset + 20]);
    assert.ok(!query.columns.split(',').includes('result'));
    assert.ok(!query.columns.split(',').includes('claim_id'));
    assert.ok(!query.columns.includes('*'));
    assert.deepEqual(f.queries[0].filters, [
      ['user_id', owner],
      ['enabled', true],
    ]);
    privateResponse(page.response);
  }
});

test('last and empty pages stop pagination, including the maximum accepted offset', async () => {
  for (const count of [0, 1, 20, 21]) {
    const f = fixture();
    f.database.rows = Array.from({ length: count }, (_, index) =>
      task({ id: `${index.toString(16).padStart(8, '0')}-3333-4333-8333-333333333333` }),
    );
    const page = await run('research?offset=1000000', undefined, f);
    assert.equal(page.response.status, 200);
    assert.equal(page.data.tasks.length, Math.min(count, 20));
    assert.equal(page.data.next_offset, null);
    assert.deepEqual(researchQueries(f)[0].range, [1000000, 1000020]);
  }
});

test('list rejects unknown, duplicate and out-of-range query parameters before reading tasks', async () => {
  for (const query of [
    'owner_id=' + other,
    'offset=0&offset=1',
    'offset=0&%6fffset=1',
    'offset=0&limit=100',
    'offset=',
    'offset=-1',
    'offset=1.5',
    'offset=1e2',
    'offset=%2B1',
    'offset=%201',
    'offset=0%0A',
    'offset=1000001',
    'offset=999999999999999999999999',
  ]) {
    const f = fixture();
    assert.equal((await run('research?' + query, undefined, f)).response.status, 400, query);
    assert.equal(researchQueries(f).length, 0);
    assert.equal(f.rpcs.length, 0);
  }
});

test('detail returns a sourced snapshot and strips all database-only fields', async () => {
  const f = fixture();
  f.database.detail = completed();
  const detail = await run('research/' + taskId, undefined, f);
  assert.equal(detail.response.status, 200);
  envelope(detail.data, 'task');
  assert.deepEqual(Object.keys(detail.data.task).sort(), [...summaryKeys, 'result'].sort());
  assert.deepEqual(detail.data.task.result, result());
  assert.equal(detail.data.task.worker_session, claimed.worker_session);
  assert.equal(detail.data.task.question, question);
  for (const forbidden of [owner, claimId, 'internal_debug', 'SYNTHETIC-PRIVATE-ROW-FIELD'])
    assert.ok(!JSON.stringify(detail.data).includes(forbidden));
  assert.deepEqual(researchQueries(f)[0].filters, [
    ['owner_id', owner],
    ['id', taskId],
  ]);
  assert.ok(researchQueries(f)[0].columns.split(',').includes('result'));
  privateResponse(detail.response);
});

test('detail requires a canonical UUID, no query parameters and an existing owner task', async () => {
  for (const id of [taskId.toUpperCase(), 'not-a-uuid', taskId + '/extra', 'create']) {
    const f = fixture();
    assert.equal((await run('research/' + id, undefined, f)).response.status, 404, id);
    assert.equal(researchQueries(f).length, 0);
  }
  for (const query of ['offset=0', 'owner_id=' + owner, 'id=x&id=y']) {
    const f = fixture();
    assert.equal(
      (await run('research/' + taskId + '?' + query, undefined, f)).response.status,
      400,
    );
    assert.equal(researchQueries(f).length, 0);
  }
  const missing = fixture();
  missing.database.detail = null;
  assert.equal((await run('research/' + taskId, undefined, missing)).response.status, 404);
});

test('valid status snapshots preserve task status and attempt provenance', async () => {
  for (const row of [
    task(),
    task({ ...claimed, status: 'running', lease_expires_at: '2026-09-08T12:15:00Z' }),
    task({ ...claimed, status: 'blocked', blocked_reason: 'Synthetic source unavailable' }),
    task({ status: 'cancelled', cancel_reason: 'Synthetic owner cancellation' }),
    task({ ...claimed, status: 'cancelled', cancel_reason: 'Synthetic running cancellation' }),
    completed(),
  ]) {
    const f = fixture();
    f.database.detail = row;
    const detail = await run('research/' + taskId, undefined, f);
    assert.equal(detail.response.status, 200, row.status);
    assert.equal(detail.data.task.status, row.status);
    assert.equal(detail.data.task.worker_session, row.worker_session);
    envelope(detail.data, 'task');
  }
});

test('running and completed tasks retain their evidence without a fabricated global connection state', async () => {
  const bridgeId = 'dddddddd-6666-4666-8666-666666666666';
  const rows = [
    task({
      ...claimed,
      bridge_id: bridgeId,
      status: 'running',
      lease_expires_at: '2026-09-08T12:15:00Z',
    }),
    completed({ id: 'cccccccc-5555-4555-8555-555555555555', bridge_id: bridgeId }),
  ];
  const f = fixture();
  f.database.rows = rows;
  const page = await run('research', undefined, f);
  assert.equal(page.response.status, 200);
  envelope(page.data, 'tasks');
  assert.equal(page.data.next_offset, null);
  assert.deepEqual(
    page.data.tasks.map((row: { status: string }) => row.status),
    ['running', 'completed'],
  );
  assert.deepEqual(researchQueries(f)[0].filters, [['owner_id', owner]]);
  privateResponse(page.response);

  for (const [index, row] of rows.entries()) {
    const summary = page.data.tasks[index];
    assert.deepEqual(Object.keys(summary).sort(), summaryKeys);
    assert.equal(summary.id, row.id);
    assert.equal(summary.question, question);
    assert.equal(summary.scope, 'public_primary_sources');
    assert.equal(summary.role, 'research_analyst');
    assert.equal(summary.version, row.version);
    assert.equal(summary.worker_session, claimed.worker_session);
    assert.equal(summary.claimed_at, row.claimed_at);
    assert.equal(summary.lease_expires_at, row.lease_expires_at);
    assert.equal(summary.completed_at, row.completed_at);

    f.database.detail = row;
    f.database.rpcData = row;
    const detail = await run('research/' + row.id, undefined, f);
    // Retrying create for the same exact input returns the existing attempt,
    // including a running lease or the completed result, rather than resetting it.
    const retry = await run('research/create', { id: row.id, question }, f);
    for (const response of [detail, retry]) {
      assert.equal(response.response.status, 200);
      envelope(response.data, 'task');
      assert.deepEqual(response.data.task, { ...summary, result: row.result });
      for (const forbidden of [owner, claimId, bridgeId, 'SYNTHETIC-PRIVATE-ROW-FIELD'])
        assert.ok(!JSON.stringify(response.data).includes(forbidden));
      privateResponse(response.response);
    }
    assert.deepEqual(researchQueries(f)[index + 1].filters, [
      ['owner_id', owner],
      ['id', row.id],
    ]);
  }
  assert.deepEqual(
    f.rpcs.map((rpc) => rpc.name),
    ['xiv_research_apply', 'xiv_research_apply'],
  );
  assert.ok(
    f.queries.every((query) => ['xiv_desk_members', 'xiv_research_tasks'].includes(query.table)),
  );
});

test('create sends only the fixed RPC contract and preserves exact Unicode question text', async () => {
  for (const input of [question, '🧪'.repeat(12000)]) {
    const f = fixture();
    const created = await run('research/create', { id: taskId, question: input }, f);
    assert.equal(created.response.status, 200);
    assert.deepEqual(f.rpcs, [
      {
        name: 'xiv_research_apply',
        args: {
          p_task_id: taskId,
          p_expected_version: 0,
          p_action: 'create',
          p_payload: { question: input, scope: 'public_primary_sources' },
        },
      },
    ]);
    envelope(created.data, 'task');
    assert.equal(created.data.task.question, input);
    assert.equal(created.data.task.result, null);
    assert.equal(created.data.task.status, 'queued');
    assert.deepEqual(Object.keys(created.data.task).sort(), [...summaryKeys, 'result'].sort());
    assert.equal(researchQueries(f).length, 0);
  }
});

test('create rejects injected fields, malformed IDs and invalid question values without RPC', async () => {
  const valid = { id: taskId, question };
  const bodies: unknown[] = [
    null,
    [],
    { id: taskId },
    { question },
    ...[
      null,
      '',
      ' \n\t ',
      42,
      [],
      'x\u0000y',
      '\ud800',
      '\udfff',
      'x'.repeat(12001),
      '🧪'.repeat(12001),
    ].map((value) => ({
      ...valid,
      question: value,
    })),
    ...[taskId.toUpperCase(), taskId + '\n', 'bad', null, 42].map((id) => ({ ...valid, id })),
    ...[
      ['owner_id', other],
      ['version', 0],
      ['scope', 'public_primary_sources'],
      ['role', 'research_analyst'],
      ['worker_session', claimed.worker_session],
      ['claim_id', claimId],
      ['status', 'completed'],
      ['result', result()],
      ['action', 'complete'],
      ['id|question', 'joined field names'],
    ].map(([key, value]) => ({ ...valid, [String(key)]: value })),
  ];
  for (const body of bodies) {
    const f = fixture();
    assert.equal((await run('research/create', body, f)).response.status, 400);
    assert.equal(f.rpcs.length, 0);
  }
});

test('cancel and retry forward only exact versions and owner action payloads', async () => {
  const reason = '  Synthetic cancellation.\nKeep the reason verbatim.  ';
  for (const [action, body, payload] of [
    ['cancel', { id: taskId, version: 4, reason }, { reason }],
    [
      'cancel',
      { id: taskId, version: 4, reason: '🧪'.repeat(4000) },
      { reason: '🧪'.repeat(4000) },
    ],
    ['retry', { id: taskId, version: 4 }, {}],
  ] as const) {
    const f = fixture();
    const changed = await run('research/' + action, body, f);
    assert.equal(changed.response.status, 200);
    assert.deepEqual(f.rpcs, [
      {
        name: 'xiv_research_apply',
        args: { p_task_id: taskId, p_expected_version: 4, p_action: action, p_payload: payload },
      },
    ]);
    assert.equal(changed.data.task.version, 5);
    assert.equal(changed.data.task.status, action === 'cancel' ? 'cancelled' : 'queued');
    envelope(changed.data, 'task');
  }
});

test('cancel and retry reject stale-shape versions, extra fields and invalid reasons', async () => {
  for (const action of ['cancel', 'retry']) {
    const valid = {
      id: taskId,
      version: 1,
      ...(action === 'cancel' ? { reason: 'Synthetic reason' } : {}),
    };
    const bodies = [
      ...[undefined, null, 0, -1, 1.5, '1', 1000000001].map((version) => ({ ...valid, version })),
      { ...valid, owner_id: other },
      { ...valid, claim_id: claimId },
      { ...valid, worker_session: claimed.worker_session },
      { ...valid, result: result() },
      { ...valid, id: taskId.toUpperCase() },
      ...(action === 'cancel'
        ? [undefined, null, '', ' \t\n ', 42, '🧪'.repeat(4001)].map((reason) => ({
            ...valid,
            reason,
          }))
        : [{ ...valid, reason: 'Unrequested reason' }]),
    ];
    for (const body of bodies) {
      const f = fixture();
      assert.equal((await run('research/' + action, body, f)).response.status, 400);
      assert.equal(f.rpcs.length, 0);
    }
  }
});

test('browser requests cannot call worker actions or add mutation query parameters', async () => {
  const unsupported = fixture();
  const method = await handleDesk(
    new NextRequest('https://desk.example/api/desk/research/create', {
      method: 'PUT',
      headers: { 'X-XIV-Desk': '1', Origin: config.origin },
    }),
    ['research', 'create'],
    unsupported.deps,
  );
  assert.equal(method.status, 405);
  assert.equal(unsupported.authentications, 0);
  assert.equal(unsupported.rpcs.length, 0);
  for (const action of ['claim', 'renew', 'complete', 'block', 'delete', 'run']) {
    for (const body of [
      undefined,
      { id: taskId, version: 1, claim_id: claimId, result: result() },
    ]) {
      const f = fixture();
      assert.equal((await run('research/' + action, body, f)).response.status, 404, action);
      assert.equal(f.rpcs.length, 0);
      assert.equal(researchQueries(f).length, 0);
    }
  }
  for (const [action, body] of [
    ['create', { id: taskId, question }],
    ['cancel', { id: taskId, version: 1, reason: 'Synthetic reason' }],
    ['retry', { id: taskId, version: 1 }],
  ] as const) {
    for (const query of ['owner_id=' + other, 'offset=0', 'id=x&id=y']) {
      const f = fixture();
      assert.equal((await run('research/' + action + '?' + query, body, f)).response.status, 400);
      assert.equal(f.rpcs.length, 0);
    }
  }
});

test('database failures map to safe HTTP errors without exposing provider diagnostics', async () => {
  for (const [code, status] of [
    ['40001', 409],
    ['42501', 403],
    ['22023', 400],
    ['XX000', 503],
  ] as const) {
    const f = fixture();
    f.database.rpcError = { code, message: 'SYNTHETIC-PRIVATE-SQL', details: owner, hint: claimId };
    const failed = await run('research/retry', { id: taskId, version: 1 }, f);
    assert.equal(failed.response.status, status);
    assert.deepEqual(Object.keys(failed.data), ['error']);
    assert.equal(typeof failed.data.error, 'string');
    for (const secret of ['SYNTHETIC-PRIVATE-SQL', owner, claimId, code])
      assert.ok(!JSON.stringify(failed.data).includes(secret));
    privateResponse(failed.response);
  }
  for (const path of ['research', 'research/' + taskId]) {
    const f = fixture();
    f.database.error = { code: 'XX000', message: 'SYNTHETIC-PRIVATE-SQL' };
    const failed = await run(path, undefined, f);
    assert.equal(failed.response.status, 503);
    assert.ok(!JSON.stringify(failed.data).includes('SYNTHETIC-PRIVATE-SQL'));
  }
});

test('malformed and forged-owner rows fail closed on list, detail and RPC responses', async () => {
  const invalid = [
    task({ owner_id: other }),
    task({ id: 'malformed' }),
    task({ question: ' ' }),
    task({ question: 'x'.repeat(12001) }),
    task({ scope: 'private_sources' }),
    task({ role: 'untrusted_worker' }),
    task({ version: 0 }),
    task({ version: 1000000001 }),
    task({ status: 'approved' }),
    task({ created_at: 'not-a-date' }),
    task({ updated_at: null }),
    task({ status: 'running' }),
    task({ status: 'completed' }),
    task({ status: 'blocked' }),
    task({ status: 'cancelled' }),
    task({ ...claimed }),
    task({
      ...claimed,
      status: 'running',
      worker_session: claimed.worker_session + '\n',
      lease_expires_at: '2026-09-08T12:15:00Z',
    }),
    task({ lease_expires_at: instant }),
    task({ cancel_reason: 'Unexpected cancellation' }),
    task({ blocked_reason: 'Unexpected block' }),
    task({ completed_at: instant }),
  ];
  for (const row of invalid) {
    for (const [path, body] of [
      ['research', undefined],
      ['research/' + taskId, undefined],
      ['research/create', { id: taskId, question }],
    ] as const) {
      const f = fixture();
      f.database.rows = [row];
      f.database.detail = row;
      f.database.rpcData = row;
      const failed = await run(path, body, f);
      assert.equal(failed.response.status, 503, path + ': ' + JSON.stringify(row));
      assert.deepEqual(Object.keys(failed.data), ['error']);
      assert.ok(!JSON.stringify(failed.data).includes('SYNTHETIC-PRIVATE-ROW-FIELD'));
    }
  }
  for (const rows of [null, {}, 'bad response', [null]]) {
    const f = fixture();
    f.database.rows = rows;
    assert.equal((await run('research', undefined, f)).response.status, 503);
  }
  for (const rpcData of [null, [], task({ id: other })]) {
    const f = fixture();
    f.database.rpcData = rpcData;
    assert.equal((await run('research/create', { id: taskId, question }, f)).response.status, 503);
  }
});

test('unsafe source URLs and invalid retrieval timestamps never reach the browser', async () => {
  const source = result().sources[0];
  const sources = [
    ...[
      'http://primary.example/filing',
      'javascript:alert(1)',
      'https://user:password@primary.example/filing',
      'https://localhost/filing',
      'https://127.0.0.1/filing',
      'https://[::1]/filing',
      'https://primary.example:0/filing',
      'https://primary.example:65536/filing',
      'https://primary.example:999999/filing',
      'https://primary.example/has space',
      'https://primary.example/é',
      'https://primary.example/has\\backslash',
      'https://primary.example/%zz',
      'https://primary.example/%1',
      'https://primary.example/\nheader',
      'https://primary.example/filing\n',
    ].map((url) => ({ ...source, url })),
    ...[
      '2026-02-30T12:00:00Z',
      '0000-09-08T12:00:00Z',
      '2026-09-08T24:00:00Z',
      '2026-09-08T12:00:60Z',
      '2026-09-08T12:00:00+00:00',
      '2026-09-08T12:00:00.1234567Z',
      '2026-09-08T12:00:00Z\n',
      'not-a-date',
    ].map((retrieved_at) => ({ ...source, retrieved_at })),
  ];
  for (const source of sources) {
    const f = fixture();
    f.database.detail = completed({ result: result({ sources: [source] }) });
    const failed = await run('research/' + taskId, undefined, f);
    assert.equal(failed.response.status, 503, JSON.stringify(source));
    assert.deepEqual(Object.keys(failed.data), ['error']);
  }
});

test('result validation rejects impossible state, missing evidence and oversized or extra fields', async () => {
  const source = result().sources[0];
  for (const value of [
    null,
    [],
    result({ text: '' }),
    result({ text: 'x'.repeat(20001) }),
    result({ limitations: 'x'.repeat(4001) }),
    result({ sources: [] }),
    result({ sources: Array.from({ length: 31 }, () => source) }),
    result({ sources: [{ ...source, title: ' ' }] }),
    result({ sources: [{ ...source, title: 'x'.repeat(301) }] }),
    result({ sources: [{ ...source, url: 'https://primary.example/' + 'x'.repeat(2000) }] }),
    result({ sources: [{ ...source, private_token: 'SYNTHETIC-SECRET' }] }),
    result({ internal_notes: 'SYNTHETIC-SECRET' }),
    result({
      text: '🧪'.repeat(20000),
      limitations: '🧪'.repeat(4000),
      sources: Array.from({ length: 5 }, () => ({ ...source, title: '🧪'.repeat(300) })),
    }),
  ]) {
    const f = fixture();
    f.database.detail = completed({ result: value });
    const failed = await run('research/' + taskId, undefined, f);
    assert.equal(failed.response.status, 503);
    assert.ok(!JSON.stringify(failed.data).includes('SYNTHETIC-SECRET'));
  }
  const f = fixture();
  f.database.detail = task({ result: result() });
  assert.equal((await run('research/' + taskId, undefined, f)).response.status, 503);
});

test('success and failure preserve strict session cookies and private cache headers', async () => {
  for (const fail of [false, true]) {
    const f = fixture();
    const base = f.deps.context;
    f.deps.context = (request, settings) => ({
      ...base(request, settings),
      cookies: [
        {
          name: 'xiv-private-desk.0',
          value: 'synthetic-refreshed-session',
          options: { httpOnly: false, secure: false, sameSite: 'lax', path: '/unsafe-path' },
        },
      ],
    });
    if (fail) f.database.rpcError = { code: '40001', message: 'Synthetic stale version' };
    const response = (await run('research/create', { id: taskId, question }, f)).response;
    assert.equal(response.status, fail ? 409 : 200);
    privateResponse(response);
    const cookie = response.cookies.get('xiv-private-desk.0');
    assert.equal(cookie?.httpOnly, true);
    assert.equal(cookie?.secure, true);
    assert.equal(cookie?.sameSite, 'strict');
    assert.equal(cookie?.path, '/');
  }
});
