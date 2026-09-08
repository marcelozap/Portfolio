import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { PGlite } from '@electric-sql/pglite';

// Offline PostgreSQL execution only. All identities, questions, sessions, and sources
// are synthetic. No environment files, secrets, live database, or model calls.
const OWNER = '00000000-0000-0000-0000-000000000001';
const SECOND = '00000000-0000-0000-0000-000000000002';
const NONMEMBER = '00000000-0000-0000-0000-000000000003';
const TASK = '10000000-0000-0000-0000-000000000001';
const OTHER_TASK = '10000000-0000-0000-0000-000000000002';
const WRONG_CLAIM = '90000000-0000-0000-0000-000000000001';
const QUESTION = '  Synthetic question?\nPreserve Café and every space.  ';
const WORKER = 'codex:synthetic_0001';
const SECOND_WORKER = 'claude:synthetic_0002';
const tables = ['xiv_research_tasks', 'xiv_research_events'];
const migrations = await Promise.all(
  ['202609080001_xiv_private_desk.sql', '202609080002_xiv_research_tasks.sql'].map((name) =>
    readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'),
  ),
);
let db;

const input = (question = QUESTION) => ({ question, scope: 'public_primary_sources' });
const source = () => ({
  url: 'https://example.org/synthetic-primary?version=1#source',
  title: 'Synthetic primary source',
  retrieved_at: '2026-09-08T12:30:45.123456Z',
});
const result = () => ({
  text: '  A synthetic sourced finding.\n',
  sources: [source()],
  limitations: '',
});

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
  await database.query('INSERT INTO public.xiv_desk_members(user_id) VALUES ($1), ($2)', [
    OWNER,
    SECOND,
  ]);
}

async function asRole(role, user, action, database = db) {
  assert.ok(role === 'anon' || role === 'authenticated');
  await database.exec(`SET ROLE ${role}`);
  try {
    await database.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [user ?? '']);
    return await action(database);
  } finally {
    await database.exec('RESET ROLE');
    await database.query("SELECT set_config('request.jwt.claim.sub', '', false)");
  }
}
const asUser = (user, action, database = db) => asRole('authenticated', user, action, database);

async function apply(database, action, version, payload, id = TASK) {
  const response = await database.query(
    'SELECT public.xiv_research_apply($1::uuid,$2::integer,$3::text,$4::jsonb) AS task',
    [id, version, action, JSON.stringify(payload)],
  );
  return response.rows[0].task;
}
const ownerApply = (action, version, payload, id = TASK) =>
  asUser(OWNER, (client) => apply(client, action, version, payload, id));
const create = (id = TASK, question = QUESTION) => ownerApply('create', 0, input(question), id);
async function running(id = TASK) {
  await create(id);
  return ownerApply('claim', 1, { worker_session: WORKER }, id);
}
const claimPayload = (task, extra = {}) => ({ claim_id: task.claim_id, ...extra });

async function snapshot(database = db) {
  const rows = {};
  for (const table of tables)
    rows[table] = (
      await database.query(
        `SELECT to_jsonb(t) AS value FROM public.${table} t ORDER BY to_jsonb(t)::text`,
      )
    ).rows;
  return rows;
}
async function events(id = TASK, database = db) {
  return (
    await database.query(
      'SELECT action,version,snapshot,occurred_at::text FROM public.xiv_research_events WHERE owner_id=$1 AND task_id=$2 ORDER BY version',
      [OWNER, id],
    )
  ).rows;
}
function rejectsCode(action, code) {
  return assert.rejects(action, (error) => {
    assert.equal(error.code, code, error.message);
    return true;
  });
}
async function expire(id = TASK) {
  // Administrative fixture only: simulate elapsed time without sleeping or workers.
  await db.query(
    "UPDATE public.xiv_research_tasks SET lease_expires_at=clock_timestamp()-interval '1 second' WHERE owner_id=$1 AND id=$2",
    [OWNER, id],
  );
}

