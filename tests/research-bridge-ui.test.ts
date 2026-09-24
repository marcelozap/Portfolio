import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import test from 'node:test';
import {
  acknowledgePairing,
  approveBridge,
  connectionLabel,
  emptyPairingDraft,
  loadBridges,
  parsePairingText,
  preparePairing,
  revokeBridge,
} from '../src/components/desk/bridge-ui';
import { ResearchRequestError } from '../src/components/desk/research-client';
import type { BridgeDescriptor, BridgeMetadata } from '../src/lib/desk/bridge-contracts';

// Pure helper tests: all descriptors, metadata, clocks and HTTP responses are
// synthetic. Fetch is always injected; no browser, credentials or provider is used.
const NOW = Date.parse('2026-09-08T12:00:00Z');
const SERVER_TIME = '2026-09-08T12:00:00.000Z';
const ID = 'aaaaaaaa-2222-4222-8222-222222222222';
const OTHER = 'bbbbbbbb-3333-4333-8333-333333333333';
const SESSION = 'codex:synthetic_0001';
const EXPIRES = '2026-09-10T12:00:00Z';
const HASH = 'a'.repeat(64);
const SECRET = '0123456789abcdef'.repeat(4);
const PRIVATE = `SYNTHETIC-PRIVATE-PASTE ${SECRET}`;
const descriptor = (): BridgeDescriptor => ({
  id: ID,
  session: SESSION,
  token_sha256: HASH,
  expires_at: EXPIRES,
});
function metadata(overrides: Record<string, unknown> = {}): BridgeMetadata {
  return {
    id: ID,
    session: SESSION,
    created_at: '2026-09-08T11:00:00Z',
    expires_at: EXPIRES,
    revoked_at: null,
    last_seen_at: null,
    ...overrides,
  } as BridgeMetadata;
}
type Call = { url: string; init: RequestInit };
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
function fixture(reply: (call: Call, index: number) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const transport: typeof fetch = async (input, init) => {
    assert.equal(typeof input, 'string');
    assert.ok(init);
    const call = { url: String(input), init };
    calls.push(call);
    return reply(call, calls.length - 1);
  };
  return { transport, calls };
}
function privateError(error: unknown) {
  assert.ok(error instanceof Error);
  for (const message of [
    String(error),
    JSON.stringify(error),
    inspect(error, { showHidden: true }),
  ])
    for (const secret of [SECRET, PRIVATE]) assert.ok(!message.includes(secret));
  return true;
}
function statusError(status: number) {
  return (error: unknown) => {
    privateError(error);
    assert.ok(error instanceof ResearchRequestError);
    assert.equal(error.status, status);
    return true;
  };
}
function request(call: Call, suffix: string, body?: object) {
  assert.equal(call.url, '/api/desk/research/bridges' + suffix);
  for (const forbidden of [SECRET, HASH, ID]) assert.ok(!call.url.includes(forbidden));
  assert.equal(call.init.method, body === undefined ? 'GET' : 'POST');
  assert.equal(call.init.credentials, 'same-origin');
  assert.equal(call.init.cache, 'no-store');
  assert.equal(call.init.redirect, 'error');
  assert.ok(call.init.signal instanceof AbortSignal);
  const headers = new Headers(call.init.headers);
  assert.equal(headers.get('x-xiv-desk'), '1');
  assert.equal(headers.has('authorization'), false);
  assert.equal(headers.has('apikey'), false);
  assert.ok(!JSON.stringify([...headers]).includes(SECRET));
  if (body === undefined) assert.equal(call.init.body, undefined);
  else {
    assert.equal(headers.get('content-type'), 'application/json');
    assert.deepEqual(JSON.parse(call.init.body as string), body);
  }
}

