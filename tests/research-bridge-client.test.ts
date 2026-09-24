import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inspect } from 'node:util';
import test from 'node:test';
import {
  BridgeError,
  ResearchBridgeClient,
  XIV_BRIDGE_STOP,
  createBridgeIdentity,
  type BridgeCredentials,
  type BridgeFailure,
  type BridgeTask,
} from '../src/lib/desk/bridge-client';
import type { ResearchResult } from '../src/lib/desk/research';

// Every transport is injected. These synthetic credentials never reach a network,
// filesystem, environment, owner session, scheduler, or provider.
const NOW = Date.parse('2026-09-08T12:00:00Z');
const EXPIRES = '2026-09-10T12:00:00Z';
const OWNER = '11111111-1111-4111-8111-111111111111';
const BRIDGE = 'aaaaaaaa-2222-4222-8222-222222222222';
const TASK = 'bbbbbbbb-3333-4333-8333-333333333333';
const CLAIM = 'cccccccc-4444-4444-8444-444444444444';
const OTHER = 'dddddddd-5555-4555-8555-555555555555';
const SESSION = 'codex:synthetic_0001';
const TOKEN = '0123456789abcdef'.repeat(4);
const KEY = 'sb_publishable_synthetic_not_a_real_key';
const PROJECT = 'https://fixture.supabase.co';
const QUESTION = '  Synthetic question: Café 🧪\nKeep every space and <tag>.  ';
const PROVIDER_SECRET = `synthetic-provider-private ${TOKEN} ${KEY}`;
const credentials = (): BridgeCredentials => ({
  projectUrl: PROJECT,
  publishableKey: KEY,
  ownerId: OWNER,
  bridgeId: BRIDGE,
  token: TOKEN,
  session: SESSION,
  expiresAt: EXPIRES,
});
type RawTask = BridgeTask & { owner_id: string; internal_debug?: string };
type Call = { url: string; init: RequestInit };
const result = (): ResearchResult => ({
  text: '  Synthetic finding.\n<script>literal text, not executed</script> Café 🧪  ',
  sources: [
    {
      url: 'https://primary.example/filing/%E2%9C%93?section=1#notes',
      title: '  Synthetic source <tag>  ',
      retrieved_at: '2026-09-08T11:59:59.123456Z',
    },
  ],
  limitations: '  Synthetic evidence only.\nNo source was fetched.  ',
});
function queued(overrides: Record<string, unknown> = {}): RawTask {
  return {
    owner_id: OWNER,
    id: TASK,
    question: QUESTION,
    scope: 'public_primary_sources',
    role: 'research_analyst',
    version: 1,
    status: 'queued',
    created_at: '2026-09-08T12:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
    worker_session: null,
    bridge_id: null,
    claim_id: null,
    claimed_at: null,
    lease_expires_at: null,
    completed_at: null,
    blocked_reason: null,
    cancel_reason: null,
    result: null,
    internal_debug: 'synthetic-database-only-field',
    ...overrides,
  } as RawTask;
}
function running(overrides: Record<string, unknown> = {}): RawTask {
  return queued({
    version: 2,
    status: 'running',
    worker_session: SESSION,
    bridge_id: BRIDGE,
    claim_id: CLAIM,
    claimed_at: '2026-09-08T12:00:00Z',
    lease_expires_at: '2026-09-08T12:15:00Z',
    ...overrides,
  });
}
function completed(overrides: Record<string, unknown> = {}): RawTask {
  return running({
    version: 3,
    status: 'completed',
    lease_expires_at: null,
    completed_at: '2026-09-08T12:01:00Z',
    updated_at: '2026-09-08T12:01:00Z',
    result: result(),
    ...overrides,
  });
}
function publicTask(raw: RawTask): BridgeTask {
  const { owner_id: _owner, internal_debug: _debug, ...task } = raw;
  return task;
}
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
function fixture(
  reply: (call: Call, index: number) => Response | Promise<Response> = () => json({ tasks: [] }),
) {
  const calls: Call[] = [];
  const clock = { now: NOW };
  const transport: typeof fetch = async (input, init) => {
    assert.equal(typeof input, 'string');
    assert.ok(init);
    const call = { url: String(input), init };
    calls.push(call);
    return reply(call, calls.length - 1);
  };
  const client = new ResearchBridgeClient(credentials(), transport, () => clock.now);
  return { client, calls, clock, transport };
}
function safeError(kind: BridgeFailure) {
  return (error: unknown) => {
    assert.ok(error instanceof BridgeError);
    assert.equal(error.kind, kind);
    for (const secret of [TOKEN, KEY, PROVIDER_SECRET]) {
      assert.ok(!String(error).includes(secret));
      assert.ok(!inspect(error, { showHidden: true }).includes(secret));
      assert.ok(!JSON.stringify(error).includes(secret));
    }
    return true;
  };
}
const rejects = (action: () => Promise<unknown>, kind: BridgeFailure) =>
  assert.rejects(action, safeError(kind));
