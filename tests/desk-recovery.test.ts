import assert from 'node:assert/strict';
import test from 'node:test';
import { appendRecovery, discardRecovery, type Recovery } from '../src/components/desk/recovery';

const first: Recovery = {
  filename: 'xiv-desk-2026-09-08-recovery.txt',
  text: '  SYNTHETIC unsaved note\nKeep its spacing.  ',
};

test('a second bootstrap auth loss with no snapshot preserves earlier unsaved text', () => {
  const held = appendRecovery([], first);
  for (const message of [null, undefined, {}, { filename: first.filename, text: null }]) {
    assert.strictEqual(appendRecovery(held, message), held);
    assert.equal(held[0].text, first.text);
  }
});

test('distinct same-day and different-day failures accumulate; repeated messages deduplicate', () => {
  const second = { ...first, text: 'SYNTHETIC second revision, still unsaved' };
  const third = { ...first, filename: 'xiv-desk-2026-09-09-recovery.txt' };
  let held = appendRecovery([], first);
  held = appendRecovery(held, second);
  held = appendRecovery(held, third);
  assert.deepEqual(held, [first, second, third]);
  for (const message of [first, second, third, null]) {
    assert.strictEqual(appendRecovery(held, message), held);
  }
});

test('accepting a snapshot does not mutate or retain the incoming mutable object', () => {
  const incoming = { ...first };
  const original: Recovery[] = [];
  const held = appendRecovery(original, incoming);
  incoming.text = 'changed by sender';
  assert.deepEqual(original, []);
  assert.deepEqual(held, [first]);
});

test('invalid filenames and oversized payloads cannot erase or add to held recovery', () => {
  const held = appendRecovery([], first);
  for (const incoming of [
    { ...first, filename: '../private.txt' },
    { ...first, filename: 'https://example.invalid/recovery.txt' },
    { ...first, filename: 123 },
    { ...first, text: 'x'.repeat(2000001) },
    'not a snapshot',
  ])
    assert.strictEqual(appendRecovery(held, incoming), held);
});

test('explicit discard removes only the selected snapshot, including within the same day', () => {
  const second = { ...first, text: 'SYNTHETIC different same-day version' };
  const held = appendRecovery(appendRecovery([], first), second);
  assert.deepEqual(discardRecovery(held, first), [second]);
  assert.deepEqual(held, [first, second]);
  assert.deepEqual(discardRecovery(held, second), [first]);
});