test('descriptor parsing preserves exactly the four nonsecret approval fields and never creates an identity', () => {
  const value = descriptor();
  const text = ' \n' + JSON.stringify(value, null, 2) + '\t ';
  assert.deepEqual(parsePairingText(text, NOW), value);
  assert.deepEqual(parsePairingText(text, NOW), value);
  assert.deepEqual(Object.keys(parsePairingText(text, NOW)).sort(), [
    'expires_at',
    'id',
    'session',
    'token_sha256',
  ]);
  assert.ok(!JSON.stringify(parsePairingText(text, NOW)).includes(SECRET));
  const claude = { ...value, session: 'claude:synthetic_0002' };
  assert.deepEqual(parsePairingText(JSON.stringify(claude), NOW), claude);
});

test('malformed, incomplete, secret-bearing and extra-field pastes fail without echoing pasted contents', () => {
  const value = descriptor();
  const bad: unknown[] = [
    null,
    [],
    {},
    SECRET,
    { descriptor: value, token: SECRET },
    { ...value, token: SECRET },
    { ...value, owner_id: OTHER },
    { ...value, publishableKey: PRIVATE },
    { ...value, password: PRIVATE },
    { ...value, projectUrl: 'https://fixture.supabase.co' },
    { ...value, token_sha256: SECRET + '\n' },
    { ...value, id: ID.toUpperCase() },
    { ...value, id: ID + '\n' },
    { ...value, session: SESSION + '\n' },
    { ...value, session: 'codex:short' },
    { ...value, session: 'other:synthetic_0001' },
    { ...value, token_sha256: HASH.toUpperCase() },
    { ...value, token_sha256: HASH.slice(1) },
  ];
  for (const key of ['id', 'session', 'token_sha256', 'expires_at']) {
    const missing = { ...value } as Record<string, unknown>;
    delete missing[key];
    bad.push(missing);
  }
  for (const value of bad)
    assert.throws(() => parsePairingText(JSON.stringify(value), NOW), privateError);
  for (const text of ['', PRIVATE, '{"token":' + PRIVATE, JSON.stringify(value) + PRIVATE])
    assert.throws(() => parsePairingText(text, NOW), privateError);
});

test('descriptor expiry is finite, canonical, in the future, at most fourteen days away and no later than the original stop', () => {
  for (const expires_at of [
    '',
    'now',
    'infinity',
    '2026-09-10',
    '2026-09-10T12:00:00+00:00',
    '2026-02-30T12:00:00Z',
    '2026-09-10T12:00:00Z\n',
    '2026-09-08T12:00:00Z',
    '2026-09-08T11:59:59Z',
    '2026-09-19T23:52:32.001Z',
    '2026-09-20T00:00:00Z',
  ])
    assert.throws(
      () => parsePairingText(JSON.stringify({ ...descriptor(), expires_at }), NOW),
      privateError,
    );
  const earlier = Date.parse('2026-08-25T12:00:00Z');
  assert.throws(
    () =>
      parsePairingText(
        JSON.stringify({ ...descriptor(), expires_at: '2026-09-08T12:00:00.001Z' }),
        earlier,
      ),
    privateError,
  );
  assert.equal(
    parsePairingText(
      JSON.stringify({ ...descriptor(), expires_at: '2026-09-08T12:00:00Z' }),
      earlier,
    ).expires_at,
    '2026-09-08T12:00:00Z',
  );
  assert.equal(
    parsePairingText(JSON.stringify({ ...descriptor(), expires_at: '2026-09-19T23:52:32Z' }), NOW)
      .expires_at,
    '2026-09-19T23:52:32Z',
  );
});

test('paste budget accepts exactly 4096 bytes of valid JSON and rejects one more byte', () => {
  const raw = JSON.stringify(descriptor());
  const boundary = raw + ' '.repeat(4096 - Buffer.byteLength(raw, 'utf8'));
  assert.equal(Buffer.byteLength(boundary, 'utf8'), 4096);
  assert.deepEqual(parsePairingText(boundary, NOW), descriptor());
  assert.throws(() => parsePairingText(boundary + ' ', NOW), privateError);
});