function rpc(call: Call, name: string, args: Record<string, unknown>) {
  assert.equal(call.url, `${PROJECT}/rest/v1/rpc/${name}`);
  assert.ok(!call.url.includes(TOKEN));
  assert.ok(!call.url.includes(KEY));
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.credentials, 'omit');
  assert.equal(call.init.redirect, 'error');
  assert.equal(call.init.cache, 'no-store');
  assert.ok(call.init.signal instanceof AbortSignal);
  const headers = new Headers(call.init.headers);
  assert.deepEqual([...headers.entries()].sort(), [
    ['accept', 'application/json'],
    ['apikey', KEY],
    ['content-type', 'application/json'],
  ]);
  assert.equal(headers.has('authorization'), false);
  assert.ok(!JSON.stringify([...headers]).includes(TOKEN));
  assert.equal(typeof call.init.body, 'string');
  assert.deepEqual(JSON.parse(call.init.body as string), {
    p_bridge_id: BRIDGE,
    p_token: TOKEN,
    ...args,
  });
}

test('identity factory creates 32 random bytes and an exact approval descriptor containing only its digest', () => {
  const first = createBridgeIdentity(SESSION, EXPIRES, NOW);
  const second = createBridgeIdentity(SESSION, EXPIRES, NOW);
  for (const value of [first, second]) {
    assert.match(value.token, /^[0-9a-f]{64}$/);
    assert.equal(Buffer.from(value.token, 'hex').byteLength, 32);
    assert.match(
      value.descriptor.id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    assert.deepEqual(Object.keys(value.descriptor).sort(), [
      'expires_at',
      'id',
      'session',
      'token_sha256',
    ]);
    assert.equal(value.descriptor.session, SESSION);
    assert.equal(value.descriptor.expires_at, EXPIRES);
    assert.equal(
      value.descriptor.token_sha256,
      createHash('sha256').update(value.token, 'utf8').digest('hex'),
    );
    assert.ok(!JSON.stringify(value.descriptor).includes(value.token));
  }
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.descriptor.id, second.descriptor.id);
  assert.equal(
    createBridgeIdentity('claude:synthetic_0002', EXPIRES, NOW).descriptor.session,
    'claude:synthetic_0002',
  );
});

test('identity factory rejects invalid sessions, repaired dates, expired approvals, maximum age and original-stop extensions', () => {
  for (const session of [
    '',
    'codex:short',
    'other:synthetic_0001',
    'CODEX:synthetic_0001',
    SESSION + '\n',
    'claude:' + 'x'.repeat(129),
  ])
    assert.throws(() => createBridgeIdentity(session, EXPIRES, NOW), safeError('invalid'));
  for (const value of [
    '',
    'not-a-date',
    'infinity',
    '2026-09-10',
    '2026-09-10T12:00:00+00:00',
    '2026-02-30T12:00:00Z',
    '2026-09-10T12:00:00Z\n',
    '2026-09-08T12:00:00Z',
    '2026-09-08T11:59:59Z',
    '2026-09-19T23:52:33Z',
  ])
    assert.throws(() => createBridgeIdentity(SESSION, value, NOW), safeError('invalid'));
  const earlier = Date.parse('2026-08-25T12:00:00Z');
  assert.throws(
    () => createBridgeIdentity(SESSION, '2026-09-08T12:00:01Z', earlier),
    safeError('invalid'),
  );
  assert.equal(
    createBridgeIdentity(SESSION, '2026-09-08T12:00:00.000Z', earlier).descriptor.expires_at,
    '2026-09-08T12:00:00.000Z',
  );
  assert.equal(
    createBridgeIdentity(SESSION, XIV_BRIDGE_STOP, NOW).descriptor.expires_at,
    XIV_BRIDGE_STOP,
  );
});