before(async () => {
  db = new PGlite();
  await setup(db);
});
beforeEach(async () => {
  await db.exec('RESET ROLE');
  await db.exec('TRUNCATE public.xiv_research_events, public.xiv_research_tasks');
  await db.exec('UPDATE public.xiv_desk_members SET enabled=true');
});
after(async () => {
  if (db) await db.close();
});

test('migration creates two RLS tables, one restricted definer RPC, and SELECT-only client access', async () => {
  const rows = (
    await db.query(
      "SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relname IN ('xiv_research_tasks','xiv_research_events') ORDER BY relname",
    )
  ).rows;
  assert.equal(rows.length, 2);
  assert.ok(rows.every((row) => row.relrowsecurity));
  assert.deepEqual(
    (
      await db.query(
        "SELECT prosecdef,proconfig FROM pg_proc WHERE oid='public.xiv_research_apply(uuid,integer,text,jsonb)'::regprocedure",
      )
    ).rows[0],
    { prosecdef: true, proconfig: ['search_path=pg_catalog'] },
  );
  for (const role of ['anon', 'authenticated']) {
    assert.equal(
      (
        await db.query(
          "SELECT has_function_privilege($1,'public.xiv_research_apply(uuid,integer,text,jsonb)','EXECUTE') AS allowed",
          [role],
        )
      ).rows[0].allowed,
      role === 'authenticated',
    );
    for (const table of tables)
      for (const permission of [
        'SELECT',
        'INSERT',
        'UPDATE',
        'DELETE',
        'TRUNCATE',
        'TRIGGER',
        'REFERENCES',
      ])
        assert.equal(
          (
            await db.query('SELECT has_table_privilege($1,$2,$3) AS allowed', [
              role,
              `public.${table}`,
              permission,
            ])
          ).rows[0].allowed,
          role === 'authenticated' && permission === 'SELECT',
        );
  }
});