test('preparing and retrying an approval preserve the exact descriptor without mutating the held draft', () => {
  assert.deepEqual(emptyPairingDraft(), { descriptor: null, attempted: false });
  assert.throws(() => preparePairing(emptyPairingDraft()), privateError);
  const value = Object.freeze(descriptor());
  const draft = Object.freeze({ descriptor: value, attempted: false });
  const pending = preparePairing(draft);
  assert.deepEqual(draft, { descriptor: value, attempted: false });
  assert.deepEqual(pending, { descriptor: value, attempted: true });
  assert.deepEqual(preparePairing(pending), pending);
  assert.equal(pending.descriptor?.id, ID);
  assert.equal(pending.descriptor?.token_sha256, HASH);
});

test('acknowledgement clears only a matching approved identity, session and exact expiry instant', () => {
  const pending = preparePairing({ descriptor: descriptor(), attempted: false });
  assert.deepEqual(acknowledgePairing(pending, metadata()), emptyPairingDraft());
  assert.deepEqual(
    acknowledgePairing(pending, metadata({ expires_at: '2026-09-10T12:00:00.000000+00:00' })),
    emptyPairingDraft(),
  );
  for (const row of [
    metadata({ id: OTHER }),
    metadata({ session: 'claude:synthetic_0002' }),
    metadata({ expires_at: '2026-09-10T12:00:00.001Z' }),
    metadata({ expires_at: '2026-09-10T12:00:00.000001+00:00' }),
    metadata({ created_at: 'not-a-date' }),
    metadata({ revoked_at: 'not-a-date' }),
  ])
    assert.throws(() => acknowledgePairing(pending, row), privateError);
  assert.deepEqual(pending, { descriptor: descriptor(), attempted: true });
});

test('status labels distinguish approval, expiry, revocation and last credential use without claiming a worker is online', () => {
  assert.equal(connectionLabel(metadata(), NOW), 'Approved · awaiting first check');
  assert.equal(connectionLabel(metadata(), NOW + 0.5), 'Approved · awaiting first check');
  assert.equal(connectionLabel(metadata(), Date.parse(EXPIRES)), 'Approval expired');
  assert.equal(
    connectionLabel(metadata({ revoked_at: '2026-09-08T11:59:00Z' }), Date.parse(EXPIRES) + 1),
    'Access revoked',
  );
  for (const [last_seen_at, expected] of [
    ['2026-09-08T12:00:00Z', 'Last check less than a minute ago'],
    ['2026-09-08T11:59:00Z', 'Last check 1 min ago'],
    ['2026-09-08T11:00:00Z', 'Last check 1 hr ago'],
  ]) {
    const label = connectionLabel(metadata({ last_seen_at }), NOW);
    assert.equal(label, expected);
    assert.doesNotMatch(label, /\bonline\b|\bconnected\b|\brunning\b|\blive\b/i);
  }
  for (const [row, now] of [
    [metadata(), NaN],
    [metadata(), Infinity],
    [metadata({ created_at: 'not-a-date' }), NOW],
    [metadata({ expires_at: 'not-a-date' }), NOW],
    [metadata({ revoked_at: 'not-a-date' }), NOW],
    [metadata({ last_seen_at: 'not-a-date' }), NOW],
    [metadata({ last_seen_at: '2026-09-08T12:00:01Z' }), NOW],
    [metadata({ created_at: '2026-09-08T12:00:01Z' }), NOW],
    [metadata({ revoked_at: '2026-09-08T12:00:01Z' }), NOW],
  ] as const)
    assert.match(connectionLabel(row, now), /unavailable/i);
});

