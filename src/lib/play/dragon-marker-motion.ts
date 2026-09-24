export const MAX_DRAGON_TILT = Math.PI / 8;

export function dragonHeading(
  prices: readonly number[],
  priceSpan: number,
  plotHeight: number,
  pixelsPerTick: number,
): number {
  if (
    prices.length < 2 ||
    !Number.isFinite(priceSpan) ||
    priceSpan <= 0 ||
    !Number.isFinite(plotHeight) ||
    !Number.isFinite(pixelsPerTick)
  ) {
    return 0;
  }
  const count = Math.min(3, prices.length);
  const back = Math.max(0, prices.length - 12);
  const mean = (start: number) =>
    prices.slice(start, start + count).reduce((sum, price) => sum + price, 0) / count;
  const rise = -((mean(prices.length - count) - mean(back)) / priceSpan) * plotHeight;
  // A pixel minimum stops narrow screens from turning tiny moves into steep angles.
  const run = Math.max(48, (prices.length - count - back) * pixelsPerTick);
  const angle = Math.atan2(rise, run);
  return Number.isFinite(angle) && angle !== 0
    ? Math.max(-MAX_DRAGON_TILT, Math.min(MAX_DRAGON_TILT, angle))
    : 0;
}

export function easeDragonHeading(current: number, target: number, elapsedMs: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return 0;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return current;
  // The same elapsed time produces the same turn, regardless of frame rate.
  return current + (target - current) * (1 - Math.exp(-elapsedMs / 180));
}