test('configuration rejects unsafe endpoints, non-publishable keys, invalid IDs, tokens, sessions and expiry without fetching', () => {
  const f = fixture();
  const invalid: Array<Partial<BridgeCredentials>> = [
    ...[
      'http://fixture.supabase.co',
      PROJECT + '/',
      PROJECT + '/rest/v1',
      PROJECT + '?token=' + TOKEN,
      PROJECT + '#' + TOKEN,
      'https://user:password@fixture.supabase.co',
      'https://fixture.supabase.co:8443',
      'https://fixture.supabase.co.evil.example',
      'https://localhost',
      'https://127.0.0.1',
      'https://fixture.invalid',
      'not-a-url',
    ].map((projectUrl) => ({ projectUrl })),
    ...[
      '',
      'sb_secret_synthetic_not_allowed',
      'eyJ.synthetic.legacy-jwt',
      'sb_publishable_short',
      KEY + '\n',
    ].map((publishableKey) => ({ publishableKey })),
    ...['', TOKEN.slice(1), TOKEN + '0', TOKEN.toUpperCase(), TOKEN + '\n', 'g'.repeat(64)].map(
      (token) => ({ token }),
    ),
    { ownerId: 'bad' },
    { bridgeId: BRIDGE.toUpperCase() },
    { ownerId: OWNER + '\n' },
    { session: SESSION + '\n' },
    { session: 'codex:short' },
    { expiresAt: '2026-09-08T12:00:00Z' },
    { expiresAt: '2026-09-19T23:52:33Z' },
  ];
  for (const change of invalid)
    assert.throws(
      () => new ResearchBridgeClient({ ...credentials(), ...change }, f.transport, () => NOW),
      safeError('invalid'),
    );
  assert.equal(f.calls.length, 0);
});

test('client retains a private credential copy and exposes no secrets through ordinary or detailed inspection', async () => {
  const supplied = credentials();
  const f = fixture();
  const client = new ResearchBridgeClient(supplied, f.transport, () => NOW);
  supplied.token = 'f'.repeat(64);
  supplied.publishableKey = 'sb_publishable_changed_synthetic';
  supplied.ownerId = OTHER;
  supplied.bridgeId = OTHER;
  supplied.session = 'claude:synthetic_0002';
  for (const value of [
    JSON.stringify(client),
    inspect(client),
    inspect(client, { showHidden: true }),
  ])
    for (const secret of [TOKEN, KEY]) assert.ok(!value.includes(secret));
  await client.list();
  rpc(f.calls[0], 'xiv_research_bridge_read', { p_task_id: null });
});

test('list and detail use only the fixed RPC transport contract and preserve exact text while stripping database metadata', async () => {
  const raw = completed();
  const f = fixture((_call, index) => json(index === 0 ? { tasks: [queued()] } : { task: raw }));
  assert.deepEqual(await f.client.list(), [publicTask(queued())]);
  const task = await f.client.read(TASK);
  assert.deepEqual(task, publicTask(raw));
  assert.equal(task.question, QUESTION);
  assert.deepEqual(task.result, result());
  assert.equal('owner_id' in task, false);
  assert.equal('internal_debug' in task, false);
  assert.equal(f.calls.length, 2);
  rpc(f.calls[0], 'xiv_research_bridge_read', { p_task_id: null });
  rpc(f.calls[1], 'xiv_research_bridge_read', { p_task_id: TASK });
});