test('owner isolation, foreign/missing task denial, and owner or membership forgery are enforced', async () => {
  await create();
  for (const id of [TASK, OTHER_TASK])
    await rejectsCode(
      () => asUser(SECOND, (client) => apply(client, 'claim', 1, { worker_session: WORKER }, id)),
      '42501',
    );
  await asUser(SECOND, async (client) => {
    for (const table of tables)
      assert.deepEqual((await client.query(`SELECT * FROM public.${table}`)).rows, []);
    await apply(client, 'create', 0, input('Private to the second synthetic owner.'));
  });
  for (const owner of [OWNER, SECOND])
    await asUser(owner, async (client) => {
      for (const table of tables) {
        const rows = (await client.query(`SELECT owner_id FROM public.${table}`)).rows;
        assert.deepEqual(rows, [{ owner_id: owner }]);
      }
    });
  const original = await snapshot();
  await rejectsCode(
    () => ownerApply('create', 0, { ...input(), owner_id: SECOND }, OTHER_TASK),
    '22023',
  );
  for (const sql of [
    `INSERT INTO public.xiv_desk_members(user_id) VALUES ('${NONMEMBER}')`,
    'UPDATE public.xiv_desk_members SET enabled=true',
    'DELETE FROM public.xiv_desk_members',
  ])
    await rejectsCode(() => asUser(NONMEMBER, (client) => client.exec(sql)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('anonymous, missing, nonmember, and disabled identities cannot use the queue', async () => {
  await running();
  for (const table of tables)
    await rejectsCode(
      () => asRole('anon', OWNER, (client) => client.query(`SELECT * FROM public.${table}`)),
      '42501',
    );
  await rejectsCode(
    () => asRole('anon', OWNER, (client) => apply(client, 'create', 0, input())),
    '42501',
  );
  await db.query('UPDATE public.xiv_desk_members SET enabled=false WHERE user_id=$1', [OWNER]);
  const original = await snapshot();
  for (const user of [null, NONMEMBER, OWNER]) {
    await asUser(user, async (client) => {
      for (const table of tables)
        assert.deepEqual((await client.query(`SELECT * FROM public.${table}`)).rows, []);
    });
    await rejectsCode(
      () => asUser(user, (client) => apply(client, 'create', 0, input(), OTHER_TASK)),
      '42501',
    );
    await rejectsCode(
      () => asUser(user, (client) => apply(client, 'cancel', 2, { reason: 'Synthetic stop.' })),
      '42501',
    );
  }
  assert.deepEqual(await snapshot(), original);
});

test('members cannot directly insert, rewrite, delete, or truncate tasks and audit rows', async () => {
  await create();
  const original = await snapshot();
  for (const table of tables)
    for (const sql of [
      `INSERT INTO public.${table} DEFAULT VALUES`,
      `UPDATE public.${table} SET owner_id='${SECOND}'`,
      `DELETE FROM public.${table}`,
      `TRUNCATE public.${table} CASCADE`,
    ])
      await rejectsCode(() => asUser(OWNER, (client) => client.exec(sql)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('create preserves exact input and idempotent retries return the current row without extra audit', async () => {
  const first = await create();
  assert.equal(first.owner_id, OWNER);
  assert.equal(first.id, TASK);
  assert.equal(first.question, QUESTION);
  assert.equal(first.scope, 'public_primary_sources');
  assert.equal(first.role, 'research_analyst');
  assert.equal(first.status, 'queued');
  assert.equal(first.version, 1);
  assert.equal(first.created_at, first.updated_at);
  assert.equal(first.claim_id, null);
  assert.equal(first.result, null);
  assert.deepEqual(await create(), first);
  const claimed = await ownerApply('claim', 1, { worker_session: WORKER });
  assert.deepEqual(await create(), claimed);
  const original = await snapshot();
  await rejectsCode(() => create(TASK, QUESTION.trim()), '40001');
  assert.deepEqual(await snapshot(), original);
  assert.deepEqual(
    (await events()).map((event) => event.action),
    ['create', 'claim'],
  );
  assert.deepEqual((await events())[0].snapshot, first);
  assert.deepEqual((await events())[1].snapshot, claimed);
});

test('canonical task lock is held across create and claim; stale and competing claims fail', async () => {
  await asUser(OWNER, async (client) => {
    await client.exec('BEGIN');
    try {
      await apply(client, 'create', 0, input());
      const locks = async () =>
        (
          await client.query(
            "SELECT classid,objid,objsubid FROM pg_locks WHERE locktype='advisory' AND pid=pg_backend_pid() AND granted ORDER BY classid,objid,objsubid",
          )
        ).rows;
      const first = await locks();
      assert.equal(first.length, 1);
      await apply(client, 'claim', 1, { worker_session: WORKER });
      assert.deepEqual(await locks(), first);
      await client.exec('COMMIT');
      assert.deepEqual(await locks(), []);
    } catch (error) {
      await client.exec('ROLLBACK');
      throw error;
    }
  });
  const original = await snapshot();
  for (const version of [0, 1, 2, 3])
    await rejectsCode(
      () => ownerApply('claim', version, { worker_session: SECOND_WORKER }),
      '40001',
    );
  await rejectsCode(() => ownerApply('retry', 2, {}), '40001');
  assert.deepEqual(await snapshot(), original);
});

test('invalid arguments and create payloads fail closed with no partial task or event', async () => {
  const invalid = [null, [], {}, { ...input(), extra: true }];
  for (const question of [null, [], 7, '', ' \n\t\r', 'x'.repeat(12001)])
    invalid.push(input(question));
  for (const scope of [null, [], 7, 'private_sources', '']) invalid.push({ ...input(), scope });
  for (const key of [
    'owner_id',
    'status',
    'role',
    'version',
    'created_at',
    'updated_at',
    'claim_id',
  ])
    invalid.push({ ...input(), [key]: 'injected' });
  const original = await snapshot();
  for (const payload of invalid) await rejectsCode(() => ownerApply('create', 0, payload), '22023');
  for (const version of [null, -1, 1, 1000000001, 2147483647])
    await rejectsCode(() => ownerApply('create', version, input()), '22023');
  for (const action of [null, '', 'delete', 'CREATE'])
    await rejectsCode(() => ownerApply(action, 0, input()), '22023');
  await rejectsCode(() => ownerApply('create', 0, input(), null), '22023');
  assert.deepEqual(await snapshot(), original);
  assert.equal((await create(TASK, 'x'.repeat(12000))).question.length, 12000);
});

test('claim validates exact session fields and the server sets UUID, clock, and fixed lease', async () => {
  await create();
  const original = await snapshot();
  for (const payload of [
    null,
    [],
    {},
    { worker_session: null },
    { worker_session: 12 },
    ...[
      'codex:short',
      'codex:' + 'x'.repeat(129),
      'claude:bad space',
      'other:synthetic_1',
      'CODEX:synthetic_1',
    ].map((worker_session) => ({ worker_session })),
    { worker_session: WORKER, claim_id: WRONG_CLAIM },
    { worker_session: WORKER, claimed_at: '2020-01-01T00:00:00Z' },
    { worker_session: WORKER, lease_expires_at: '2099-01-01T00:00:00Z' },
  ])
    await rejectsCode(() => ownerApply('claim', 1, payload), '22023');
  assert.deepEqual(await snapshot(), original);
  const claimed = await ownerApply('claim', 1, { worker_session: 'claude:' + 'x'.repeat(128) });
  assert.match(
    claimed.claim_id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.equal(claimed.claimed_at, claimed.updated_at);
  assert.equal(Date.parse(claimed.lease_expires_at) - Date.parse(claimed.claimed_at), 15 * 60000);
  assert.equal(claimed.version, 2);
  assert.equal(claimed.status, 'running');
});

test('renewal fences stale/wrong claims, extends only from the server clock, and preserves provenance', async () => {
  const claimed = await running();
  const original = await snapshot();
  for (const action of ['renew', 'complete', 'block']) {
    const extra =
      action === 'complete'
        ? { result: result() }
        : action === 'block'
          ? { reason: 'Synthetic stop.' }
          : {};
    await rejectsCode(() => ownerApply(action, 2, { claim_id: WRONG_CLAIM, ...extra }), '40001');
    for (const claim_id of [null, 12, '', 'bad', []])
      await rejectsCode(() => ownerApply(action, 2, { claim_id, ...extra }), '22023');
  }
  await rejectsCode(
    () =>
      ownerApply('renew', 2, claimPayload(claimed, { lease_expires_at: '2099-01-01T00:00:00Z' })),
    '22023',
  );
  assert.deepEqual(await snapshot(), original);
  const renewed = await ownerApply('renew', 2, claimPayload(claimed));
  assert.equal(renewed.version, 3);
  assert.equal(renewed.claim_id, claimed.claim_id);
  assert.equal(renewed.claimed_at, claimed.claimed_at);
  assert.equal(renewed.worker_session, claimed.worker_session);
  assert.equal(Date.parse(renewed.lease_expires_at) - Date.parse(renewed.updated_at), 15 * 60000);
  assert.ok(Date.parse(renewed.lease_expires_at) >= Date.parse(claimed.lease_expires_at));
  const afterRenew = await snapshot();
  await rejectsCode(
    () => ownerApply('complete', 2, claimPayload(claimed, { result: result() })),
    '40001',
  );
  await rejectsCode(() => ownerApply('renew', 2, claimPayload(claimed)), '40001');
  assert.deepEqual(await snapshot(), afterRenew);
  assert.deepEqual(
    (await events()).map((event) => event.action),
    ['create', 'claim', 'renew'],
  );
});

test('expired claims cannot renew, complete, or block; retry and new claim fence the former worker', async () => {
  const old = await running();
  await expire();
  const expired = await snapshot();
  for (const [action, extra] of [
    ['renew', {}],
    ['complete', { result: result() }],
    ['block', { reason: 'Synthetic block.' }],
  ])
    await rejectsCode(() => ownerApply(action, 2, claimPayload(old, extra)), '40001');
  assert.deepEqual(await snapshot(), expired);
  const queued = await ownerApply('retry', 2, {});
  assert.equal(queued.status, 'queued');
  assert.equal(queued.question, QUESTION);
  for (const key of [
    'worker_session',
    'claim_id',
    'claimed_at',
    'lease_expires_at',
    'completed_at',
    'result',
    'blocked_reason',
    'cancel_reason',
  ])
    assert.equal(queued[key], null, key);
  const fresh = await ownerApply('claim', 3, { worker_session: SECOND_WORKER });
  assert.notEqual(fresh.claim_id, old.claim_id);
  await rejectsCode(
    () => ownerApply('complete', 4, claimPayload(old, { result: result() })),
    '40001',
  );
  await rejectsCode(() => ownerApply('renew', 4, claimPayload(old)), '40001');
  assert.equal(
    (await ownerApply('complete', 4, claimPayload(fresh, { result: result() }))).status,
    'completed',
  );
  assert.equal((await events())[1].snapshot.claim_id, old.claim_id);
});

test('sourced completion preserves the exact result and every task version; completed tasks are immutable', async () => {
  const claimed = await running();
  const value = result();
  value.sources.push({
    ...source(),
    url: 'https://docs.example.org:443/a%20b?x=1&y=2',
    retrieved_at: '2024-02-29T00:00:00Z',
  });
  const completed = await ownerApply('complete', 2, claimPayload(claimed, { result: value }));
  assert.equal(completed.status, 'completed');
  assert.equal(completed.version, 3);
  assert.equal(completed.claim_id, claimed.claim_id);
  assert.equal(completed.worker_session, WORKER);
  assert.equal(completed.lease_expires_at, null);
  assert.equal(completed.completed_at, completed.updated_at);
  assert.deepEqual(completed.result, value);
  const original = await snapshot();
  for (const [action, payload] of [
    ['claim', { worker_session: SECOND_WORKER }],
    ['renew', claimPayload(claimed)],
    ['complete', claimPayload(claimed, { result: value })],
    ['block', claimPayload(claimed, { reason: 'Stop.' })],
    ['cancel', { reason: 'Stop.' }],
    ['retry', {}],
  ])
    await rejectsCode(() => ownerApply(action, 3, payload), '40001');
  assert.deepEqual(await create(), completed);
  assert.deepEqual(await snapshot(), original);
  const history = await events();
  assert.deepEqual(
    history.map((event) => event.version),
    [1, 2, 3],
  );
  assert.deepEqual(
    history.map((event) => event.action),
    ['create', 'claim', 'complete'],
  );
  assert.deepEqual(history[2].snapshot, completed);
  for (const event of history) {
    assert.equal(event.snapshot.version, event.version);
    assert.equal(event.snapshot.owner_id, OWNER);
    assert.equal(event.snapshot.id, TASK);
    assert.equal(event.snapshot.question, QUESTION);
    assert.equal(Date.parse(event.occurred_at), Date.parse(event.snapshot.updated_at));
  }
});

test('malformed results, sources, unsafe URLs, invalid calendar timestamps, and field injection roll back', async () => {
  const claimed = await running();
  const invalid = [null, [], {}, { ...result(), private_data: true }];
  const mutate = (change) => {
    const value = result();
    change(value);
    invalid.push(value);
  };
  for (const text of [null, 7, [], '', '\n\t ', 'x'.repeat(20001)])
    mutate((value) => {
      value.text = text;
    });
  for (const limitations of [null, 7, [], 'x'.repeat(4001)])
    mutate((value) => {
      value.limitations = limitations;
    });
  for (const sources of [null, {}, [], [null], [[]], [{}], Array.from({ length: 31 }, source)])
    mutate((value) => {
      value.sources = sources;
    });
  for (const title of [null, 7, [], '', '\n ', 'x'.repeat(301)])
    mutate((value) => {
      value.sources[0].title = title;
    });
  for (const url of [
    null,
    7,
    [],
    '',
    'http://example.org',
    'https://user:pass@example.org/',
    'https://example.org@evil.example/path',
    'https:///path',
    'https://example.org\\@evil.example',
    'https://example.org/space here',
    'https://example.org/\npath',
    'https://example.org/%GG',
    'https://example.org:65536/',
    'https://example.org:0/',
    'https://-bad.example/',
    'https://example.org/' + 'x'.repeat(2000),
  ])
    mutate((value) => {
      value.sources[0].url = url;
    });
  for (const retrieved_at of [
    null,
    7,
    [],
    '',
    'now',
    'infinity',
    '2026-09-08',
    '2026-09-08T12:00:00+00:00',
    '2026-02-29T12:00:00Z',
    '2026-04-31T12:00:00Z',
    '0000-01-01T00:00:00Z',
    '2026-09-08T24:00:00Z',
    '2026-09-08T12:00:60Z',
    '2026-09-08T12:00:00Z trailing',
  ])
    mutate((value) => {
      value.sources[0].retrieved_at = retrieved_at;
    });
  mutate((value) => {
    value.sources[0].owner_id = SECOND;
  });
  for (const key of ['text', 'sources', 'limitations'])
    mutate((value) => {
      delete value[key];
    });
  for (const key of ['title', 'url', 'retrieved_at'])
    mutate((value) => {
      delete value.sources[0][key];
    });
  const original = await snapshot();
  for (let index = 0; index < invalid.length; index++) {
    try {
      await rejectsCode(
        () => ownerApply('complete', 2, claimPayload(claimed, { result: invalid[index] })),
        '22023',
      );
    } catch (error) {
      error.message = `Invalid result case ${index}: ${error.message}`;
      throw error;
    }
  }
  await rejectsCode(
    () =>
      ownerApply(
        'complete',
        2,
        claimPayload(claimed, { result: result(), completed_at: '2099-01-01T00:00:00Z' }),
      ),
    '22023',
  );
  assert.deepEqual(await snapshot(), original);
});

test('result character and total-byte budgets accept exact boundaries and reject overflow', async () => {
  const claimed = await running();
  const maximum = {
    text: 'x'.repeat(20000),
    limitations: 'x'.repeat(4000),
    sources: Array.from({ length: 30 }, () => ({
      url: 'https://example.org/' + 'x'.repeat(2000 - 'https://example.org/'.length),
      title: 'x'.repeat(300),
      retrieved_at: '2026-09-08T00:00:00Z',
    })),
  };
  assert.deepEqual(
    (await ownerApply('complete', 2, claimPayload(claimed, { result: maximum }))).result,
    maximum,
  );
  const second = await running(OTHER_TASK);
  // Size is measured using PostgreSQL's actual jsonb serialization, including UTF-8.
  const bounded = structuredClone(maximum);
  const size = async (value) =>
    (await db.query('SELECT octet_length($1::jsonb::text) AS bytes', [JSON.stringify(value)]))
      .rows[0].bytes;
  const difference = 100000 - (await size(bounded));
  assert.ok(difference > 0 && difference < 20000);
  bounded.text = 'é'.repeat(difference) + 'x'.repeat(20000 - difference);
  assert.ok(Array.from(bounded.text).length <= 20000);
  assert.equal(await size(bounded), 100000);
  const overflow = structuredClone(bounded);
  overflow.text = overflow.text.replace('x', 'é');
  assert.equal(await size(overflow), 100001);
  const original = await snapshot();
  await rejectsCode(
    () => ownerApply('complete', 2, claimPayload(second, { result: overflow }), OTHER_TASK),
    '22023',
  );
  assert.deepEqual(await snapshot(), original);
  assert.deepEqual(
    (await ownerApply('complete', 2, claimPayload(second, { result: bounded }), OTHER_TASK)).result,
    bounded,
  );
});

test('block and retry retain immutable input and old claims in audit while clearing active fields', async () => {
  const claimed = await running();
  const reason = '  Synthetic missing evidence.\n';
  const blocked = await ownerApply('block', 2, claimPayload(claimed, { reason }));
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.blocked_reason, reason);
  assert.equal(blocked.claim_id, claimed.claim_id);
  assert.equal(blocked.lease_expires_at, null);
  await rejectsCode(
    () => ownerApply('complete', 3, claimPayload(claimed, { result: result() })),
    '40001',
  );
  await rejectsCode(() => ownerApply('retry', 3, { question: 'Replacement?' }), '22023');
  await rejectsCode(() => ownerApply('retry', 2, {}), '40001');
  const retried = await ownerApply('retry', 3, {});
  assert.equal(retried.status, 'queued');
  assert.equal(retried.question, QUESTION);
  assert.equal(retried.created_at, claimed.created_at);
  for (const key of [
    'worker_session',
    'claim_id',
    'claimed_at',
    'lease_expires_at',
    'completed_at',
    'result',
    'blocked_reason',
    'cancel_reason',
  ])
    assert.equal(retried[key], null, key);
  assert.equal((await events())[2].snapshot.blocked_reason, reason);
  const fresh = await ownerApply('claim', 4, { worker_session: SECOND_WORKER });
  assert.notEqual(fresh.claim_id, claimed.claim_id);
  assert.deepEqual(
    (await events()).map((event) => event.action),
    ['create', 'claim', 'block', 'retry', 'claim'],
  );
});

test('owner may cancel queued, running, or blocked work; reasons are bounded and cancellation is terminal', async () => {
  for (const status of ['queued', 'running', 'blocked']) {
    const id = status === 'queued' ? TASK : status === 'running' ? OTHER_TASK : WRONG_CLAIM;
    let current = await create(id);
    if (status !== 'queued') current = await ownerApply('claim', 1, { worker_session: WORKER }, id);
    if (status === 'blocked')
      current = await ownerApply(
        'block',
        2,
        claimPayload(current, { reason: 'x'.repeat(4000) }),
        id,
      );
    const original = await snapshot();
    for (const reason of [null, 7, [], '', '\n\t ', 'x'.repeat(4001)])
      await rejectsCode(() => ownerApply('cancel', current.version, { reason }, id), '22023');
    if (status === 'running')
      for (const reason of [null, 7, [], '', '\n\t ', 'x'.repeat(4001)])
        await rejectsCode(
          () => ownerApply('block', current.version, claimPayload(current, { reason }), id),
          '22023',
        );
    assert.deepEqual(await snapshot(), original);
    const cancelled = await ownerApply('cancel', current.version, { reason: 'x'.repeat(4000) }, id);
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(cancelled.cancel_reason.length, 4000);
    assert.equal(cancelled.lease_expires_at, null);
    assert.equal(cancelled.claim_id, current.claim_id);
    assert.equal(cancelled.blocked_reason, null);
    await rejectsCode(
      () => ownerApply('cancel', cancelled.version, { reason: 'Again.' }, id),
      '40001',
    );
    await rejectsCode(() => ownerApply('retry', cancelled.version, {}, id), '40001');
    await rejectsCode(
      () => ownerApply('claim', cancelled.version, { worker_session: WORKER }, id),
      '40001',
    );
    assert.deepEqual(await create(id), cancelled);
  }
});

test('the final bounded version is readable and cannot be mutated or produce extra events', async () => {
  await create();
  // Administrative synthetic seed avoids a billion writes while testing the cap.
  await db.exec('UPDATE public.xiv_research_tasks SET version=999999999');
  const final = await ownerApply('claim', 999999999, { worker_session: WORKER });
  assert.equal(final.version, 1000000000);
  const original = await snapshot();
  await rejectsCode(() => ownerApply('renew', 1000000000, claimPayload(final)), '22023');
  await rejectsCode(() => ownerApply('cancel', 1000000001, { reason: 'Stop.' }), '22023');
  assert.deepEqual(await create(), final);
  assert.deepEqual(await snapshot(), original);
  assert.deepEqual(
    (await events()).map((event) => event.version),
    [1, 1000000000],
  );
});

test('audit storage failure rolls back both create and update atomically', async () => {
  await create();
  const original = await snapshot();
  await db.exec(`
    CREATE FUNCTION public.synthetic_reject_research_event() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic audit storage failure'; END;
    $$;
    CREATE TRIGGER synthetic_research_event_failure BEFORE INSERT ON public.xiv_research_events
      FOR EACH ROW EXECUTE FUNCTION public.synthetic_reject_research_event();
  `);
  try {
    await rejectsCode(() => ownerApply('claim', 1, { worker_session: WORKER }), 'P0001');
    await rejectsCode(() => create(OTHER_TASK), 'P0001');
    assert.deepEqual(await snapshot(), original);
  } finally {
    await db.exec(
      'DROP TRIGGER synthetic_research_event_failure ON public.xiv_research_events; DROP FUNCTION public.synthetic_reject_research_event()',
    );
  }
});

test('server clock is sampled after transaction start and an expired lease cannot be used in a long transaction', async () => {
  const claimed = await running();
  // Distinguishes clock_timestamp() from transaction-start now(). PGlite's clock
  // has millisecond resolution, so allow one small local tick before the fixture.
  await db.exec('BEGIN');
  try {
    await delay(20);
    await db.query(
      'UPDATE public.xiv_research_tasks SET lease_expires_at=clock_timestamp() WHERE owner_id=$1 AND id=$2',
      [OWNER, TASK],
    );
    assert.deepEqual(
      (
        await db.query(
          'SELECT lease_expires_at > transaction_timestamp() AS after_transaction_start, lease_expires_at <= clock_timestamp() AS expired_now FROM public.xiv_research_tasks WHERE owner_id=$1 AND id=$2',
          [OWNER, TASK],
        )
      ).rows[0],
      { after_transaction_start: true, expired_now: true },
    );
    await db.exec('SAVEPOINT before_worker');
    await db.exec('SET ROLE authenticated');
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [OWNER]);
    await rejectsCode(
      () => apply(db, 'complete', 2, claimPayload(claimed, { result: result() })),
      '40001',
    );
    await db.exec('ROLLBACK TO SAVEPOINT before_worker');
  } finally {
    await db.exec('ROLLBACK');
    await db.exec('RESET ROLE');
  }
  assert.equal((await events()).length, 2);
});

test('claimed work, completed sources, and immutable history survive local close and reopen', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xiv-research-db-'));
  let disk;
  try {
    disk = new PGlite(directory);
    await setup(disk);
    await asUser(OWNER, (client) => apply(client, 'create', 0, input()), disk);
    const claimed = await asUser(
      OWNER,
      (client) => apply(client, 'claim', 1, { worker_session: WORKER }),
      disk,
    );
    const prior = await snapshot(disk);
    await disk.close();
    disk = new PGlite(directory);
    assert.deepEqual(await snapshot(disk), prior);
    const completed = await asUser(
      OWNER,
      (client) => apply(client, 'complete', 2, claimPayload(claimed, { result: result() })),
      disk,
    );
    await disk.close();
    disk = new PGlite(directory);
    await asUser(
      OWNER,
      async (client) => {
        assert.deepEqual(
          (await client.query('SELECT to_jsonb(t) AS task FROM public.xiv_research_tasks t')).rows,
          [{ task: completed }],
        );
        assert.deepEqual(
          (await client.query('SELECT action FROM public.xiv_research_events ORDER BY version'))
            .rows,
          [{ action: 'create' }, { action: 'claim' }, { action: 'complete' }],
        );
      },
      disk,
    );
    await asUser(
      SECOND,
      async (client) => {
        for (const table of tables)
          assert.deepEqual((await client.query(`SELECT * FROM public.${table}`)).rows, []);
      },
      disk,
    );
  } finally {
    if (disk) await disk.close();
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('xiv-research-db-'));
    await rm(resolved, { recursive: true, force: true });
  }
});
