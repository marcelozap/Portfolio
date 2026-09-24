export const INITIAL_CASH = 10_000;
export const CONTRACT_MULTIPLIER = 100;
export const HALF_SPREAD = 0.01;
export const ORDER_QUANTITIES = [1, 5, 10, 14] as const;

export const SIZE_TIERS = [
  { max: 1, equity: INITIAL_CASH },
  { max: 5, equity: 10_700 },
  { max: 10, equity: 11_400 },
  { max: 14, equity: 12_100 },
] as const;

export type TapeAccount = {
  c: number;
  cash: number;
  posQty: number;
  avg: number;
  realized: number;
  best: number;
};

export type TradeError = 'quantity' | 'size' | 'cash' | 'cap';
export type TradeFill = {
  kind: 'buy' | 'cover' | 'sell' | 'short';
  qty: number;
  px: number;
};

export function accountEquity(account: TapeAccount): number {
  return account.cash + account.posQty * account.c * CONTRACT_MULTIPLIER;
}

function validBest(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= INITIAL_CASH
    ? value
    : INITIAL_CASH;
}

export function maxPositionSize(best: number): number {
  const peak = validBest(best);
  return SIZE_TIERS.reduce<number>((max, tier) => (peak >= tier.equity ? tier.max : max), 1);
}

export function nextSizeTier(best: number) {
  return SIZE_TIERS.find((tier) => tier.equity > validBest(best)) ?? null;
}

export function readProgress(raw: string | null): { best: number } {
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // The v1 short-unlock Boolean is obsolete. Only a recorded numeric peak
      // carries sizing progress forward; it never gates either direction.
      return { best: validBest((parsed as Record<string, unknown>).best) };
    }
  } catch {
    // A malformed browser save starts at the first sizing tier.
  }
  return { best: INITIAL_CASH };
}

export function writeProgress(best: number): string {
  return JSON.stringify({ version: 2, best: validBest(best) });
}

export function canSelectQuantity(account: TapeAccount, quantity: number): boolean {
  return (
    ORDER_QUANTITIES.some((candidate) => candidate === quantity) &&
    (quantity <= maxPositionSize(account.best) || quantity <= Math.abs(account.posQty))
  );
}

export function quantityForHotkey(account: TapeAccount, key: string): number | null {
  const index = ['1', '2', '3', '4'].indexOf(key);
  if (index < 0) return null;
  const quantity = ORDER_QUANTITIES[index];
  return canSelectQuantity(account, quantity) ? quantity : null;
}

export function executeOrder<T extends TapeAccount>(
  account: T,
  side: 'buy' | 'sell',
  quantity: number,
):
  | { account: T; fill: TradeFill; error?: never }
  | { account: T; error: TradeError; fill?: never } {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 14) {
    return { account, error: 'quantity' };
  }
  const px = account.c + (side === 'buy' ? HALF_SPREAD : -HALF_SPREAD);
  const direction = side === 'buy' ? 1 : -1;

  // Closing is always available, including positions above the current entry
  // tier. One order closes only; it never reverses through zero.
  if (account.posQty * direction < 0) {
    const closed = Math.min(quantity, Math.abs(account.posQty));
    const posQty = account.posQty + direction * closed;
    return {
      account: {
        ...account,
        posQty,
        avg: posQty === 0 ? 0 : account.avg,
        cash: account.cash - direction * px * closed * CONTRACT_MULTIPLIER,
        realized: account.realized + direction * (account.avg - px) * closed * CONTRACT_MULTIPLIER,
      },
      fill: { kind: side === 'buy' ? 'cover' : 'sell', qty: closed, px },
    };
  }

  const total = Math.abs(account.posQty) + quantity;
  if (total > maxPositionSize(account.best)) return { account, error: 'size' };
  const cost = px * quantity * CONTRACT_MULTIPLIER;
  if (side === 'buy' && cost > account.cash) return { account, error: 'cash' };
  const equityAfterSpread = accountEquity(account) - HALF_SPREAD * quantity * CONTRACT_MULTIPLIER;
  if (side === 'sell' && total * account.c * CONTRACT_MULTIPLIER > equityAfterSpread) {
    return { account, error: 'cap' };
  }
  return {
    account: {
      ...account,
      avg: (account.avg * Math.abs(account.posQty) + px * quantity) / total,
      cash: account.cash - direction * cost,
      posQty: account.posQty + direction * quantity,
    },
    fill: { kind: side === 'buy' ? 'buy' : 'short', qty: quantity, px },
  };
}