test('list accepts twenty distinct tasks but rejects duplicate IDs, larger pages and malformed envelopes', async () => {
  const rows = Array.from({ length: 20 }, (_, index) =>
    queued({ id: `${index.toString(16).padStart(8, '0')}-3333-4333-8333-333333333333` }),
  );
  const good = fixture(() => json({ tasks: rows }));
  assert.equal((await good.client.list()).length, 20);
  for (const value of [
    null,
    [],
    {},
    { tasks: null },
    { tasks: {} },
    { tasks: [null] },
    { tasks: [...rows, queued()] },
    { tasks: [queued(), queued()] },
  ]) {
    const f = fixture(() => json(value));
    await rejects(() => f.client.list(), 'unavailable');
    assert.equal(f.calls.length, 1);
  }
});

test('queued and claimed reads reject foreign owners, wrong scope, mismatched bridge/session and missing claim identity', async () => {
  const bad = [
    queued({ owner_id: OTHER }),
    queued({ scope: 'private_sources' }),
    queued({ role: 'other' }),
    queued({ question: ' ' }),
    queued({ result: result() }),
    queued({ claim_id: CLAIM }),
    queued({ bridge_id: BRIDGE }),
    queued({ id: TASK + '\n' }),
    running({ bridge_id: OTHER }),
    running({ bridge_id: null }),
    running({ claim_id: null }),
    running({ claim_id: 'not-a-uuid' }),
    running({ worker_session: 'claude:synthetic_0002' }),
    running({ lease_expires_at: null }),
    running({ version: 0 }),
  ];
  for (const raw of bad) {
    const detail = fixture(() => json({ task: raw }));
    await rejects(() => detail.client.read(TASK), 'unavailable');
    const list = fixture(() => json({ tasks: [raw] }));
    await rejects(() => list.client.list(), 'unavailable');
    assert.equal(detail.calls.length, 1);
    assert.equal(list.calls.length, 1);
  }
  const wrongId = fixture(() => json({ task: queued({ id: OTHER }) }));
  await rejects(() => wrongId.client.read(TASK), 'unavailable');
});

test('completed reads reject malformed results, source injection, unsafe links and invalid retrieval dates', async () => {
  const source = result().sources[0];
  for (const value of [
    null,
    [],
    {},
    { ...result(), text: '' },
    { ...result(), text: 'x'.repeat(20001) },
    { ...result(), limitations: 'x'.repeat(4001) },
    { ...result(), sources: [] },
    { ...result(), extra: PROVIDER_SECRET },
    { ...result(), sources: [{ ...source, secret: PROVIDER_SECRET }] },
    { ...result(), sources: [{ ...source, url: 'javascript:alert(1)' }] },
    { ...result(), sources: [{ ...source, url: 'https://user:pass@primary.example/' }] },
    { ...result(), sources: [{ ...source, retrieved_at: '2026-02-30T12:00:00Z' }] },
    { ...result(), sources: [{ ...source, title: ' ' }] },
  ]) {
    const f = fixture(() => json({ task: completed({ result: value }) }));
    await rejects(() => f.client.read(TASK), 'unavailable');
    assert.equal(f.calls.length, 1);
  }
});

