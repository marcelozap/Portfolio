import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// All identities and notes are synthetic. No remote connections or real Gold.
const OWNER = '00000000-0000-0000-0000-000000000001';
const SECOND = '00000000-0000-0000-0000-000000000002';
const NONMEMBER = '00000000-0000-0000-0000-000000000003';
const DAY = '2026-09-08';
const REPORT_ID = 'a'.repeat(64);
const tables = ['xiv_desk_members', 'xiv_desk_days', 'xiv_desk_versions', 'xiv_desk_reports'];
const migration = await readFile(
  new URL('../supabase/migrations/202609080001_xiv_private_desk.sql', import.meta.url),
  'utf8',
);
let db;

function thought(number = 1, raw = '  Synthetic voice thought.\nCafé.  ') {
  return {
    id: `00000000-0000-0000-0000-${number.toString(16).padStart(12, '0')}`,
    raw,
    source: 'voice',
    filename: null,
    position: [-80, 25, 110],
  };
}

function state() {
  return {
    cards: [thought()],
    layout: { analyst: [-370, -120, 20], quant: [330, -90, -80], coach: [130, 175, 40] },
    camera: { rx: -6, ry: -9, zoom: 1 },
    capture: 'Unconfirmed scratch text.\n',
  };
}

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
  await database.exec(migration);
}

