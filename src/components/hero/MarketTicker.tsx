'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Signal {
  label: string;
  value: string;
  phase: number;
}

const SIGNALS: Signal[] = [
  { label: 'Data', value: 'systems', phase: 0 },
  { label: 'LLM', value: 'workflows', phase: 1 },
  { label: 'Internal', value: 'tools', phase: 2 },
  { label: 'React', value: 'interfaces', phase: 0 },
  { label: 'Python', value: 'processing', phase: 1 },
];

/**
 * Decorative work bar for the portfolio hero.
 */
export function MarketTicker() {
  const [signals, setSignals] = useState<Signal[]>(SIGNALS);

  useEffect(() => {
    const id = setInterval(() => {
      setSignals((prev) =>
        prev.map((signal, i) => ({
          ...signal,
          phase: (signal.phase + i + 1) % 3,
        })),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-faint">
      {signals.map((signal) => {
        const active = signal.phase === 1;
        return (
          <span key={signal.label} className="inline-flex items-center gap-2">
            <span
              className={cn(
                'size-1.5 rounded-full border border-white/15 transition',
                active ? 'bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.55)]' : 'bg-white/10',
              )}
            />
            <span className="font-medium text-ink-muted">{signal.label}</span>
            <span className={cn(active ? 'text-ink' : 'text-ink-faint')}>{signal.value}</span>
          </span>
        );
      })}
    </div>
  );
}