test('claim sends an empty payload while renewal, completion and block send only their bound claim and exact input', async () => {
  const claimed = running();
  const renewed = running({
    version: 3,
    updated_at: '2026-09-08T12:01:00Z',
    lease_expires_at: '2026-09-08T12:16:00Z',
  });
  const finished = completed({ version: 4 });
  const reason = '  Synthetic missing evidence.\nKeep this reason.  ';
  const blocked = running({
    version: 3,
    status: 'blocked',
    lease_expires_at: null,
    blocked_reason: reason,
  });
  const responses = [claimed, renewed, finished, blocked];
  const f = fixture((_call, index) => json(responses[index]));
  const first = await f.client.claim(queued());
  assert.deepEqual(first, publicTask(claimed));
  const second = await f.client.renew(first);
  assert.deepEqual(second, publicTask(renewed));
  assert.deepEqual(await f.client.complete(second, result()), publicTask(finished));
  assert.deepEqual(await f.client.block(claimed, reason), publicTask(blocked));
  const payloads = [
    { p_task_id: TASK, p_expected_version: 1, p_action: 'claim', p_payload: {} },
    { p_task_id: TASK, p_expected_version: 2, p_action: 'renew', p_payload: { claim_id: CLAIM } },
    {
      p_task_id: TASK,
      p_expected_version: 3,
      p_action: 'complete',
      p_payload: { claim_id: CLAIM, result: result() },
    },
    {
      p_task_id: TASK,
      p_expected_version: 2,
      p_action: 'block',
      p_payload: { claim_id: CLAIM, reason },
    },
  ];
  assert.equal(f.calls.length, payloads.length);
  for (let index = 0; index < payloads.length; index++)
    rpc(f.calls[index], 'xiv_research_bridge_apply', payloads[index]);
});

test('invalid task IDs, versions, block reasons and foreign claim ownership are rejected before transport', async () => {
  const f = fixture();
  for (const id of ['', TASK.toUpperCase(), TASK + '\n', 'not-a-uuid']) {
    await rejects(() => f.client.read(id), 'invalid');
    await rejects(() => f.client.claim({ id, version: 1 }), 'invalid');
  }
  for (const version of [0, -1, 1.5, NaN, Infinity, 1000000001])
    await rejects(() => f.client.claim({ id: TASK, version }), 'invalid');
  for (const reason of ['', ' \n\t ', 'x'.repeat(4001)])
    await rejects(() => f.client.block(running(), reason), 'invalid');
  for (const raw of [
    queued(),
    running({ bridge_id: OTHER }),
    running({ bridge_id: null }),
    running({ worker_session: 'claude:synthetic_0002' }),
    running({ claim_id: null }),
    running({ claim_id: CLAIM.toUpperCase() }),
    running({ status: 'blocked' }),
  ]) {
    await rejects(() => f.client.renew(raw), 'invalid');
    await rejects(() => f.client.complete(raw, result()), 'invalid');
    await rejects(() => f.client.block(raw, 'Synthetic reason'), 'invalid');
  }
  assert.equal(f.calls.length, 0);
});

test('write responses with wrong identities, versions, state or ownership remain uncertain and are never retried', async () => {
  for (const raw of [
    null,
    {},
    running({ id: OTHER }),
    running({ version: 1 }),
    running({ version: 3 }),
    queued({ version: 2 }),
    running({ owner_id: OTHER }),
    running({ scope: 'private_sources' }),
    running({ bridge_id: OTHER }),
    running({ worker_session: 'claude:synthetic_0002' }),
    running({ claim_id: null }),
  ]) {
    const f = fixture(() => json(raw));
    await rejects(() => f.client.claim(queued()), 'uncertain');
    assert.equal(f.calls.length, 1);
  }
  for (const action of ['renew', 'complete', 'block'] as const) {
    const correct =
      action === 'complete'
        ? completed()
        : action === 'block'
          ? running({
              version: 3,
              status: 'blocked',
              blocked_reason: 'Synthetic reason',
              lease_expires_at: null,
            })
          : running({ version: 3 });
    for (const raw of [
      { ...correct, claim_id: OTHER },
      { ...correct, version: 2 },
      queued({ version: 3 }),
    ]) {
      const f = fixture(() => json(raw));
      const operation = () =>
        action === 'renew'
          ? f.client.renew(running())
          : action === 'complete'
            ? f.client.complete(running(), result())
            : f.client.block(running(), 'Synthetic reason');
      await rejects(operation, 'uncertain');
      assert.equal(f.calls.length, 1);
    }
  }
  const badResult = fixture(() => json(completed({ result: { text: 'missing evidence' } })));
  await rejects(() => badResult.client.complete(running(), result()), 'uncertain');
  assert.equal(badResult.calls.length, 1);
});

