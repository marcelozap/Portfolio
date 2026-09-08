import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareRoleQuestion, RESEARCH_ROLES, researchRole } from '../src/lib/desk/role-prompts';

test('unknown deep links cannot select an executable role', () => {
  for (const id of ['admin', '../local', '', null, { id: 'research' }]) {
    assert.equal(researchRole(id), null);
    assert.throws(() => prepareRoleQuestion({ question: '', pending: null }, id));
  }
});

test('starters retain uncertain request identity and custom writing', () => {
  const pending = { id: 'synthetic-request', question: 'Saved question' };
  const held = { question: 'Saved question', pending };
  assert.throws(() => prepareRoleQuestion(held, 'big-money'), /pending/);
  assert.deepEqual(held, { question: 'Saved question', pending });
  const custom = { question: 'My unfinished thought', pending: null };
  assert.throws(() => prepareRoleQuestion(custom, 'research'), /draft is kept/);
  assert.equal(custom.question, 'My unfinished thought');
});

test('only unedited starters can switch without discarding writing', () => {
  const first = prepareRoleQuestion({ question: '', pending: null }, 'research');
  const next = prepareRoleQuestion({ question: first, pending: null }, 'big-money');
  assert.match(next, /^\[Big Money\]/);
  assert.throws(() =>
    prepareRoleQuestion({ question: `${first}\nMy note`, pending: null }, 'quant'),
  );
});

test('private journal work cannot enter the public-source queue through a starter', () => {
  assert.throws(
    () => prepareRoleQuestion({ question: '', pending: null }, 'journal'),
    /not connected/,
  );
  assert.equal(researchRole('journal')?.available, false);
  assert.equal(researchRole('journal')?.question, null);
});

test('public starters preserve evidence boundaries and fit existing queue limits', () => {
  for (const role of RESEARCH_ROLES.filter((item) => item.available)) {
    assert.ok(role.question && role.question.length <= 12000);
  }
  assert.match(researchRole('big-money')!.question!, /transactions from holdings snapshots/);
  assert.match(researchRole('big-money')!.question!, /coverage gaps/);
  assert.match(researchRole('quant')!.question!, /Do not use or infer my private trade history/);
});