test('list, register and revoke use fixed private same-origin requests and safe shaped metadata', async () => {
  const approved = metadata();
  const revoked = metadata({ revoked_at: '2026-09-08T11:59:00Z' });
  const replies = [
    { bridges: [approved], server_time: SERVER_TIME },
    { bridge: approved, server_time: SERVER_TIME },
    { bridge: revoked, server_time: SERVER_TIME },
  ];
  const f = fixture((_call, index) => json(replies[index]));
  assert.deepEqual(await loadBridges(f.transport), replies[0]);
  assert.deepEqual(await approveBridge(descriptor(), f.transport, NOW), replies[1]);
  assert.deepEqual(await revokeBridge(ID, f.transport), replies[2]);
  assert.equal(f.calls.length, 3);
  request(f.calls[0], '');
  request(f.calls[1], '/register', descriptor());
  request(f.calls[2], '/revoke', { id: ID });
});

test('invalid approval descriptors and revoke identities are refused before transport', async () => {
  const f = fixture(() => {
    throw new Error('Unexpected transport');
  });
  for (const value of [
    { ...descriptor(), token: SECRET },
    { ...descriptor(), owner_id: OTHER },
    { ...descriptor(), session: SESSION + '\n' },
    { ...descriptor(), id: OTHER.toUpperCase() },
    { ...descriptor(), token_sha256: HASH.toUpperCase() },
    { ...descriptor(), expires_at: '2026-09-08T12:00:00Z' },
    { ...descriptor(), expires_at: '2026-09-19T23:52:32.001Z' },
  ])
    await assert.rejects(() => approveBridge(value, f.transport, NOW), privateError);
  for (const id of ['', ID + '\n', ID.toUpperCase(), 'not-a-uuid'])
    await assert.rejects(() => revokeBridge(id, f.transport), privateError);
  assert.equal(f.calls.length, 0);
});

test('unconfirmed registration retries reuse the exact descriptor and retain it through auth loss', async () => {
  const pending = preparePairing({ descriptor: descriptor(), attempted: false });
  const before = structuredClone(pending);
  const f = fixture((_call, index) => {
    if (index === 0) throw new Error(PRIVATE);
    if (index === 1) return json({ error: PRIVATE }, 401);
    if (index === 2) return json({ error: PRIVATE }, 403);
    return json({ bridge: metadata(), server_time: SERVER_TIME });
  });
  for (const status of [503, 401, 403]) {
    await assert.rejects(
      () => approveBridge(pending.descriptor!, f.transport, NOW),
      statusError(status),
    );
    assert.deepEqual(pending, before);
    assert.deepEqual(preparePairing(pending), before);
  }
  const confirmed = await approveBridge(pending.descriptor!, f.transport, NOW);
  assert.deepEqual(acknowledgePairing(pending, confirmed.bridge), emptyPairingDraft());
  assert.equal(f.calls.length, 4);
  for (const call of f.calls) request(call, '/register', descriptor());
});

test('list rejects malformed clocks, malformed metadata and duplicate identities without exposing raw fields', async () => {
  for (const value of [
    null,
    [],
    {},
    { bridges: [], server_time: 'not-a-date' },
    { bridges: [], server_time: '2026-02-30T12:00:00Z' },
    { bridges: [], server_time: 42 },
    { bridges: {}, server_time: SERVER_TIME },
    { bridges: [null], server_time: SERVER_TIME },
    { bridges: [metadata(), metadata()], server_time: SERVER_TIME },
    { bridges: [metadata({ id: 'bad', token: SECRET })], server_time: SERVER_TIME },
    { bridges: [metadata({ expires_at: '2026-09-08T10:59:59Z' })], server_time: SERVER_TIME },
    { bridges: [metadata({ session: 'untrusted:synthetic_0001' })], server_time: SERVER_TIME },
  ]) {
    const f = fixture(() => json(value));
    await assert.rejects(() => loadBridges(f.transport), statusError(503));
    assert.equal(f.calls.length, 1);
  }
  const f = fixture(() =>
    json({
      bridges: [
        metadata({ token: SECRET, token_sha256: HASH, owner_id: OTHER, diagnostic: PRIVATE }),
      ],
      server_time: SERVER_TIME,
    }),
  );
  const value = await loadBridges(f.transport);
  assert.deepEqual(value.bridges, [metadata()]);
  assert.ok(!JSON.stringify(value).includes(SECRET));
  assert.ok(!JSON.stringify(value).includes('token_sha256'));
});