test('HTTP failures classify refused and conflicting requests without reflecting provider bodies or retrying', async () => {
  for (const [status, expected] of [
    [401, 'denied'],
    [403, 'denied'],
    [409, 'conflict'],
    [400, 'invalid'],
  ] as const) {
    for (const write of [false, true]) {
      const f = fixture(() => json({ message: PROVIDER_SECRET, hint: TOKEN }, status));
      await rejects(() => (write ? f.client.claim(queued()) : f.client.list()), expected);
      assert.equal(f.calls.length, 1);
    }
  }
  for (const status of [404, 429, 500, 503, 599]) {
    for (const write of [false, true]) {
      const f = fixture(() => json({ message: PROVIDER_SECRET }, status));
      await rejects(
        () => (write ? f.client.claim(queued()) : f.client.read(TASK)),
        write ? 'uncertain' : 'unavailable',
      );
      assert.equal(f.calls.length, 1);
    }
  }
});

test('network failures, malformed JSON, missing bodies and redirects are uncertain writes or unavailable reads with no retry', async () => {
  const replies: Array<() => Response> = [
    () => {
      throw new Error(PROVIDER_SECRET);
    },
    () => new Response('invalid-json ' + PROVIDER_SECRET),
    () => new Response(null),
    () =>
      new Response(PROVIDER_SECRET, {
        status: 302,
        headers: { Location: `https://evil.example/${TOKEN}` },
      }),
    () => {
      const response = json(running());
      Object.defineProperty(response, 'redirected', { value: true });
      return response;
    },
    () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.error(new Error(PROVIDER_SECRET));
          },
        }),
      ),
  ];
  for (const reply of replies) {
    for (const write of [false, true]) {
      const f = fixture(reply);
      await rejects(
        () => (write ? f.client.claim(queued()) : f.client.list()),
        write ? 'uncertain' : 'unavailable',
      );
      assert.equal(f.calls.length, 1);
      assert.ok(!f.calls[0].url.includes(TOKEN));
      assert.equal(f.calls[0].init.redirect, 'error');
    }
  }
});

test('configured expiry stops every subsequent operation before another transport call', async () => {
  const f = fixture();
  f.clock.now = Date.parse(EXPIRES) - 1;
  assert.deepEqual(await f.client.list(), []);
  f.clock.now = Date.parse(EXPIRES);
  for (const operation of [
    () => f.client.list(),
    () => f.client.read(TASK),
    () => f.client.claim(queued()),
    () => f.client.renew(running()),
    () => f.client.complete(running(), result()),
    () => f.client.block(running(), 'Synthetic reason'),
  ])
    await rejects(operation, 'denied');
  assert.equal(f.calls.length, 1);
});

test('response size accepts exactly four MiB and rejects the next byte for both reads and writes', async () => {
  const limit = 4 * 1024 * 1024;
  for (const write of [false, true]) {
    // The entire payload remains valid for the selected operation. With the
    // size guard removed, the overflowing write would succeed rather than
    // coincidentally fail its task-shape check.
    const value = write ? running() : { tasks: [] };
    const empty = JSON.stringify({ ...value, padding: '' });
    const boundary = JSON.stringify({
      ...value,
      padding: 'x'.repeat(limit - Buffer.byteLength(empty)),
    });
    assert.equal(Buffer.byteLength(boundary), limit);
    const good = fixture(() => new Response(boundary));
    if (write) assert.deepEqual(await good.client.claim(queued()), publicTask(running()));
    else assert.deepEqual(await good.client.list(), []);
    const overflow = boundary + ' ';
    assert.equal(Buffer.byteLength(overflow), limit + 1);
    const f = fixture(() => new Response(overflow));
    await rejects(
      () => (write ? f.client.claim(queued()) : f.client.list()),
      write ? 'uncertain' : 'unavailable',
    );
    assert.equal(f.calls.length, 1);
  }
});
