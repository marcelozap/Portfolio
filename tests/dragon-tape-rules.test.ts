import assert from 'node:assert/strict';
import test from 'node:test';
import {
  accountEquity,
  canSelectQuantity,
  executeOrder,
  maxPositionSize,
  nextSizeTier,
  quantityForHotkey,
  readProgress,
  writeProgress,
  type TapeAccount,
} from '../src/lib/play/dragon-tape-rules';

function fresh(overrides: Partial<TapeAccount> = {}): TapeAccount {
  return { c: 5, cash: 10_000, posQty: 0, avg: 0, realized: 0, best: 10_000, ...overrides };
}

function closeTo(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} differs from ${expected}`);
}

function trade(account: TapeAccount, side: 'buy' | 'sell', quantity: number) {
  const result = executeOrder(account, side, quantity);
  assert.equal(result.error, undefined);
  assert.ok(result.fill);
  return result;
}

test('a fresh player can short immediately and cover a falling price, with spread and multiplier', () => {
  const short = trade(fresh(), 'sell', 1);
  assert.deepEqual(short.fill, { kind: 'short', qty: 1, px: 4.99 });
  assert.equal(short.account.posQty, -1);
  closeTo(short.account.cash, 10_499);
  closeTo(accountEquity(short.account), 9_999);

  const cover = trade({ ...short.account, c: 4 }, 'buy', 1);
  assert.deepEqual(cover.fill, { kind: 'cover', qty: 1, px: 4.01 });
  assert.equal(cover.account.posQty, 0);
  assert.equal(cover.account.avg, 0);
  closeTo(cover.account.cash, 10_098);
  closeTo(cover.account.realized, 98);
});

test('a flat-price short round trip costs the two-sided $2 spread', () => {
  const short = trade(fresh(), 'sell', 1);
  const cover = trade(short.account, 'buy', 1);
  closeTo(cover.account.realized, -2);
  closeTo(accountEquity(cover.account), 9_998);
});

test('a rising price loses money on a short without changing P&L sign conventions', () => {
  const short = trade(fresh(), 'sell', 1);
  const cover = trade({ ...short.account, c: 6 }, 'buy', 1);
  closeTo(cover.account.realized, -102);
  closeTo(cover.account.cash, 9_898);
});

test('long gains still include spread and the contract multiplier', () => {
  const long = trade(fresh(), 'buy', 1);
  const close = trade({ ...long.account, c: 6 }, 'sell', 1);
  closeTo(close.account.realized, 98);
  closeTo(close.account.cash, 10_098);
  assert.equal(close.account.posQty, 0);
});

test('sizing tiers unlock exactly at +7%, +14% and +21% of the starting equity', () => {
  for (const [best, size] of [
    [10_000, 1],
    [10_699.99, 1],
    [10_700, 5],
    [11_399.99, 5],
    [11_400, 10],
    [12_099.99, 10],
    [12_100, 14],
    [30_000, 14],
  ])
    assert.equal(maxPositionSize(best), size);
  assert.deepEqual(nextSizeTier(10_000), { max: 5, equity: 10_700 });
  assert.deepEqual(nextSizeTier(10_700), { max: 10, equity: 11_400 });
  assert.deepEqual(nextSizeTier(11_400), { max: 14, equity: 12_100 });
  assert.equal(nextSizeTier(12_100), null);
});

test('old unlocked flags do not create sizing progress; a recorded numeric peak is retained', () => {
  for (const unlocked of [true, false]) {
    const missingPeak = readProgress(JSON.stringify({ unlocked }));
    assert.equal(maxPositionSize(missingPeak.best), 1);
    const oldPeak = readProgress(JSON.stringify({ unlocked, best: 11_400 }));
    assert.equal(maxPositionSize(oldPeak.best), 10);
    assert.equal(trade(fresh({ best: oldPeak.best }), 'sell', 1).account.posQty, -1);
  }
});

test('malformed or nonnumeric stored peaks start safely at one contract', () => {
  for (const raw of [
    null,
    '',
    '{',
    'null',
    '[]',
    'true',
    '{"best":null}',
    '{"best":"12100"}',
    '{"best":1e999}',
    '{"best":-1}',
    '{"best":9999}',
    '{"unlocked":true}',
  ])
    assert.deepEqual(readProgress(raw), { best: 10_000 });
  assert.equal(maxPositionSize(Number.NaN), 1);
  assert.equal(maxPositionSize(Number.POSITIVE_INFINITY), 1);
});

test('new saves preserve the peak through reload and reset without the old direction gate', () => {
  const raw = writeProgress(12_100);
  assert.deepEqual(JSON.parse(raw), { version: 2, best: 12_100 });
  const reset = fresh(readProgress(raw));
  assert.equal(reset.cash, 10_000);
  assert.equal(maxPositionSize(reset.best), 14);
  assert.equal(trade(reset, 'sell', 14).account.posQty, -14);
});

test('both directions refuse locked entry sizes and leave the account untouched', () => {
  for (const side of ['buy', 'sell'] as const) {
    for (const quantity of [5, 10, 14]) {
      const account = fresh();
      const result = executeOrder(account, side, quantity);
      assert.equal(result.error, 'size');
      assert.equal(result.account, account);
      assert.deepEqual(account, fresh());
    }
  }
});

test('splitting orders cannot exceed the aggregate position tier in either direction', () => {
  for (const side of ['buy', 'sell'] as const) {
    const first = trade(fresh(), side, 1).account;
    assert.equal(executeOrder(first, side, 1).error, 'size');
    let sized = fresh({ best: 10_700 });
    for (let i = 0; i < 5; i++) sized = trade(sized, side, 1).account;
    assert.equal(Math.abs(sized.posQty), 5);
    assert.equal(executeOrder(sized, side, 1).error, 'size');
  }
});

test('click selection and keyboard sizing use the same tier restrictions', () => {
  for (const [best, enabled] of [
    [10_000, [1]],
    [10_700, [1, 5]],
    [11_400, [1, 5, 10]],
    [12_100, [1, 5, 10, 14]],
  ] as const) {
    const account = fresh({ best });
    for (const [index, quantity] of [1, 5, 10, 14].entries()) {
      const allowed = (enabled as readonly number[]).includes(quantity);
      assert.equal(canSelectQuantity(account, quantity), allowed);
      assert.equal(quantityForHotkey(account, String(index + 1)), allowed ? quantity : null);
    }
  }
  assert.equal(quantityForHotkey(fresh(), 'b'), null);
  assert.equal(canSelectQuantity(fresh(), 3), false);
});

test('larger owned shorts can be partially covered below their entry tier, then fully closed', () => {
  const oldPosition = fresh({ cash: 14_990, posQty: -10, avg: 4.99, c: 4 });
  assert.equal(canSelectQuantity(oldPosition, 5), true);
  assert.equal(quantityForHotkey(oldPosition, '3'), 10);
  const partial = trade(oldPosition, 'buy', 5);
  assert.equal(partial.account.posQty, -5);
  assert.equal(partial.account.avg, 4.99);
  closeTo(partial.account.realized, 490);
  const close = trade(partial.account, 'buy', 14);
  assert.equal(close.fill.qty, 5);
  assert.equal(close.account.posQty, 0);
  closeTo(close.account.realized, 980);
  assert.equal(canSelectQuantity(close.account, 5), false);
  assert.equal(executeOrder(close.account, 'buy', 5).error, 'size');
});

test('larger owned longs can be partially sold and closing never opens a short', () => {
  const oldPosition = fresh({ cash: 4_990, posQty: 10, avg: 5.01, c: 6 });
  const partial = trade(oldPosition, 'sell', 5);
  assert.equal(partial.account.posQty, 5);
  assert.equal(partial.account.avg, 5.01);
  closeTo(partial.account.realized, 490);
  const close = trade(partial.account, 'sell', 14);
  assert.equal(close.account.posQty, 0);
  assert.equal(close.account.avg, 0);
  closeTo(close.account.realized, 980);
});

test('long entry cannot spend unavailable cash including the ask spread', () => {
  assert.equal(executeOrder(fresh({ c: 100 }), 'buy', 1).error, 'cash');
  const exact = trade(fresh({ cash: 501 }), 'buy', 1);
  closeTo(exact.account.cash, 0);
});

test('short exposure is capped at one times equity after spread, including existing shorts', () => {
  assert.equal(executeOrder(fresh({ c: 100 }), 'sell', 1).error, 'cap');
  const allowed = trade(fresh({ c: 99.98 }), 'sell', 1).account;
  assert.ok(Math.abs(allowed.posQty) * allowed.c * 100 <= accountEquity(allowed));
  const almostFull = fresh({ best: 12_100, cash: 10_499, posQty: -1, avg: 4.99, c: 90 });
  assert.equal(executeOrder(almostFull, 'sell', 1).error, 'cap');
});

test('a losing short can still be covered when its exposure has exceeded the entry cap', () => {
  const underwater = fresh({ cash: 10_499, posQty: -1, avg: 4.99, c: 200 });
  const closed = trade(underwater, 'buy', 1).account;
  assert.equal(closed.posQty, 0);
  closeTo(closed.cash, -9_502);
  closeTo(closed.realized, -19_502);
});

test('invalid quantities are refused before any fill, including non-finite values', () => {
  for (const quantity of [0, -1, 0.5, 15, Number.NaN, Number.POSITIVE_INFINITY]) {
    const original = fresh({ best: 12_100 });
    const result = executeOrder(original, 'sell', quantity);
    assert.equal(result.error, 'quantity');
    assert.equal(result.account, original);
  }
});