async function members(database) {
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

async function save(database, revision = 0, value = state(), day = DAY) {
  const result = await database.query(
    'SELECT public.xiv_desk_save($1::date, $2::integer, $3::jsonb) AS saved',
    [day, revision, JSON.stringify(value)],
  );
  return result.rows[0].saved;
}

async function snapshot() {
  const result = {};
  for (const table of tables) {
    result[table] = (await db.query(`SELECT * FROM public.${table} ORDER BY 1, 2`)).rows;
  }
  return result;
}

function rejectsCode(action, code) {
  return assert.rejects(action, (error) => {
    assert.equal(error.code, code, error.message);
    return true;
  });
}

async function insertReport(database, owner = OWNER, id = REPORT_ID, role = 'Research Analyst') {
  return database.query(
    'INSERT INTO public.xiv_desk_reports(owner_id,id,role,body) VALUES ($1,$2,$3,$4::jsonb)',
    [
      owner,
      id,
      role,
      JSON.stringify({
        private: true,
        role,
        model_called: false,
        operator_approved: false,
        draft: 'Synthetic only.',
      }),
    ],
  );
}

before(async () => {
  db = new PGlite();
  await setup(db);
});

beforeEach(async () => {
  await db.exec('RESET ROLE');
  await db.exec(
    'TRUNCATE public.xiv_desk_reports, public.xiv_desk_versions, public.xiv_desk_days, public.xiv_desk_members',
  );
  await members(db);
});

after(async () => {
  if (db) await db.close();
});

test('migration creates RLS tables and a restricted definer RPC', async () => {
  const rows = (
    await db.query(
      "SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relname LIKE 'xiv_desk_%' AND relkind = 'r' ORDER BY relname",
    )
  ).rows;
  assert.equal(rows.length, 4);
  assert.ok(rows.every((row) => row.relrowsecurity));
  const functionRow = (
    await db.query(
      "SELECT prosecdef, proconfig FROM pg_proc WHERE oid = 'public.xiv_desk_save(date,integer,jsonb)'::regprocedure",
    )
  ).rows[0];
  assert.equal(functionRow.prosecdef, true);
  assert.deepEqual(functionRow.proconfig, ['search_path=pg_catalog']);
  const acl = (
    await db.query(
      "SELECT has_function_privilege('anon','public.xiv_desk_save(date,integer,jsonb)','EXECUTE') AS anon, has_function_privilege('authenticated','public.xiv_desk_save(date,integer,jsonb)','EXECUTE') AS member",
    )
  ).rows[0];
  assert.deepEqual(acl, { anon: false, member: true });
});

test('valid saves preserve exact text and retain every prior revision', async () => {
  const first = state();
  const second = state();
  second.cards[0].raw = 'A revised synthetic thought.';
  await asUser(OWNER, async (client) => {
    assert.deepEqual(await save(client, 0, first), { day: DAY, revision: 1, state: first });
    assert.deepEqual(await save(client, 1, second), { day: DAY, revision: 2, state: second });
    const current = (await client.query('SELECT revision,state FROM public.xiv_desk_days')).rows;
    assert.deepEqual(current, [{ revision: 2, state: second }]);
    const versions = (
      await client.query('SELECT revision,state FROM public.xiv_desk_versions ORDER BY revision')
    ).rows;
    assert.deepEqual(versions, [
      { revision: 1, state: first },
      { revision: 2, state: second },
    ]);
  });
  assert.equal(
    (await db.query('SELECT COUNT(*)::integer AS count FROM public.xiv_desk_reports')).rows[0]
      .count,
    0,
  );
});

test('stale revisions fail with 40001 and change neither current nor history', async () => {
  await asUser(OWNER, (client) => save(client));
  const original = await snapshot();
  await rejectsCode(() => asUser(OWNER, (client) => save(client, 0)), '40001');
  assert.deepEqual(await snapshot(), original);
});

test('blank card text is preserved exactly without confirming or generating reports', async () => {
  const value = state();
  value.cards = [thought(1, ''), thought(2, '\n\t ')];
  value.capture = '';
  assert.deepEqual(await asUser(OWNER, (client) => save(client, 0, value)), {
    day: DAY,
    revision: 1,
    state: value,
  });
  const saved = await snapshot();
  assert.deepEqual(saved.xiv_desk_days[0].state, value);
  assert.deepEqual(saved.xiv_desk_versions[0].state, value);
  assert.deepEqual(saved.xiv_desk_reports, []);
});

test('the final revision increment remains readable and saves at the cap cannot alter history', async () => {
  // Synthetic administrative seed avoids a billion writes while exercising the RPC boundary.
  const originalState = state();
  for (const table of ['xiv_desk_days', 'xiv_desk_versions']) {
    await db.query(
      `INSERT INTO public.${table}(owner_id,day,revision,state) VALUES ($1,$2,999999999,$3::jsonb)`,
      [OWNER, DAY, JSON.stringify(originalState)],
    );
  }
  const updated = state();
  updated.capture = 'Final bounded revision.';
  assert.deepEqual(await asUser(OWNER, (client) => save(client, 999999999, updated)), {
    day: DAY,
    revision: 1000000000,
    state: updated,
  });
  const capped = await snapshot();
  assert.equal(capped.xiv_desk_days[0].revision, 1000000000);
  assert.deepEqual(
    capped.xiv_desk_versions.map((row) => row.revision),
    [999999999, 1000000000],
  );
  await rejectsCode(() => asUser(OWNER, (client) => save(client, 1000000000)), '22023');
  await rejectsCode(() => asUser(OWNER, (client) => save(client, 1000000001)), '22023');
  assert.deepEqual(await snapshot(), capped);
});

test('save holds one canonical owner/day transaction lock across DateStyle settings', async () => {
  await asUser(OWNER, async (client) => {
    await client.exec('BEGIN');
    try {
      await client.exec("SET LOCAL DateStyle = 'ISO, MDY'");
      await save(client);
      const locks = async () =>
        (
          await client.query(
            "SELECT classid,objid,objsubid FROM pg_locks WHERE locktype='advisory' AND pid=pg_backend_pid() AND granted ORDER BY classid,objid,objsubid",
          )
        ).rows;
      const first = await locks();
      assert.equal(first.length, 1);
      await client.exec("SET LOCAL DateStyle = 'SQL, DMY'");
      assert.equal((await save(client, 1)).day, DAY);
      assert.deepEqual(await locks(), first);
      await client.exec('COMMIT');
      assert.deepEqual(await locks(), []);
    } catch (error) {
      await client.exec('ROLLBACK');
      throw error;
    }
  });
});

test('two members saving the same day cannot read or alter each other', async () => {
  const first = state();
  const second = state();
  second.cards[0].raw = 'Private to the second synthetic member.';
  await asUser(OWNER, (client) => save(client, 0, first));
  await asUser(SECOND, (client) => save(client, 0, second));
  for (const [owner, expected] of [
    [OWNER, first],
    [SECOND, second],
  ]) {
    await asUser(owner, async (client) => {
      assert.deepEqual(
        (await client.query('SELECT owner_id,revision,state FROM public.xiv_desk_days')).rows,
        [{ owner_id: owner, revision: 1, state: expected }],
      );
      assert.deepEqual(
        (await client.query('SELECT owner_id,revision,state FROM public.xiv_desk_versions')).rows,
        [{ owner_id: owner, revision: 1, state: expected }],
      );
      assert.deepEqual((await client.query('SELECT user_id FROM public.xiv_desk_members')).rows, [
        { user_id: owner },
      ]);
    });
  }
  assert.equal(
    (await db.query('SELECT COUNT(*)::integer AS count FROM public.xiv_desk_days')).rows[0].count,
    2,
  );
});

test('anonymous users have no table access or RPC execution, even with an owner claim', async () => {
  await asUser(OWNER, (client) => save(client));
  const original = await snapshot();
  for (const table of tables) {
    await rejectsCode(
      () => asRole('anon', OWNER, (client) => client.query(`SELECT * FROM public.${table}`)),
      '42501',
    );
  }
  await rejectsCode(() => asRole('anon', OWNER, (client) => save(client)), '42501');
  await rejectsCode(() => asRole('anon', OWNER, (client) => insertReport(client)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('nonmembers and missing identity cannot read private rows or save', async () => {
  await asUser(OWNER, (client) => save(client));
  const original = await snapshot();
  for (const owner of [NONMEMBER, null]) {
    await asUser(owner, async (client) => {
      for (const table of tables)
        assert.deepEqual((await client.query(`SELECT * FROM public.${table}`)).rows, []);
    });
    await rejectsCode(() => asUser(owner, (client) => save(client)), '42501');
    await rejectsCode(() => asUser(owner, (client) => insertReport(client, NONMEMBER)), '42501');
  }
  assert.deepEqual(await snapshot(), original);
});

test('disabled membership immediately gates private rows and cannot self-reactivate', async () => {
  await asUser(OWNER, (client) => save(client));
  await asUser(OWNER, (client) => insertReport(client));
  await db.query('UPDATE public.xiv_desk_members SET enabled=false WHERE user_id=$1', [OWNER]);
  await asUser(OWNER, async (client) => {
    assert.deepEqual((await client.query('SELECT enabled FROM public.xiv_desk_members')).rows, [
      { enabled: false },
    ]);
    for (const table of tables.slice(1))
      assert.deepEqual((await client.query(`SELECT * FROM public.${table}`)).rows, []);
  });
  await rejectsCode(() => asUser(OWNER, (client) => save(client, 1)), '42501');
  await rejectsCode(
    () => asUser(OWNER, (client) => insertReport(client, OWNER, 'b'.repeat(64))),
    '42501',
  );
  await rejectsCode(
    () =>
      asUser(OWNER, (client) => client.query('UPDATE public.xiv_desk_members SET enabled=true')),
    '42501',
  );
});

test('membership cannot self-enrol or be changed by authenticated clients', async () => {
  const original = await snapshot();
  for (const sql of [
    `INSERT INTO public.xiv_desk_members(user_id) VALUES ('${NONMEMBER}')`,
    'UPDATE public.xiv_desk_members SET enabled=false',
    'DELETE FROM public.xiv_desk_members',
  ])
    await rejectsCode(() => asUser(NONMEMBER, (client) => client.exec(sql)), '42501');
  assert.deepEqual(await snapshot(), original);
});

test('day and version tables deny direct insert, update, and delete to members', async () => {
  await asUser(OWNER, (client) => save(client));
  const original = await snapshot();
  for (const table of ['xiv_desk_days', 'xiv_desk_versions']) {
    for (const sql of [
      `INSERT INTO public.${table}(owner_id,day,revision,state) VALUES ('${OWNER}','2026-09-09',1,'{}')`,
      `UPDATE public.${table} SET state='{}'`,
      `DELETE FROM public.${table}`,
    ])
      await rejectsCode(() => asUser(OWNER, (client) => client.exec(sql)), '42501');
  }
  assert.deepEqual(await snapshot(), original);
});

test('state schema rejects unknown fields, wrong types, duplicate IDs, and bad coordinates', async () => {
  const invalid = [null, [], {}, { ...state(), owner_id: SECOND }];
  const mutate = (change) => {
    const value = state();
    change(value);
    invalid.push(value);
  };
  mutate((value) => {
    delete value.capture;
  });
  mutate((value) => {
    value.capture = 12;
  });
  mutate((value) => {
    value.cards = {};
  });
  mutate((value) => {
    value.cards.push(structuredClone(value.cards[0]));
  });
  mutate((value) => {
    value.cards[0].id = '../../escape';
  });
  mutate((value) => {
    value.cards[0].id = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
  });
  mutate((value) => {
    value.cards[0].confirmed = true;
  });
  mutate((value) => {
    delete value.cards[0].filename;
  });
  mutate((value) => {
    value.cards[0].raw = null;
  });
  mutate((value) => {
    value.cards[0].source = 'approved';
  });
  mutate((value) => {
    value.cards[0].source = [];
  });
  mutate((value) => {
    value.cards[0].filename = 42;
  });
  mutate((value) => {
    value.cards[0].position = [0, 1];
  });
  mutate((value) => {
    value.cards[0].position = [0, 1, 2, 3];
  });
  mutate((value) => {
    value.cards[0].position = [true, 1, 2];
  });
  mutate((value) => {
    value.cards[0].position = [1600.001, 1, 2];
  });
  mutate((value) => {
    value.cards[0].position = [1e300, 1, 2];
  });
  mutate((value) => {
    value.layout = null;
  });
  mutate((value) => {
    value.layout.extra = [0, 0, 0];
  });
  mutate((value) => {
    delete value.layout.quant;
  });
  mutate((value) => {
    value.layout.coach = [0, '1', 2];
  });
  mutate((value) => {
    value.layout.coach = [-1601, 1, 2];
  });
  mutate((value) => {
    value.camera = [];
  });
  mutate((value) => {
    value.camera.extra = 1;
  });
  mutate((value) => {
    delete value.camera.zoom;
  });
  mutate((value) => {
    value.camera.rx = 35.001;
  });
  mutate((value) => {
    value.camera.ry = -35.001;
  });
  mutate((value) => {
    value.camera.zoom = 0.449;
  });
  mutate((value) => {
    value.camera.zoom = 1.401;
  });
  mutate((value) => {
    value.camera.zoom = '1';
  });
  const original = await snapshot();
  for (let index = 0; index < invalid.length; index++) {
    try {
      await rejectsCode(() => asUser(OWNER, (client) => save(client, 0, invalid[index])), '22023');
    } catch (error) {
      error.message = `Invalid case ${index}: ${error.message}`;
      throw error;
    }
  }
  assert.deepEqual(await snapshot(), original);
});

test('text and card budgets reject overflow and accept their exact boundaries', async () => {
  const invalid = [];
  const tooMany = state();
  tooMany.cards = Array.from({ length: 81 }, (_, index) => thought(index + 1));
  invalid.push(tooMany);
  const tooLong = state();
  tooLong.cards[0].raw = 'x'.repeat(20001);
  invalid.push(tooLong);
  const capture = state();
  capture.capture = 'x'.repeat(20001);
  invalid.push(capture);
  const filename = state();
  filename.cards[0].filename = 'x'.repeat(251);
  invalid.push(filename);
  const total = state();
  total.cards = Array.from({ length: 10 }, (_, index) => thought(index + 1, 'x'.repeat(20000)));
  total.capture = 'x';
  invalid.push(total);
  for (const value of invalid)
    await rejectsCode(() => asUser(OWNER, (client) => save(client, 0, value)), '22023');
  const maximumText = state();
  maximumText.capture = 'x'.repeat(20000);
  maximumText.cards = Array.from({ length: 9 }, (_, index) =>
    thought(index + 1, 'x'.repeat(20000)),
  );
  maximumText.cards[0].filename = 'x'.repeat(250);
  await asUser(OWNER, (client) => save(client, 0, maximumText));
  const maximumCards = state();
  maximumCards.cards = Array.from({ length: 80 }, (_, index) => thought(index + 1, 'x'));
  maximumCards.camera = { rx: -35, ry: 35, zoom: 0.45 };
  maximumCards.layout.coach = [-1600, 0, 1600];
  assert.deepEqual(await asUser(OWNER, (client) => save(client, 1, maximumCards)), {
    day: DAY,
    revision: 2,
    state: maximumCards,
  });
});

test('nonfinite JSON, null revisions, and non-calendar days are rejected without saving', async () => {
  for (const value of ['NaN', 'Infinity', '-Infinity']) {
    const raw = JSON.stringify(state()).replace('"rx":-6', `"rx":${value}`);
    await rejectsCode(
      () =>
        asUser(OWNER, (client) =>
          client.query('SELECT public.xiv_desk_save($1::date,0,$2::jsonb)', [DAY, raw]),
        ),
      '22P02',
    );
  }
  for (const revision of [null, -1, 1000000001, 2147483647])
    await rejectsCode(() => asUser(OWNER, (client) => save(client, revision)), '22023');
  for (const day of [null, 'infinity', '-infinity', '0001-01-01 BC', '10000-01-01'])
    await rejectsCode(() => asUser(OWNER, (client) => save(client, 0, state(), day)), '22023');
  assert.deepEqual((await db.query('SELECT * FROM public.xiv_desk_days')).rows, []);
  assert.deepEqual((await db.query('SELECT * FROM public.xiv_desk_versions')).rows, []);
});

test('report insertion and reading are owner-bound and reports cannot be rewritten', async () => {
  await asUser(OWNER, (client) => insertReport(client));
  await rejectsCode(
    () => asUser(SECOND, (client) => insertReport(client, OWNER, 'b'.repeat(64))),
    '42501',
  );
  await asUser(SECOND, async (client) => {
    assert.deepEqual((await client.query('SELECT * FROM public.xiv_desk_reports')).rows, []);
    await insertReport(client, SECOND);
    assert.deepEqual((await client.query('SELECT owner_id,id FROM public.xiv_desk_reports')).rows, [
      { owner_id: SECOND, id: REPORT_ID },
    ]);
  });
  await asUser(OWNER, async (client) => {
    assert.deepEqual((await client.query('SELECT owner_id,id FROM public.xiv_desk_reports')).rows, [
      { owner_id: OWNER, id: REPORT_ID },
    ]);
  });
  await rejectsCode(() => asUser(OWNER, (client) => insertReport(client)), '23505');
  for (const sql of [
    "UPDATE public.xiv_desk_reports SET body='{}'",
    'DELETE FROM public.xiv_desk_reports',
  ]) {
    await rejectsCode(() => asUser(OWNER, (client) => client.exec(sql)), '42501');
  }
  await rejectsCode(
    () => asUser(OWNER, (client) => insertReport(client, OWNER, '../escape')),
    '23514',
  );
  await rejectsCode(
    () => asUser(OWNER, (client) => insertReport(client, OWNER, 'b'.repeat(64), 'Quant Agent')),
    '23514',
  );
});

test('transaction failure rolls back a version inserted before the current row', async () => {
  await asUser(OWNER, (client) => save(client));
  const original = await snapshot();
  await db.exec(`
    CREATE FUNCTION public.synthetic_reject_day() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic storage failure'; END;
    $$;
    CREATE TRIGGER synthetic_day_failure BEFORE UPDATE ON public.xiv_desk_days
      FOR EACH ROW EXECUTE FUNCTION public.synthetic_reject_day();
  `);
  try {
    await rejectsCode(() => asUser(OWNER, (client) => save(client, 1)), 'P0001');
    assert.deepEqual(await snapshot(), original);
  } finally {
    await db.exec(
      'DROP TRIGGER synthetic_day_failure ON public.xiv_desk_days; DROP FUNCTION public.synthetic_reject_day()',
    );
  }
});

test('saved notes and prior versions survive closing and reopening the local database', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'xiv-desk-db-'));
  let disk;
  try {
    disk = new PGlite(directory);
    await setup(disk);
    await members(disk);
    await asUser(OWNER, (client) => save(client), disk);
    const updated = state();
    updated.cards[0].raw = 'Persisted second revision.';
    await asUser(OWNER, (client) => save(client, 1, updated), disk);
    await disk.close();
    disk = new PGlite(directory);
    await asUser(
      OWNER,
      async (client) => {
        assert.deepEqual(
          (await client.query('SELECT revision,state FROM public.xiv_desk_days')).rows,
          [{ revision: 2, state: updated }],
        );
        assert.deepEqual(
          (await client.query('SELECT revision FROM public.xiv_desk_versions ORDER BY revision'))
            .rows,
          [{ revision: 1 }, { revision: 2 }],
        );
      },
      disk,
    );
  } finally {
    if (disk) await disk.close();
    await rm(directory, { recursive: true, force: true });
  }
});