test('register and revoke reject mismatched write confirmations and leave the held approval intact', async () => {
  const pending = preparePairing({ descriptor: descriptor(), attempted: false });
  for (const bridge of [
    metadata({ id: OTHER }),
    metadata({ session: 'claude:synthetic_0002' }),
    metadata({ expires_at: '2026-09-10T12:00:00.000001+00:00' }),
    metadata({ created_at: 'not-a-date' }),
  ]) {
    const f = fixture(() => json({ bridge, server_time: SERVER_TIME }));
    await assert.rejects(
      () => approveBridge(pending.descriptor!, f.transport, NOW),
      statusError(503),
    );
    assert.equal(f.calls.length, 1);
    assert.deepEqual(pending, { descriptor: descriptor(), attempted: true });
  }
  for (const bridge of [metadata(), metadata({ id: OTHER, revoked_at: '2026-09-08T11:59:00Z' })]) {
    const f = fixture(() => json({ bridge, server_time: SERVER_TIME }));
    await assert.rejects(() => revokeBridge(ID, f.transport), statusError(503));
    assert.equal(f.calls.length, 1);
  }
});

test('HTTP errors preserve actionable status, sanitize provider messages and never retry automatically', async () => {
  for (const status of [400, 401, 403, 409, 429, 500, 503]) {
    for (const write of [false, true]) {
      const f = fixture(() => json({ error: PRIVATE, hint: SECRET }, status));
      await assert.rejects(
        () => (write ? approveBridge(descriptor(), f.transport, NOW) : loadBridges(f.transport)),
        statusError(status),
      );
      assert.equal(f.calls.length, 1);
    }
  }
});

test('network, unreadable bodies and redirect failures are safely unavailable without retry', async () => {
  const replies: Array<() => Response> = [
    () => {
      throw new Error(PRIVATE);
    },
    () => new Response('invalid-json ' + PRIVATE),
    () => new Response(null),
    () => {
      const response = json({ bridge: metadata(), bridges: [], server_time: SERVER_TIME });
      Object.defineProperty(response, 'redirected', { value: true });
      return response;
    },
    () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.error(new Error(PRIVATE));
          },
        }),
      ),
  ];
  for (const reply of replies) {
    for (const write of [false, true]) {
      const f = fixture(reply);
      await assert.rejects(
        () => (write ? approveBridge(descriptor(), f.transport, NOW) : loadBridges(f.transport)),
        statusError(503),
      );
      assert.equal(f.calls.length, 1);
    }
  }
});

test('response byte limit accepts one MiB and rejects one extra byte of otherwise-valid read or write JSON', async () => {
  const limit = 1024 * 1024;
  for (const write of [false, true]) {
    const value = write
      ? { bridge: metadata(), server_time: SERVER_TIME }
      : { bridges: [], server_time: SERVER_TIME };
    const raw = JSON.stringify(value);
    const boundary = raw + ' '.repeat(limit - Buffer.byteLength(raw));
    assert.equal(Buffer.byteLength(boundary), limit);
    const good = fixture(() => new Response(boundary));
    assert.deepEqual(
      await (write
        ? approveBridge(descriptor(), good.transport, NOW)
        : loadBridges(good.transport)),
      value,
    );
    const bad = fixture(() => new Response(boundary + ' '));
    await assert.rejects(
      () => (write ? approveBridge(descriptor(), bad.transport, NOW) : loadBridges(bad.transport)),
      statusError(503),
    );
    assert.equal(good.calls.length, 1);
    assert.equal(bad.calls.length, 1);
  }
});
