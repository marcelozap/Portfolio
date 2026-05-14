'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Tick {
  symbol: string;
  value: number;
  drift: number;
}

const SEED: Tick[] = [
  { symbol: 'SPX', value: 5832.4, drift: 0 },
  { symbol: 'VIX', value: 14.2, drift: 0 },
  { symbol: 'BTC', value: 96412, drift: 0 },
  { symbol: 'NDX', value: 20312.6, drift: 0 },
  { symbol: 'DXY', value: 104.1, drift: 0 },
  { symbol: 'GLD', value: 251.3, drift: 0 },
];

/**
 * Faux market ticker — purely decorative, but it sells the systems-thinking
 * vibe. Drifts slowly with deterministic-ish noise.
 */
export function MarketTicker() {
  const [ticks, setTicks] = useState<Tick[]>(SEED);

  useEffect(() => {
    const id = setInterval(() => {
      setTicks((prev) =>
        prev.map((t) => {
          const delta = (Math.random() - 0.5) * t.value * 0.0008;
          return { ...t, value: t.value + delta, drift: delta };
        }),
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-ink-faint">
      {ticks.map((t) => {
        const up = t.drift >= 0;
        return (
          <span key={t.symbol} className="inline-flex items-center gap-1.5">
            <span className="tracking-widest text-ink-muted">{t.symbol}</span>
            <span className="tabular-nums text-ink">
              {t.value < 100
                ? t.value.toFixed(2)
                : t.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}
            </span>
            <span className={cn('tabular-nums', up ? 'text-signal-green' : 'text-signal-red')}>
              {up ? '▲' : '▼'}
            </span>
          </span>
        );
      })}
    </div>
  );
}
