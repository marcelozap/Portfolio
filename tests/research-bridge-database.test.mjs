import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// All identities, capabilities, questions, and evidence are synthetic. Execute the
// actual migrations in offline PostgreSQL without environment, provider, or model access.
const OWNER = '00000000-0000-0000-0000-000000000001';
const SECOND = '00000000-0000-0000-0000-000000000002';
const NONMEMBER = '00000000-0000-0000-0000-000000000003';
const TASK = '10000000-0000-0000-0000-000000000001';
const OTHER_TASK = '10000000-0000-0000-0000-000000000002';
const FOREIGN_TASK = '10000000-0000-0000-0000-000000000003';
const BRIDGE = '20000000-0000-0000-0000-000000000001';
const OTHER_BRIDGE = '20000000-0000-0000-0000-000000000002';
const WRONG_CLAIM = '90000000-0000-0000-0000-000000000001';
const SESSION = 'codex:synthetic_bridge_01';
const TOKEN = 'a'.repeat(64);
const OTHER_TOKEN = 'b'.repeat(64);
const DEADLINE = '2026-09-19T23:52:32Z';
const QUESTION = '  Synthetic bridge question?\nPreserve Café and every space.  ';
const metadataKeys = [
  'id',
  'session',
  'created_at',
  'expires_at',
  'revoked_at',
  'last_seen_at',
].sort();
const tables = [
  'public.xiv_research_tasks',
  'public.xiv_research_events',
  'xiv_private.research_bridges',
  'xiv_private.research_bridge_events',
];
const migrations = await Promise.all(
  [
    '202609080001_xiv_private_desk.sql',
    '202609080002_xiv_research_tasks.sql',
    '202609080003_xiv_research_bridges.sql',
  ].map((name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8')),
);
let db;

const digest = (token) => createHash('sha256').update(token, 'utf8').digest('hex');
const capability = (overrides = {}) => ({
  id: BRIDGE,
  token: TOKEN,
  session: SESSION,
  expires: new Date(Date.now() + 60 * 60000).toISOString(),
  ...overrides,
});
const input = (question = QUESTION) => ({ question, scope: 'public_primary_sources' });
const source = () => ({
  url: 'https://primary.example:443/synthetic/%E2%9C%93?version=1#evidence',
  title: 'Synthetic primary publication',
  retrieved_at: '2026-09-08T12:30:45.123456Z',
});
const result = () => ({
  text: '  A synthetic sourced finding.\n',
  sources: [source()],
  limitations: 'Synthetic fixture only; no source was fetched.',
});
const claimPayload = (task, extra = {}) => ({ claim_id: task.claim_id, ...extra });

async function setup(database) {
  await database.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      SET search_path = pg_catalog
      AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
    INSERT INTO auth.users VALUES ('${OWNER}'), ('${SECOND}'), ('${NONMEMBER}');
  `);
  for (const migration of migrations) await database.exec(migration);
  await database.query('INSERT INTO public.xiv_desk_members(user_id) VALUES ($1),($2)', [
    OWNER,
    SECOND,
  ]);
}
async function asRole(role, user, action) {
  assert.ok(role === 'anon' || role === 'authenticated');
  await db.exec(`SET ROLE ${role}`);
  try {
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [user ?? '']);
    return await action(db);
  } finally {
    await db.exec('RESET ROLE');
    await db.query("SELECT set_config('request.jwt.claim.sub','',false)");
  }
}
const asUser = (user, action) => asRole('authenticated', user, action);
async function register(database, bridge) {
  return (
    await database.query(
      'SELECT public.xiv_research_bridge_register($1::uuid,$2::text,$3::text,$4::timestamptz) AS value',
      [
        bridge.id,
        bridge.session,
        Object.hasOwn(bridge, 'hash') ? bridge.hash : digest(bridge.token),
        bridge.expires,
      ],
    )
  ).rows[0].value;
}
const issue = (bridge, owner = OWNER) => asUser(owner, (client) => register(client, bridge));
async function revoke(database, id = BRIDGE) {
  return (await database.query('SELECT public.xiv_research_bridge_revoke($1::uuid) AS value', [id]))
    .rows[0].value;
}
async function list(database) {
  return (await database.query('SELECT public.xiv_research_bridge_list() AS value')).rows[0].value;
}
async function apply(database, action, version, payload, id = TASK) {
  return (
    await database.query(
      'SELECT public.xiv_research_apply($1::uuid,$2::integer,$3::text,$4::jsonb) AS value',
      [id, version, action, JSON.stringify(payload)],
    )
  ).rows[0].value;
}
const ownerApply = (action, version, payload, id = TASK, owner = OWNER) =>
  asUser(owner, (client) => apply(client, action, version, payload, id));
const create = (id = TASK, question = QUESTION, owner = OWNER) =>
  ownerApply('create', 0, input(question), id, owner);
async function read(database, bridge, id = null) {
  return (
    await database.query(
      'SELECT public.xiv_research_bridge_read($1::uuid,$2::text,$3::uuid) AS value',
      [bridge.id, bridge.token, id],
    )
  ).rows[0].value;
}
const workerRead = (bridge, id = null, role = 'anon', user = null) =>
  asRole(role, user, (client) => read(client, bridge, id));
async function bridgeApply(database, bridge, action, version, payload, id = TASK) {
  return (
    await database.query(
      'SELECT public.xiv_research_bridge_apply($1::uuid,$2::text,$3::uuid,$4::integer,$5::text,$6::jsonb) AS value',
      [bridge.id, bridge.token, id, version, action, JSON.stringify(payload)],
    )
  ).rows[0].value;
}
const workerApply = (bridge, action, version, payload, id = TASK, role = 'anon', user = null) =>
  asRole(role, user, (client) => bridgeApply(client, bridge, action, version, payload, id));
async function running(bridge = capability(), id = TASK) {
  await issue(bridge);
  await create(id);
  return { bridge, task: await workerApply(bridge, 'claim', 1, {}, id) };
}
async function snapshot() {
  const rows = {};
  for (const table of tables)
    rows[table] = (
      await db.query(`SELECT to_jsonb(t) AS value FROM ${table} t ORDER BY to_jsonb(t)::text`)
    ).rows;
  return rows;
}
async function taskEvents(id = TASK) {
  return (
    await db.query(
      'SELECT action,version,snapshot FROM public.xiv_research_events WHERE owner_id=$1 AND task_id=$2 ORDER BY version',
      [OWNER, id],
    )
  ).rows;
}
async function lifecycle() {
  return (
    await db.query(
      'SELECT to_jsonb(e) AS value FROM xiv_private.research_bridge_events e ORDER BY to_jsonb(e)::text',
    )
  ).rows.map((row) => row.value);
}
async function storedBridge(bridge = capability(), owner = OWNER) {
  return (
    await db.query(
      'SELECT to_jsonb(b) AS value FROM xiv_private.research_bridges b WHERE owner_id=$1 AND id=$2',
      [owner, bridge.id],
    )
  ).rows[0]?.value;
}
function rejectsCode(action, code) {
  return assert.rejects(action, (error) => {
    assert.equal(error.code, code, error.message);
    return true;
  });
}
function publicMetadata(value, bridge) {
  assert.deepEqual(Object.keys(value).sort(), metadataKeys);
  assert.equal(value.id, bridge.id);
  assert.equal(value.session, bridge.session);
  assert.equal(Date.parse(value.expires_at), Date.parse(bridge.expires));
  assert.ok(Number.isFinite(Date.parse(value.created_at)));
  noCapabilities(value, bridge);
}
function noCapabilities(value, ...bridges) {
  const text = JSON.stringify(value);
  for (const bridge of bridges) {
    assert.ok(!text.includes(bridge.token));
    assert.ok(!text.includes(digest(bridge.token)));
  }
  assert.ok(!text.includes('token_sha256'));
}
async function expireLease(id = TASK) {
  await db.query(
    "UPDATE public.xiv_research_tasks SET lease_expires_at=clock_timestamp()-interval '1 second' WHERE owner_id=$1 AND id=$2",
    [OWNER, id],
  );
}

before(async () => {
  assert.ok(
    Date.now() < Date.parse(DEADLINE),
    'This temporary bridge trial has expired; retire or deliberately revise its deadline before rerunning issuance tests.',
  );
  db = new PGlite();
  await setup(db);
});
beforeEach(async () => {
  await db.exec('RESET ROLE');
  await db.exec(
    'TRUNCATE public.xiv_research_events, public.xiv_research_tasks, xiv_private.research_bridge_events, xiv_private.research_bridges',
  );
  await db.exec('UPDATE public.xiv_desk_members SET enabled=true');
});
after(async () => {
  if (db) await db.close();
});

test('private registry and core are inaccessible while public RPC privileges match their callers', async () => {
  const core =
    'xiv_private.research_apply(uuid,uuid,timestamp with time zone,uuid,integer,text,jsonb)';
  const publicFunctions = [
    ['public.xiv_research_bridge_register(uuid,text,text,timestamp with time zone)', false],
    ['public.xiv_research_bridge_revoke(uuid)', false],
    ['public.xiv_research_bridge_list()', false],
    ['public.xiv_research_apply(uuid,integer,text,jsonb)', false],
    ['public.xiv_research_bridge_read(uuid,text,uuid)', true],
    ['public.xiv_research_bridge_apply(uuid,text,uuid,integer,text,jsonb)', true],
  ];
  for (const role of ['anon', 'authenticated']) {
    for (const permission of ['USAGE', 'CREATE'])
      assert.equal(
        (
          await db.query('SELECT has_schema_privilege($1,$2,$3) AS allowed', [
            role,
            'xiv_private',
            permission,
          ])
        ).rows[0].allowed,
        false,
      );
    assert.equal(
      (
        await db.query('SELECT has_function_privilege($1,$2,$3) AS allowed', [
          role,
          core,
          'EXECUTE',
        ])
      ).rows[0].allowed,
      false,
    );
    for (const table of ['xiv_private.research_bridges', 'xiv_private.research_bridge_events'])
      for (const permission of [
        'SELECT',
        'INSERT',
        'UPDATE',
        'DELETE',
        'TRUNCATE',
        'REFERENCES',
        'TRIGGER',
      ])
        assert.equal(
          (
            await db.query('SELECT has_table_privilege($1,$2,$3) AS allowed', [
              role,
              table,
              permission,
            ])
          ).rows[0].allowed,
          false,
        );
    for (const [fn, anonymous] of publicFunctions)
      assert.equal(
        (
          await db.query('SELECT has_function_privilege($1,$2,$3) AS allowed', [
            role,
            fn,
            'EXECUTE',
          ])
        ).rows[0].allowed,
        role === 'authenticated' || anonymous,
        fn,
      );
    for (const table of ['xiv_private.research_bridges', 'xiv_private.research_bridge_events'])
      for (const sql of [
        `SELECT * FROM ${table}`,
        `INSERT INTO ${table} DEFAULT VALUES`,
        `UPDATE ${table} SET owner_id='${SECOND}'`,
        `DELETE FROM ${table}`,
        `TRUNCATE ${table}`,
      ])
        await rejectsCode(() => asRole(role, OWNER, (client) => client.exec(sql)), '42501');
    await rejectsCode(
      () =>
        asRole(role, OWNER, (client) =>
          client.query(
            "SELECT xiv_private.research_apply($1::uuid,NULL,NULL,$2::uuid,0,'create',$3::jsonb)",
            [OWNER, TASK, JSON.stringify(input())],
          ),
        ),
      '42501',
    );
  }
  for (const [fn] of publicFunctions)
    assert.deepEqual(
      (await db.query('SELECT prosecdef,proconfig FROM pg_proc WHERE oid=$1::regprocedure', [fn]))
        .rows[0],
      { prosecdef: true, proconfig: ['search_path=pg_catalog'] },
    );
});

test('only an enabled authenticated member can register, list or revoke their bridges', async () => {
  const bridge = capability();
  for (const [role, user] of [
    ['anon', OWNER],
    ['authenticated', null],
    ['authenticated', NONMEMBER],
  ]) {
    await rejectsCode(() => asRole(role, user, (client) => register(client, bridge)), '42501');
    await rejectsCode(() => asRole(role, user, (client) => list(client)), '42501');
    await rejectsCode(() => asRole(role, user, (client) => revoke(client)), '42501');
  }
  const issued = await issue(bridge);
  publicMetadata(issued, bridge);
  assert.equal(issued.revoked_at, null);
  assert.equal(issued.last_seen_at, null);
  assert.deepEqual(await asUser(SECOND, (client) => list(client)), []);
  await rejectsCode(() => asUser(SECOND, (client) => revoke(client)), '42501');
  await db.query('UPDATE public.xiv_desk_members SET enabled=false WHERE user_id=$1', [OWNER]);
  const original = await snapshot();
  await rejectsCode(() => issue(capability({ id: OTHER_BRIDGE, token: OTHER_TOKEN })), '42501');
  await rejectsCode(() => asUser(OWNER, (client) => list(client)), '42501');
  await rejectsCode(() => asUser(OWNER, (client) => revoke(client)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('registration preserves only a digest and exact retries add no lifecycle events', async () => {
  const bridge = capability();
  const first = await issue(bridge);
  assert.deepEqual(await issue(bridge), first);
  assert.equal((await lifecycle()).length, 1);
  const stored = await storedBridge(bridge);
  assert.equal(stored.owner_id, OWNER);
  assert.equal(stored.token_sha256, digest(bridge.token));
  assert.ok(!JSON.stringify(stored).includes(bridge.token));
  for (const changed of [
    { ...bridge, session: 'claude:synthetic_bridge_02' },
    { ...bridge, token: OTHER_TOKEN },
    { ...bridge, expires: new Date(Date.parse(bridge.expires) + 1000).toISOString() },
  ]) {
    const original = await snapshot();
    await rejectsCode(() => issue(changed), '40001');
    assert.deepEqual(await snapshot(), original);
  }
  const listed = await asUser(OWNER, (client) => list(client));
  assert.deepEqual(listed, [first]);
  noCapabilities(listed, bridge);
  const original = await snapshot();
  for (const owner of [OWNER, SECOND])
    await rejectsCode(() => issue({ ...bridge, id: OTHER_BRIDGE }, owner), '40001');
  assert.deepEqual(await snapshot(), original);
  const second = { ...bridge, token: OTHER_TOKEN, session: 'claude:synthetic_second_owner' };
  publicMetadata(await issue(second, SECOND), second);
  await create();
  await create(TASK, 'Synthetic second-owner private question.', SECOND);
  assert.equal((await workerRead(bridge, TASK)).task.owner_id, OWNER);
  assert.equal((await workerRead(second, TASK)).task.owner_id, SECOND);
  const ownerList = await asUser(OWNER, (client) => list(client));
  const secondList = await asUser(SECOND, (client) => list(client));
  assert.equal(ownerList.length, 1);
  assert.equal(secondList.length, 1);
  publicMetadata(ownerList[0], bridge);
  publicMetadata(secondList[0], second);
});

test('issuance validates session, digest, finite expiration and the fixed trial deadline', async () => {
  const bridge = capability();
  const invalid = [
    { ...bridge, id: null },
    ...[null, '', 'codex:short', 'other:synthetic_bridge', SESSION + '\n'].map((session) => ({
      ...bridge,
      session,
    })),
    ...[null, '', 'A'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), digest(TOKEN) + '\n'].map(
      (hash) => ({
        ...bridge,
        hash,
      }),
    ),
    ...[
      null,
      'infinity',
      '-infinity',
      new Date(Date.now() - 1000).toISOString(),
      new Date(Date.now() + 15 * 86400000).toISOString(),
      '2026-09-19T23:52:32.001Z',
    ].map((expires) => ({ ...bridge, expires })),
  ];
  const original = await snapshot();
  for (const value of invalid) await rejectsCode(() => issue(value), '22023');
  assert.deepEqual(await snapshot(), original);
  const accepted = { ...bridge, expires: DEADLINE };
  publicMetadata(await issue(accepted), accepted);
});

test('bad capabilities fail without task access and a forged JWT cannot choose the capability owner', async () => {
  const bridge = capability();
  await issue(bridge);
  await create();
  await create(TASK, 'Synthetic second-owner private question.', SECOND);
  const original = await snapshot();
  for (const token of [
    null,
    '',
    TOKEN.slice(1),
    TOKEN + 'a',
    TOKEN.toUpperCase(),
    TOKEN + '\n',
    digest(TOKEN),
    OTHER_TOKEN,
  ]) {
    const invalid = { ...bridge, token };
    await rejectsCode(() => workerRead(invalid), '42501');
    await rejectsCode(() => workerApply(invalid, 'claim', 1, {}), '42501');
  }
  await rejectsCode(() => workerRead({ ...bridge, id: OTHER_BRIDGE }), '42501');
  assert.deepEqual(await snapshot(), original);
  for (const role of ['anon', 'authenticated']) {
    const read = await workerRead(bridge, TASK, role, SECOND);
    assert.equal(read.task.owner_id, OWNER);
    assert.equal(read.task.question, QUESTION);
    noCapabilities(read, bridge);
  }
  const claimed = await workerApply(bridge, 'claim', 1, {}, TASK, 'authenticated', SECOND);
  assert.equal(claimed.owner_id, OWNER);
  assert.equal(claimed.bridge_id, bridge.id);
  assert.equal(claimed.worker_session, bridge.session);
  assert.equal(
    (await asUser(SECOND, (client) => client.query('SELECT status FROM public.xiv_research_tasks')))
      .rows[0].status,
    'queued',
  );
});

test('revocation, expiration and disabled membership immediately deny worker reads and writes', async () => {
  // Keep a valid queued target throughout, so claim denial cannot be explained by
  // a missing task. Each bridge also proves it can claim its own live task first.
  await create(TASK);
  for (const [index, failure] of ['revoked', 'expired', 'disabled'].entries()) {
    const bridge = capability({
      id: `20000000-0000-0000-0000-00000000000${index + 1}`,
      token: ['a', 'b', 'c'][index].repeat(64),
    });
    await issue(bridge);
    const runningId = `10000000-0000-0000-0000-00000000000${index + 2}`;
    await create(runningId);
    const live = await workerApply(bridge, 'claim', 1, {}, runningId);
    assert.equal(live.status, 'running');
    assert.equal(live.version, 2);
    assert.ok(Date.parse(live.lease_expires_at) > Date.now());
    if (failure === 'revoked') await asUser(OWNER, (client) => revoke(client, bridge.id));
    if (failure === 'expired')
      await db.query(
        "UPDATE xiv_private.research_bridges SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",
        [bridge.id],
      );
    if (failure === 'disabled')
      await db.query('UPDATE public.xiv_desk_members SET enabled=false WHERE user_id=$1', [OWNER]);
    const original = await snapshot();
    if (failure === 'expired') {
      const expires = (await storedBridge(bridge)).expires_at;
      publicMetadata(await issue({ ...bridge, expires }), { ...bridge, expires });
      assert.deepEqual(await snapshot(), original);
    }
    await rejectsCode(() => workerRead(bridge), '42501');
    await rejectsCode(() => workerRead(bridge, TASK), '42501');
    await rejectsCode(() => workerRead(bridge, runningId), '42501');
    await rejectsCode(() => workerApply(bridge, 'claim', 1, {}), '42501');
    for (const [action, payload] of [
      ['renew', claimPayload(live)],
      ['complete', claimPayload(live, { result: result() })],
      ['block', claimPayload(live, { reason: 'Synthetic blocked task.' })],
    ])
      await rejectsCode(
        () => workerApply(bridge, action, live.version, payload, runningId),
        '42501',
      );
    // Includes both tasks, all task/lifecycle audit rows, and last_seen_at.
    assert.deepEqual(await snapshot(), original);
    await db.exec('UPDATE public.xiv_desk_members SET enabled=true');
  }
});

test('owner RPCs cannot perform worker actions and worker RPCs cannot create, cancel or retry', async () => {
  const { bridge, task } = await running();
  const original = await snapshot();
  for (const [action, payload] of [
    ['claim', { worker_session: SESSION }],
    ['renew', claimPayload(task)],
    ['complete', claimPayload(task, { result: result() })],
    ['block', claimPayload(task, { reason: 'Synthetic block.' })],
  ])
    await rejectsCode(() => ownerApply(action, 2, payload), '42501');
  for (const [action, payload] of [
    ['create', input()],
    ['cancel', { reason: 'Synthetic stop.' }],
    ['retry', {}],
    ['delete', {}],
  ])
    await rejectsCode(() => workerApply(bridge, action, 2, payload), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('claim accepts only an empty payload and obtains session and bridge identity from registration', async () => {
  const bridge = capability();
  await issue(bridge);
  await create();
  const original = await snapshot();
  for (const payload of [
    null,
    [],
    { worker_session: SESSION },
    { owner_id: SECOND },
    { bridge_id: OTHER_BRIDGE },
    { claim_id: WRONG_CLAIM },
    { lease_expires_at: DEADLINE },
  ])
    await rejectsCode(() => workerApply(bridge, 'claim', 1, payload), '22023');
  assert.deepEqual(await snapshot(), original);
  const claimed = await workerApply(bridge, 'claim', 1, {});
  assert.equal(claimed.version, 2);
  assert.equal(claimed.status, 'running');
  assert.equal(claimed.owner_id, OWNER);
  assert.equal(claimed.bridge_id, bridge.id);
  assert.equal(claimed.worker_session, bridge.session);
  assert.match(
    claimed.claim_id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  noCapabilities(claimed, bridge);
});

test('worker reads expose queued and own running tasks, with detail restricted to owner and bridge', async () => {
  const first = capability();
  const second = capability({
    id: OTHER_BRIDGE,
    token: OTHER_TOKEN,
    session: 'claude:synthetic_bridge_02',
  });
  await issue(first);
  await issue(second);
  await create();
  await create(OTHER_TASK);
  await create(FOREIGN_TASK, 'Foreign synthetic question.', SECOND);
  const claimed = await workerApply(second, 'claim', 1, {});
  assert.deepEqual(
    (await workerRead(first)).tasks.map((task) => task.id),
    [OTHER_TASK],
  );
  assert.deepEqual(
    (await workerRead(second)).tasks.map((task) => task.id),
    [TASK, OTHER_TASK],
  );
  assert.equal((await workerRead(first, OTHER_TASK)).task.status, 'queued');
  for (const id of [TASK, FOREIGN_TASK, WRONG_CLAIM])
    await rejectsCode(() => workerRead(first, id), '42501');
  await workerApply(second, 'complete', 2, claimPayload(claimed, { result: result() }));
  assert.equal((await workerRead(second, TASK)).task.status, 'completed');
  assert.deepEqual(
    (await workerRead(second)).tasks.map((task) => task.id),
    [OTHER_TASK],
  );
});

test('worker queue reads are bounded to 20 rows in created-at and UUID ascending order', async () => {
  const bridge = capability();
  await issue(bridge);
  const ids = Array.from(
    { length: 23 },
    (_, index) => `${(index + 1).toString(16).padStart(8, '0')}-0000-0000-0000-000000000001`,
  );
  for (const id of [...ids].reverse()) await create(id);
  await db.query(
    "UPDATE public.xiv_research_tasks SET created_at='2026-09-08T01:00:00Z' WHERE owner_id=$1",
    [OWNER],
  );
  const response = await workerRead(bridge);
  assert.deepEqual(Object.keys(response), ['tasks']);
  assert.equal(response.tasks.length, 20);
  assert.deepEqual(
    response.tasks.map((task) => task.id),
    ids.slice(0, 20),
  );
  assert.ok(response.tasks.every((task) => task.owner_id === OWNER));
  noCapabilities(response, bridge);
});

test('a different bridge with the same session cannot reuse even a stolen current claim', async () => {
  const { bridge: first, task: old } = await running();
  const second = capability({ id: OTHER_BRIDGE, token: OTHER_TOKEN, session: first.session });
  await issue(second);
  const original = await snapshot();
  for (const [action, extra] of [
    ['renew', {}],
    ['complete', { result: result() }],
    ['block', { reason: 'Synthetic hijack.' }],
  ])
    await rejectsCode(() => workerApply(second, action, 2, claimPayload(old, extra)), '40001');
  assert.deepEqual(await snapshot(), original);
  await expireLease();
  const retried = await ownerApply('retry', 2, {});
  for (const field of ['bridge_id', 'claim_id', 'worker_session', 'claimed_at', 'lease_expires_at'])
    assert.equal(retried[field], null, field);
  const fresh = await workerApply(second, 'claim', 3, {});
  assert.notEqual(fresh.claim_id, old.claim_id);
  assert.equal(fresh.bridge_id, second.id);
  await rejectsCode(() => workerApply(first, 'renew', 4, claimPayload(fresh)), '40001');
  await rejectsCode(() => workerApply(second, 'renew', 4, claimPayload(old)), '40001');
  assert.equal((await workerApply(second, 'renew', 4, claimPayload(fresh))).version, 5);
});

test('claim and renewal clamp leases to capability expiration while preserving provenance', async () => {
  for (const minutes of [5, 60]) {
    const id = minutes === 5 ? TASK : OTHER_TASK;
    const bridge = capability({
      id: minutes === 5 ? BRIDGE : OTHER_BRIDGE,
      token: minutes === 5 ? TOKEN : OTHER_TOKEN,
      expires: new Date(Date.now() + minutes * 60000).toISOString(),
    });
    const { task: claimed } = await running(bridge, id);
    const expected = Math.min(
      Date.parse(claimed.updated_at) + 15 * 60000,
      Date.parse(bridge.expires),
    );
    assert.equal(Date.parse(claimed.lease_expires_at), expected);
    const renewed = await workerApply(bridge, 'renew', 2, claimPayload(claimed), id);
    assert.equal(
      Date.parse(renewed.lease_expires_at),
      Math.min(Date.parse(renewed.updated_at) + 15 * 60000, Date.parse(bridge.expires)),
    );
    for (const field of ['bridge_id', 'claim_id', 'claimed_at', 'worker_session'])
      assert.equal(renewed[field], claimed[field], field);
    assert.equal(renewed.version, 3);
  }
});

test('stale versions, wrong claims and expired leases cannot mutate tasks or heartbeat metadata', async () => {
  const { bridge, task } = await running();
  const original = await snapshot();
  await rejectsCode(() => workerApply(bridge, 'renew', 1, claimPayload(task)), '40001');
  for (const [action, extra] of [
    ['renew', {}],
    ['complete', { result: result() }],
    ['block', { reason: 'Synthetic block.' }],
  ])
    await rejectsCode(
      () => workerApply(bridge, action, 2, { claim_id: WRONG_CLAIM, ...extra }),
      '40001',
    );
  assert.deepEqual(await snapshot(), original);
  await expireLease();
  const expired = await snapshot();
  for (const [action, extra] of [
    ['renew', {}],
    ['complete', { result: result() }],
    ['block', { reason: 'Synthetic block.' }],
  ])
    await rejectsCode(() => workerApply(bridge, action, 2, claimPayload(task, extra)), '40001');
  assert.deepEqual(await snapshot(), expired);
});

test('sourced completion preserves exact evidence and immutable bridge provenance in task history', async () => {
  const { bridge, task } = await running();
  const evidence = result();
  const completed = await workerApply(
    bridge,
    'complete',
    2,
    claimPayload(task, { result: evidence }),
  );
  assert.equal(completed.status, 'completed');
  assert.equal(completed.version, 3);
  assert.equal(completed.bridge_id, bridge.id);
  assert.equal(completed.claim_id, task.claim_id);
  assert.equal(completed.lease_expires_at, null);
  assert.equal(completed.completed_at, completed.updated_at);
  assert.deepEqual(completed.result, evidence);
  const history = await taskEvents();
  assert.deepEqual(
    history.map((event) => event.action),
    ['create', 'claim', 'complete'],
  );
  assert.equal(history[0].snapshot.bridge_id, null);
  assert.deepEqual(history[2].snapshot, completed);
  noCapabilities([completed, history], bridge);
  const original = await snapshot();
  await rejectsCode(() => workerApply(bridge, 'renew', 3, claimPayload(task)), '40001');
  await rejectsCode(() => ownerApply('cancel', 3, { reason: 'Synthetic stop.' }), '40001');
  await rejectsCode(() => ownerApply('retry', 3, {}), '40001');
  assert.deepEqual(await snapshot(), original);
});

test('invalid sourced results roll back task, event and last-seen writes together', async () => {
  const { bridge, task } = await running();
  const invalid = [
    null,
    { ...result(), text: ' ' },
    { ...result(), text: 'x'.repeat(20001) },
    { ...result(), sources: [] },
    { ...result(), sources: [{ ...source(), url: 'http://primary.example/unsafe' }] },
    {
      ...result(),
      sources: [{ ...source(), url: 'https://user:password@primary.example/unsafe' }],
    },
    { ...result(), sources: [{ ...source(), url: 'https://primary.example/%zz' }] },
    { ...result(), sources: [{ ...source(), retrieved_at: '2026-02-30T12:00:00Z' }] },
    { ...result(), sources: [{ ...source(), retrieved_at: '2026-09-08T12:00:00+00:00' }] },
    { ...result(), internal_note: 'Unrequested field' },
  ];
  const original = await snapshot();
  for (const value of invalid)
    await rejectsCode(
      () => workerApply(bridge, 'complete', 2, claimPayload(task, { result: value })),
      '22023',
    );
  await rejectsCode(
    () => workerApply(bridge, 'renew', 2, claimPayload(task, { owner_id: SECOND })),
    '22023',
  );
  await rejectsCode(
    () => workerApply(bridge, 'block', 2, claimPayload(task, { reason: ' ' })),
    '22023',
  );
  assert.deepEqual(await snapshot(), original);
});

test('owner cancellation and retry retain or clear bridge provenance according to task state', async () => {
  const { bridge, task } = await running();
  const blocked = await workerApply(
    bridge,
    'block',
    2,
    claimPayload(task, { reason: '  Synthetic missing source.  ' }),
  );
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.bridge_id, bridge.id);
  assert.equal(blocked.blocked_reason, '  Synthetic missing source.  ');
  assert.equal(blocked.lease_expires_at, null);
  const queued = await ownerApply('retry', 3, {});
  assert.equal(queued.status, 'queued');
  assert.equal(queued.bridge_id, null);
  assert.equal(queued.blocked_reason, null);
  const claimed = await workerApply(bridge, 'claim', 4, {});
  const cancelled = await ownerApply('cancel', 5, { reason: '  Synthetic owner cancellation.  ' });
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.bridge_id, bridge.id);
  assert.equal(cancelled.claim_id, claimed.claim_id);
  assert.equal(cancelled.cancel_reason, '  Synthetic owner cancellation.  ');
  assert.equal(cancelled.lease_expires_at, null);
  await rejectsCode(
    () => workerApply(bridge, 'complete', 6, claimPayload(claimed, { result: result() })),
    '40001',
  );
  assert.equal((await workerRead(bridge, TASK)).task.status, 'cancelled');
});

test('register and revoke lifecycle audit is append-only, idempotent and contains no capabilities', async () => {
  const bridge = capability();
  const first = await issue(bridge);
  await issue(bridge);
  const revoked = await asUser(OWNER, (client) => revoke(client));
  publicMetadata(revoked, bridge);
  assert.ok(Number.isFinite(Date.parse(revoked.revoked_at)));
  assert.equal(revoked.created_at, first.created_at);
  assert.deepEqual(await asUser(OWNER, (client) => revoke(client)), revoked);
  assert.deepEqual(await issue(bridge), revoked);
  await rejectsCode(() => workerRead(bridge), '42501');
  const audit = await lifecycle();
  assert.equal(audit.length, 2);
  assert.deepEqual(audit.map((event) => event.action).sort(), ['register', 'revoke']);
  assert.ok(audit.every((event) => event.owner_id === OWNER));
  noCapabilities([audit, revoked, await asUser(OWNER, (client) => list(client))], bridge);
  const original = await snapshot();
  for (const action of [
    'UPDATE xiv_private.research_bridge_events SET owner_id=NULL',
    'DELETE FROM xiv_private.research_bridge_events',
  ])
    await rejectsCode(() => asUser(OWNER, (client) => client.exec(action)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('last-seen changes only after successful capability reads or task writes', async () => {
  const bridge = capability();
  await issue(bridge);
  assert.equal((await storedBridge(bridge)).last_seen_at, null);
  await rejectsCode(() => workerRead(bridge, TASK), '42501');
  await rejectsCode(() => workerApply(bridge, 'claim', 1, {}), '42501');
  assert.equal((await storedBridge(bridge)).last_seen_at, null);
  assert.deepEqual(await workerRead(bridge), { tasks: [] });
  const afterRead = (await storedBridge(bridge)).last_seen_at;
  assert.ok(Number.isFinite(Date.parse(afterRead)));
  await create();
  const claimed = await workerApply(bridge, 'claim', 1, {});
  const afterClaim = (await storedBridge(bridge)).last_seen_at;
  assert.ok(Date.parse(afterClaim) >= Date.parse(afterRead));
  const original = await snapshot();
  await rejectsCode(() => workerApply(bridge, 'renew', 1, claimPayload(claimed)), '40001');
  await rejectsCode(() => workerRead({ ...bridge, token: OTHER_TOKEN }), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('explicit transaction rollback undoes capability lifecycle and successful worker heartbeat writes', async () => {
  const bridge = capability();
  const empty = await snapshot();
  await asUser(OWNER, async (client) => {
    await client.exec('BEGIN');
    try {
      await register(client, bridge);
      await revoke(client);
    } finally {
      await client.exec('ROLLBACK');
    }
  });
  assert.deepEqual(await snapshot(), empty);
  await issue(bridge);
  await create();
  const original = await snapshot();
  await asRole('anon', null, async (client) => {
    await client.exec('BEGIN');
    try {
      await read(client, bridge);
      await bridgeApply(client, bridge, 'claim', 1, {});
    } finally {
      await client.exec('ROLLBACK');
    }
  });
  assert.deepEqual(await snapshot(), original);
});

test('a failing last-seen update rolls back the preceding task write and its audit event', async () => {
  const bridge = capability();
  await issue(bridge);
  await create();
  const original = await snapshot();
  await db.exec(`
    CREATE FUNCTION public.synthetic_reject_bridge_seen() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic bridge observation storage failure'; END;
    $$;
    CREATE TRIGGER synthetic_bridge_seen_failure BEFORE UPDATE OF last_seen_at
      ON xiv_private.research_bridges FOR EACH ROW
      EXECUTE FUNCTION public.synthetic_reject_bridge_seen();
  `);
  try {
    await rejectsCode(() => workerApply(bridge, 'claim', 1, {}), 'P0001');
    assert.deepEqual(await snapshot(), original);
    await rejectsCode(() => workerRead(bridge), 'P0001');
    assert.deepEqual(await snapshot(), original);
  } finally {
    await db.exec('DROP TRIGGER synthetic_bridge_seen_failure ON xiv_private.research_bridges');
    await db.exec('DROP FUNCTION public.synthetic_reject_bridge_seen()');
  }
  const claimed = await workerApply(bridge, 'claim', 1, {});
  assert.equal(claimed.version, 2);
  assert.deepEqual(
    (await taskEvents()).map((event) => event.action),
    ['create', 'claim'],
  );
  assert.ok(Number.isFinite(Date.parse((await storedBridge(bridge)).last_seen_at)));
});
