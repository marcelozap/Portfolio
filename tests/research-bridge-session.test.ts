import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspect } from 'node:util';
import test from 'node:test';
import {
  BridgeError,
  type BridgeCredentials,
  type BridgeTask,
} from '../src/lib/desk/bridge-client';
import {
  executeBridgeCommand,
  SessionError,
  type SessionClient,
  type SessionFailure,
} from '../src/lib/desk/bridge-session';
import type { BridgeVault } from '../src/lib/desk/bridge-vault';
import type { ResearchResult } from '../src/lib/desk/research';

// Adapter tests use only injected in-memory vault/client doubles. CLI tests
// explicitly block child-process and fetch access before importing its source.
// No real vault, scheduler, provider, or question execution is exercised.
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
const PRIVATE = `synthetic-provider-only ${TOKEN} ${KEY}`;
const QUESTION = '  Synthetic request: Café 🧪\n<script>literal only</script>  ';
const REASON = '  Synthetic missing evidence.\nPreserve this explanation.  ';
const credentials = (): BridgeCredentials => ({
  projectUrl: 'https://fixture.supabase.co',
  publishableKey: KEY,
  ownerId: OWNER,
  bridgeId: BRIDGE,
  token: TOKEN,
  session: SESSION,
  expiresAt: EXPIRES,
});
function config() {
  const { projectUrl, publishableKey, ownerId, session, expiresAt } = credentials();
  return { projectUrl, publishableKey, ownerId, session, expiresAt };
}
const descriptor = (saved = credentials()) => ({
  id: saved.bridgeId,
  session: saved.session,
  expires_at: saved.expiresAt,
  token_sha256: createHash('sha256').update(saved.token, 'utf8').digest('hex'),
});
const result = (): ResearchResult => ({
  text: '  Synthetic result.\n<script>text, never executed</script> Café 🧪  ',
  sources: [
    {
      url: 'https://primary.example/filing?section=1#notes',
      title: '  Saved source <tag>  ',
      retrieved_at: '2026-09-08T11:59:59.123456Z',
    },
  ],
  limitations: '  Synthetic evidence only.\nNo fetch or valuation.  ',
});
function queued(change: Partial<BridgeTask> = {}): BridgeTask {
  return {
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
    ...change,
  };
}
function running(change: Partial<BridgeTask> = {}): BridgeTask {
  return queued({
    version: 2,
    status: 'running',
    worker_session: SESSION,
    bridge_id: BRIDGE,
    claim_id: CLAIM,
    claimed_at: '2026-09-08T12:00:00Z',
    lease_expires_at: '2026-09-08T12:15:00Z',
    ...change,
  });
}
function completed(change: Partial<BridgeTask> = {}): BridgeTask {
  return running({
    version: 3,
    status: 'completed',
    lease_expires_at: null,
    completed_at: '2026-09-08T12:01:00Z',
    result: result(),
    ...change,
  });
}
type Call = { method: string; args: unknown[] };
function fixture(
  options: {
    empty?: boolean;
    stored?: BridgeCredentials;
    client?: Partial<SessionClient>;
    loadError?: unknown;
    saveError?: unknown;
    now?: number;
  } = {},
) {
  let stored = options.empty ? undefined : structuredClone(options.stored ?? credentials());
  const saved: BridgeCredentials[] = [],
    vaultCalls: Call[] = [],
    calls: Call[] = [];
  const factories: BridgeCredentials[] = [];
  const clock = { now: options.now ?? NOW };
  const vault: BridgeVault = {
    async save(value) {
      vaultCalls.push({ method: 'save', args: [structuredClone(value)] });
      if (options.saveError) throw options.saveError;
      if (stored) throw new Error(PRIVATE);
      stored = structuredClone(value);
      saved.push(structuredClone(value));
    },
    async load(session) {
      vaultCalls.push({ method: 'load', args: [session] });
      if (options.loadError) throw options.loadError;
      if (!stored) throw new Error(PRIVATE);
      return structuredClone(stored);
    },
    async describe(session) {
      vaultCalls.push({ method: 'describe', args: [session] });
      if (!stored) throw new Error(PRIVATE);
      return descriptor(stored);
    },
  };
  const client: SessionClient = {
    async list() {
      calls.push({ method: 'list', args: [] });
      return options.client?.list ? options.client.list() : [queued()];
    },
    async read(id) {
      calls.push({ method: 'read', args: [id] });
      return options.client?.read ? options.client.read(id) : running();
    },
    async claim(task) {
      calls.push({ method: 'claim', args: [structuredClone(task)] });
      return options.client?.claim ? options.client.claim(task) : running();
    },
    async renew(task) {
      calls.push({ method: 'renew', args: [structuredClone(task)] });
      return options.client?.renew ? options.client.renew(task) : running({ version: 3 });
    },
    async complete(task, value) {
      calls.push({ method: 'complete', args: [structuredClone(task), structuredClone(value)] });
      return options.client?.complete
        ? options.client.complete(task, value)
        : completed({ result: value });
    },
    async block(task, reason) {
      calls.push({ method: 'block', args: [structuredClone(task), reason] });
      return options.client?.block
        ? options.client.block(task, reason)
        : running({
            version: 3,
            status: 'blocked',
            lease_expires_at: null,
            blocked_reason: reason,
          });
    },
  };
  const deps = {
    vault,
    client(value: BridgeCredentials) {
      factories.push(structuredClone(value));
      return client;
    },
    now: () => clock.now,
  };
  return { deps, calls, vaultCalls, factories, saved, clock };
}
const command = (operation: 'renew' | 'complete' | 'block') => ({
  operation,
  session: SESSION,
  id: TASK,
  version: 2,
  claim_id: CLAIM,
  ...(operation === 'complete'
    ? { result: result() }
    : operation === 'block'
      ? { reason: REASON }
      : {}),
});
function safeError(kind: SessionFailure) {
  return (error: unknown) => {
    assert.ok(error instanceof SessionError);
    assert.equal(error.kind, kind);
    assert.equal(error.message, new SessionError(kind).message);
    assert.equal('cause' in error, false);
    for (const representation of [
      String(error),
      JSON.stringify(error),
      inspect(error, { showHidden: true }),
    ])
      for (const secret of [TOKEN, KEY, PRIVATE]) assert.ok(!representation.includes(secret));
    return true;
  };
}
const rejects = (input: unknown, f: ReturnType<typeof fixture>, kind: SessionFailure) =>
  assert.rejects(() => executeBridgeCommand(input, f.deps), safeError(kind));
