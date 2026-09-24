import assert from 'node:assert/strict';
import test from 'node:test';
import type { ResearchTaskSummary } from '../src/lib/desk/research';
import {
  acknowledgeResearch,
  emptyResearchDraft,
  prepareResearch,
  researchRecovery,
  researchRequest,
  ResearchRequestError,
  safeSourceHref,
  taskState,
} from '../src/components/desk/research-client';

test('uncertain submissions retain the exact question and task identity until matching acknowledgement', () => {
  let identities = 0;
  const original = { question: '  Compare sources.\nKeep 🎵 and spaces.  ', pending: null };
  const prepared = prepareResearch(original, () => {
    identities++;
    return 'synthetic-id';
  });
  assert.equal(identities, 1);
  assert.equal(prepared.pending?.question, original.question);
  assert.deepEqual(original, {
    question: '  Compare sources.\nKeep 🎵 and spaces.  ',
    pending: null,
  });
  for (let i = 0; i < 5; i++)
    assert.equal(
      prepareResearch(prepared, () => {
        throw new Error('New identity must not be generated');
      }),
      prepared,
    );
  assert.equal(acknowledgeResearch(prepared, 'wrong-task'), prepared);
  assert.deepEqual(acknowledgeResearch(prepared, 'synthetic-id'), emptyResearchDraft());
});

test('empty and oversized questions cannot start a submission; Unicode codepoints are counted', () => {
  for (const question of ['', ' \n\t', 'x'.repeat(12001)])
    assert.throws(() => prepareResearch({ question, pending: null }, () => 'id'));
  const question = '🎵'.repeat(12000);
  assert.equal(
    prepareResearch({ question, pending: null }, () => 'id').pending?.question,
    question,
  );
});

test('recovery captures both raw input and uncertain submission identity without changing it', () => {
  assert.equal(researchRecovery(emptyResearchDraft()), null);
  const question = '  synthetic\n';
  const draft = prepareResearch({ question, pending: null }, () => 'stable-request');
  const recovery = researchRecovery(draft)!;
  assert.match(recovery.filename, /^xiv-desk-\d{4}-\d{2}-\d{2}-recovery\.txt$/);
  assert.equal(JSON.parse(recovery.text).question, question);
  assert.deepEqual(JSON.parse(recovery.text).pending, draft.pending);
  assert.match(JSON.parse(recovery.text).note, /unconfirmed/);
});

test('display derives expiry from the supplied server clock and never calls a claim proof of live execution', () => {
  const task = {
    status: 'running',
    lease_expires_at: '2026-09-08T07:00:00Z',
  } as ResearchTaskSummary;
  const expiry = Date.parse(task.lease_expires_at!);
  assert.equal(taskState(task, expiry - 1), 'Claimed');
  assert.equal(taskState(task, expiry), 'Claim expired');
  assert.equal(taskState(task, expiry + 1), 'Claim expired');
  assert.equal(taskState({ ...task, lease_expires_at: null }, expiry), 'Status unavailable');
  assert.equal(taskState({ ...task, status: 'queued' }, expiry), 'Waiting for an agent');
  assert.equal(taskState({ ...task, status: 'completed' }, expiry), 'Result saved');
});

test('result links reject script, insecure and credential-bearing URLs', () => {
  for (const href of [
    'javascript:alert(1)',
    'data:text/html,test',
    'http://example.org',
    'https://user:pass@example.org',
    'not a link',
  ])
    assert.equal(safeSourceHref(href), null);
  assert.equal(
    safeSourceHref('https://example.org/report?a=1#evidence'),
    'https://example.org/report?a=1#evidence',
  );
});

test('browser requests carry origin-bound session credentials and preserve exact mutation fields', async () => {
  const previous = globalThis.fetch;
  const question = '  synthetic \n';
  const calls: unknown[] = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    return Response.json({ saved: true });
  };
  try {
    assert.deepEqual(await researchRequest('/create', { id: 'synthetic', question }), {
      saved: true,
    });
    const [url, options] = calls[0] as [string, RequestInit];
    assert.equal(url, '/api/desk/research/create');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    assert.equal((options.headers as Record<string, string>)['X-XIV-Desk'], '1');
    assert.deepEqual(JSON.parse(options.body as string), { id: 'synthetic', question });
  } finally {
    globalThis.fetch = previous;
  }
});

test('authorization and uncertain response errors remain failures without fabricating success', async () => {
  const previous = globalThis.fetch;
  try {
    for (const status of [401, 403, 409, 503]) {
      globalThis.fetch = async () => Response.json({ error: 'synthetic refusal' }, { status });
      await assert.rejects(
        researchRequest(''),
        (error: unknown) => error instanceof ResearchRequestError && error.status === status,
      );
    }
    globalThis.fetch = async () => new Response('not JSON', { status: 200 });
    await assert.rejects(researchRequest(''), /unreadable/);
    globalThis.fetch = async () => {
      throw new Error('synthetic network failure');
    };
    await assert.rejects(
      researchRequest('/create', { id: 'stable', question: 'question' }),
      /network failure/,
    );
  } finally {
    globalThis.fetch = previous;
  }
});