function noClient(f: ReturnType<typeof fixture>) {
  assert.equal(f.factories.length, 0);
  assert.equal(f.calls.length, 0);
}

test('init saves a fresh 32-byte identity once and returns only its nonsecret unconnected descriptor', async () => {
  const f = fixture({ empty: true });
  const output = await executeBridgeCommand({ operation: 'init', config: config() }, f.deps);
  assert.equal(f.saved.length, 1);
  const saved = f.saved[0];
  assert.match(saved.token, /^[0-9a-f]{64}$/);
  assert.equal(Buffer.from(saved.token, 'hex').byteLength, 32);
  assert.match(
    saved.bridgeId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.deepEqual(saved, { ...config(), bridgeId: saved.bridgeId, token: saved.token });
  assert.deepEqual(output, {
    kind: 'pairing_descriptor',
    descriptor: descriptor(saved),
    connected: false,
  });
  assert.ok(!JSON.stringify(output).includes(saved.token));
  assert.ok(!JSON.stringify(output).includes(KEY));
  noClient(f);
  await rejects({ operation: 'init', config: config() }, f, 'vault');
  assert.equal(f.saved.length, 1);
  assert.deepEqual(
    await executeBridgeCommand({ operation: 'describe', session: SESSION }, f.deps),
    output,
  );
});

test('describe reuses the exact saved identity without generation, save, or client creation', async () => {
  const f = fixture();
  const input = { operation: 'describe', session: SESSION };
  const first = await executeBridgeCommand(input, f.deps);
  assert.deepEqual(first, {
    kind: 'pairing_descriptor',
    descriptor: descriptor(),
    connected: false,
  });
  assert.deepEqual(await executeBridgeCommand(input, f.deps), first);
  assert.equal(f.saved.length, 0);
  assert.ok(f.vaultCalls.every((call) => call.args[0] === SESSION && call.method !== 'save'));
  noClient(f);
});

test('unknown operations, edited shapes, invalid sessions, IDs and versions fail before vault or client use', async () => {
  const invalid: unknown[] = [
    null,
    [],
    'list',
    {},
    { operation: 'list' },
    ...['create', 'cancel', 'retry', 'notes', 'gold', 'poll', 'execute', 'register'].map(
      (operation) => ({ operation, session: SESSION }),
    ),
    { operation: 'list', session: SESSION, token: TOKEN },
    { operation: 'describe', session: SESSION, connected: true },
    { operation: 'claim', session: SESSION, id: TASK, version: 1, claim_id: CLAIM },
    { ...command('renew'), result: result() },
    { ...command('complete'), reason: REASON },
    ...['', 'codex:short', 'other:synthetic_0001', SESSION + '\n'].map((session) => ({
      operation: 'list',
      session,
    })),
    ...['', OTHER.toUpperCase(), TASK + '\n', 'not-a-uuid'].map((id) => ({
      operation: 'read',
      session: SESSION,
      id,
    })),
    ...[undefined, '2', 0, -1, 1.5, NaN, Infinity, 1000000001].map((version) => ({
      ...command('renew'),
      version,
    })),
    { ...command('renew'), claim_id: OTHER.toUpperCase() },
  ];
  for (const input of invalid) {
    const f = fixture();
    await rejects(input, f, 'invalid');
    noClient(f);
    assert.equal(f.vaultCalls.length, 0);
  }
});

test('init rejects unsafe configuration, expiry and clock before identity persistence or any client call', async () => {
  for (const change of [
    { projectUrl: 'http://fixture.supabase.co' },
    { projectUrl: 'https://fixture.supabase.co/' },
    { projectUrl: 'https://user:pass@fixture.supabase.co' },
    { projectUrl: 'https://other.example' },
    { publishableKey: 'sb_secret_synthetic_forbidden' },
    { publishableKey: KEY + '\n' },
    { ownerId: OTHER.toUpperCase() },
    { session: SESSION + '\n' },
    { expiresAt: '2026-09-08T12:00:00Z' },
    { expiresAt: '2026-09-19T23:52:33Z' },
    { expiresAt: '2026-02-30T12:00:00Z' },
    { expiresAt: '2026-09-10T12:00:00+00:00' },
    { token: TOKEN },
    { bridgeId: BRIDGE },
  ]) {
    const f = fixture({ empty: true });
    await rejects({ operation: 'init', config: { ...config(), ...change } }, f, 'invalid');
    assert.equal(f.vaultCalls.length, 0);
    noClient(f);
  }
  for (const now of [NaN, Infinity, -1, NOW + 0.5]) {
    const f = fixture({ now });
    await rejects({ operation: 'list', session: SESSION }, f, 'invalid');
    noClient(f);
  }
});

test('completion validates its whole result before even reading the saved task', async () => {
  const good = result(),
    source = good.sources[0];
  for (const value of [
    null,
    {},
    [],
    { ...good, text: '' },
    { ...good, text: 'x'.repeat(20001) },
    { ...good, sources: [] },
    { ...good, sources: Array.from({ length: 31 }, () => source) },
    { ...good, extra: PRIVATE },
    { ...good, limitations: '\u0000' },
    { ...good, text: '\ud800' },
    { ...good, sources: [{ ...source, extra: TOKEN }] },
    { ...good, sources: [{ ...source, url: 'javascript:alert(1)' }] },
    { ...good, sources: [{ ...source, url: 'https://user:pass@primary.example/' }] },
    { ...good, sources: [{ ...source, retrieved_at: '2026-02-30T12:00:00Z' }] },
  ]) {
    const f = fixture();
    await rejects({ ...command('complete'), result: value }, f, 'invalid');
    noClient(f);
    assert.equal(f.vaultCalls.length, 0);
  }
});

test('block rejects blank, oversized and invalid Unicode reasons before vault or client use', async () => {
  for (const reason of ['', ' \n ', 'x'.repeat(4001), '\u0000', '\ud800', 4, null]) {
    const f = fixture();
    await rejects({ ...command('block'), reason }, f, 'invalid');
    noClient(f);
    assert.equal(f.vaultCalls.length, 0);
  }
});

test('list and read return exact inert question and result text with no write or execution', async () => {
  const f = fixture({
    client: {
      async read() {
        return completed();
      },
    },
  });
  assert.deepEqual(await executeBridgeCommand({ operation: 'list', session: SESSION }, f.deps), {
    kind: 'research_tasks',
    tasks: [queued()],
  });
  assert.deepEqual(
    await executeBridgeCommand({ operation: 'read', session: SESSION, id: TASK }, f.deps),
    { kind: 'research_task', task: completed() },
  );
  assert.deepEqual(f.calls, [
    { method: 'list', args: [] },
    { method: 'read', args: [TASK] },
  ]);
  assert.ok(f.factories.every((value) => JSON.stringify(value) === JSON.stringify(credentials())));
});

test('list accepts twenty distinct tasks and rejects malformed, duplicate, oversized and foreign-claim output', async () => {
  const rows = Array.from({ length: 20 }, (_, index) =>
    queued({ id: `${index.toString(16).padStart(8, '0')}-3333-4333-8333-333333333333` }),
  );
  const good = fixture({
    client: {
      async list() {
        return rows;
      },
    },
  });
  assert.deepEqual(await executeBridgeCommand({ operation: 'list', session: SESSION }, good.deps), {
    kind: 'research_tasks',
    tasks: rows,
  });
  for (const rows of [
    null,
    {},
    [null],
    [queued(), queued()],
    Array.from({ length: 21 }, () => queued()),
    [running({ bridge_id: OTHER })],
  ]) {
    const f = fixture({
      client: {
        async list() {
          return rows as BridgeTask[];
        },
      },
    });
    await rejects({ operation: 'list', session: SESSION }, f, 'unavailable');
    assert.equal(f.calls.length, 1);
  }
});

test('claim sends only the explicit task ID and caller version in one write without adopting a newer read', async () => {
  const f = fixture();
  assert.deepEqual(
    await executeBridgeCommand(
      { operation: 'claim', session: SESSION, id: TASK, version: 1 },
      f.deps,
    ),
    { kind: 'research_task', task: running() },
  );
  assert.deepEqual(f.calls, [{ method: 'claim', args: [{ id: TASK, version: 1 }] }]);
});

test('renew, complete and block read once then submit the exact bound claim and preserved text once', async () => {
  for (const operation of ['renew', 'complete', 'block'] as const) {
    const f = fixture();
    const output = await executeBridgeCommand(command(operation), f.deps);
    const expected =
      operation === 'renew'
        ? running({ version: 3 })
        : operation === 'complete'
          ? completed()
          : running({
              version: 3,
              status: 'blocked',
              lease_expires_at: null,
              blocked_reason: REASON,
            });
    assert.deepEqual(output, { kind: 'research_task', task: expected });
    assert.deepEqual(f.calls, [
      { method: 'read', args: [TASK] },
      {
        method: operation,
        args:
          operation === 'renew'
            ? [running()]
            : [running(), operation === 'complete' ? result() : REASON],
      },
    ]);
  }
});

test('saved version, claim identity, running state and live lease are never silently adopted or renewed', async () => {
  for (const saved of [
    running({ version: 3 }),
    running({ claim_id: OTHER }),
    queued(),
    completed(),
    running({ lease_expires_at: new Date(NOW).toISOString() }),
    running({ lease_expires_at: new Date(NOW - 1).toISOString() }),
  ]) {
    for (const operation of ['renew', 'complete', 'block'] as const) {
      const f = fixture({
        client: {
          async read() {
            return saved;
          },
        },
      });
      await rejects(command(operation), f, 'conflict');
      assert.deepEqual(f.calls, [{ method: 'read', args: [TASK] }]);
    }
  }
});

test('wrong saved task, bridge, session and malformed claims fail before any mutation', async () => {
  for (const saved of [
    running({ id: OTHER }),
    running({ bridge_id: OTHER }),
    running({ worker_session: 'claude:synthetic_0002' }),
    running({ claim_id: null }),
    running({ lease_expires_at: null }),
  ]) {
    const f = fixture({
      client: {
        async read() {
          return saved;
        },
      },
    });
    await rejects(command('complete'), f, 'unavailable');
    assert.deepEqual(f.calls, [{ method: 'read', args: [TASK] }]);
  }
});

test('vault errors, mismatched loaded session and expired credentials stop before constructing the injected client', async () => {
  for (const options of [
    { empty: true },
    { loadError: new Error(PRIVATE) },
    { stored: { ...credentials(), session: 'claude:synthetic_0002' } },
    { stored: { ...credentials(), expiresAt: new Date(NOW).toISOString() } },
    { stored: { ...credentials(), token: 'not-a-token' } },
  ]) {
    const f = fixture(options);
    await rejects({ operation: 'list', session: SESSION }, f, 'vault');
    noClient(f);
  }
  const f = fixture({ empty: true, saveError: new Error(PRIVATE) });
  await rejects({ operation: 'init', config: config() }, f, 'vault');
  noClient(f);
  assert.equal(f.saved.length, 0);
});

test('provider errors keep safe typed failures while unknown reads and writes have distinct uncertainty and never retry', async () => {
  for (const [failure, readKind, writeKind] of [
    [new BridgeError('denied', PRIVATE), 'denied', 'denied'],
    [new BridgeError('conflict', PRIVATE), 'conflict', 'conflict'],
    [new BridgeError('invalid', PRIVATE), 'invalid', 'invalid'],
    [new BridgeError('uncertain', PRIVATE), 'uncertain', 'uncertain'],
    [new BridgeError('unavailable', PRIVATE), 'unavailable', 'uncertain'],
    [new Error(PRIVATE, { cause: TOKEN }), 'unavailable', 'uncertain'],
  ] as const) {
    const read = fixture({
      client: {
        async list() {
          throw failure;
        },
      },
    });
    await rejects({ operation: 'list', session: SESSION }, read, readKind);
    assert.equal(read.calls.length, 1);
    const write = fixture({
      client: {
        async claim() {
          throw failure;
        },
      },
    });
    await rejects({ operation: 'claim', session: SESSION, id: TASK, version: 1 }, write, writeKind);
    assert.equal(write.calls.length, 1);
  }
});

test('failed preflight reads never reach a mutation; failed mutations never repeat either phase', async () => {
  for (const operation of ['renew', 'complete', 'block'] as const) {
    const read = fixture({
      client: {
        async read() {
          throw new Error(PRIVATE);
        },
      },
    });
    await rejects(command(operation), read, 'unavailable');
    assert.deepEqual(
      read.calls.map((call) => call.method),
      ['read'],
    );
    const write = fixture({
      client: {
        [operation]: async () => {
          throw new Error(PRIVATE);
        },
      },
    });
    await rejects(command(operation), write, 'uncertain');
    assert.deepEqual(
      write.calls.map((call) => call.method),
      ['read', operation],
    );
  }
});

test('wrong write response identity, version, claim, state and result are uncertain after exactly one mutation', async () => {
  for (const value of [
    null,
    {},
    running({ id: OTHER }),
    running({ version: 1 }),
    running({ version: 3 }),
    queued({ version: 2 }),
    running({ bridge_id: OTHER }),
    running({ worker_session: 'claude:synthetic_0002' }),
  ]) {
    const f = fixture({
      client: {
        async claim() {
          return value as BridgeTask;
        },
      },
    });
    await rejects({ operation: 'claim', session: SESSION, id: TASK, version: 1 }, f, 'uncertain');
    assert.equal(f.calls.length, 1);
  }
  for (const value of [
    completed({ claim_id: OTHER }),
    completed({ version: 2 }),
    completed({ result: {} as ResearchResult }),
    running({ version: 3 }),
  ]) {
    const f = fixture({
      client: {
        async complete() {
          return value;
        },
      },
    });
    await rejects(command('complete'), f, 'uncertain');
    assert.deepEqual(
      f.calls.map((call) => call.method),
      ['read', 'complete'],
    );
  }
});

test('token-bearing task fields and nested evidence are refused on reads and remain uncertain after writes', async () => {
  for (const value of [
    completed({ question: `prefix ${TOKEN} suffix` }),
    completed({ result: { ...result(), text: TOKEN } }),
    completed({ result: { ...result(), limitations: TOKEN } }),
    completed({ result: { ...result(), sources: [{ ...result().sources[0], title: TOKEN }] } }),
    completed({
      result: {
        ...result(),
        sources: [{ ...result().sources[0], url: `https://primary.example/${TOKEN}` }],
      },
    }),
  ]) {
    const read = fixture({
      client: {
        async read() {
          return value;
        },
      },
    });
    await rejects({ operation: 'read', session: SESSION, id: TASK }, read, 'unavailable');
    assert.equal(read.calls.length, 1);
    const write = fixture({
      client: {
        async complete() {
          return value;
        },
      },
    });
    await rejects(command('complete'), write, 'uncertain');
    assert.deepEqual(
      write.calls.map((call) => call.method),
      ['read', 'complete'],
    );
  }
});

test('accidentally supplied current token in result or reason is blocked before creating any client', async () => {
  for (const input of [
    { ...command('complete'), result: { ...result(), text: TOKEN } },
    { ...command('block'), reason: TOKEN },
  ]) {
    const f = fixture();
    await rejects(input, f, 'unavailable');
    noClient(f);
  }
});

test('describe also refuses a token-bearing saved descriptor rather than leaking it through the session field', async () => {
  const stored = { ...credentials(), session: `codex:${TOKEN}` };
  const f = fixture({ stored });
  await rejects({ operation: 'describe', session: stored.session }, f, 'vault');
  noClient(f);
});

test('CLI refuses malformed, unknown, edited, oversized and invalid UTF-8 commands with only safe JSON errors', () => {
  // No helper file is written. If a malformed-input guard regresses, intercept
  // the vault subprocess before it can start; the unexpected marker fails this
  // test. Clearing the child environment also excludes user NODE_OPTIONS.
  const guard =
    'data:text/javascript,' +
    encodeURIComponent(`
    import childProcess from 'node:child_process';
    import { syncBuiltinESMExports } from 'node:module';
    childProcess.spawn = () => {
      process.stderr.write('UNEXPECTED_VAULT_INVOCATION');
      throw new Error('Synthetic subprocess blocked');
    };
    syncBuiltinESMExports();
    globalThis.fetch = async () => {
      process.stderr.write('UNEXPECTED_NETWORK_INVOCATION');
      throw new Error('Synthetic network blocked');
    };
  `);
  const validRead = JSON.stringify({ operation: 'list', session: SESSION });
  const oversized = validRead + ' '.repeat(512 * 1024 + 1 - Buffer.byteLength(validRead));
  assert.equal(Buffer.byteLength(oversized), 512 * 1024 + 1);
  // Replacing invalid UTF-8 permissively would leave a valid block command,
  // reaching the forbidden-vault sentinel. The fatal decoder is meaningful.
  const invalidUtf8 = Buffer.concat([
    Buffer.from(
      JSON.stringify({ ...command('block'), reason: 'UTF8_MARKER' }).replace('UTF8_MARKER', 'left'),
    ),
  ]);
  const marker = invalidUtf8.indexOf(Buffer.from('left'));
  assert.ok(marker >= 0);
  const malformedBytes = Buffer.concat([
    invalidUtf8.subarray(0, marker),
    Buffer.from([0xc3, 0x28]),
    invalidUtf8.subarray(marker + 4),
  ]);
  const cases: Array<{ input: string | Buffer; args?: string[] }> = [
    { input: '' },
    { input: '{ malformed ' + PRIVATE },
    { input: JSON.stringify({ operation: 'execute', session: SESSION }) },
    { input: JSON.stringify({ operation: 'list', session: SESSION, secret: PRIVATE }) },
    { input: JSON.stringify({ ...command('renew'), version: 0 }) },
    { input: oversized },
    { input: malformedBytes },
    { input: validRead, args: [PRIVATE] },
  ];
  for (const value of cases) {
    const child = spawnSync(
      process.execPath,
      [
        '--import',
        guard,
        '--import',
        'tsx',
        fileURLToPath(new URL('../scripts/xiv-research-bridge.ts', import.meta.url)),
        ...(value.args ?? []),
      ],
      {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
        env: { NODE_ENV: 'test' },
        input: value.input,
        encoding: 'utf8',
        windowsHide: true,
        timeout: 10000,
        maxBuffer: 8192,
      },
    );
    assert.equal(child.error, undefined);
    assert.equal(child.status, 1);
    assert.equal(child.signal, null);
    assert.equal(child.stderr, '');
    assert.equal(
      child.stdout,
      JSON.stringify({
        kind: 'error',
        error: 'invalid',
        message: new SessionError('invalid').message,
      }) + '\n',
    );
    for (const secret of [TOKEN, KEY, PRIVATE]) assert.ok(!child.stdout.includes(secret));
  }
});
