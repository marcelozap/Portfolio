'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Project } from '@/lib/projects';
import { cn } from '@/lib/utils';

interface Props {
  project: Project;
}

/**
 * SVG-based mock visual rendered at the top of a project modal.
 * Each project gets a domain-specific abstraction:
 *   - audio    → waveform / spectrum
 *   - markets  → candlestick + heatmap
 *   - game     → neon-court HUD
 *
 * Deterministic per project id so the visuals stay stable across renders.
 */
export function ProjectVisual({ project }: Props) {
  switch (project.domain) {
    case 'audio':
      return <AudioVisual id={project.id} />;
    case 'markets':
      return <MarketsVisual id={project.id} />;
    case 'game':
      return <GameVisual id={project.id} />;
    default:
      return <SystemsVisual />;
  }
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function AudioVisual({ id }: { id: string }) {
  const rng = useMemo(() => seeded(id), [id]);
  const bars = Array.from({ length: 96 }, () => rng());

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-bg-elevated/80 to-bg-subtle md:h-60">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 top-1/2 flex h-32 -translate-y-1/2 items-center justify-between px-8">
        {bars.map((b, i) => (
          <motion.span
            key={i}
            className="block w-[3px] rounded-full bg-accent"
            initial={{ height: 4 }}
            animate={{
              height: [4, 8 + b * 80, 4],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.4 + b * 0.8,
              repeat: Infinity,
              delay: i * 0.02,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        gatekpt · session_visual
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-accent">
        ● rec / 1.0 · 120 BPM
      </div>
    </div>
  );
}

function MarketsVisual({ id }: { id: string }) {
  const rng = useMemo(() => seeded(id), [id]);

  // generate a random-ish line series + candle series
  const candles = Array.from({ length: 24 }, (_, i) => {
    const open = 100 + rng() * 40 + i * 1.2;
    const close = open + (rng() - 0.5) * 18;
    const high = Math.max(open, close) + rng() * 6;
    const low = Math.min(open, close) - rng() * 6;
    return { open, close, high, low };
  });
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const norm = (v: number) => 100 - ((v - min) / (max - min)) * 90 - 5;

  const heat = Array.from({ length: 8 * 16 }, () => rng());

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-bg-elevated/80 to-bg-subtle md:h-60">
      <div className="grid-bg absolute inset-0 opacity-30" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {candles.map((c, i) => {
          const up = c.close >= c.open;
          const x = (i / candles.length) * 96 + 2;
          return (
            <g key={i} stroke={up ? 'hsl(152 78% 52%)' : 'hsl(358 82% 62%)'}>
              <line x1={x} x2={x} y1={norm(c.high)} y2={norm(c.low)} strokeWidth="0.3" />
              <rect
                x={x - 1.2}
                y={Math.min(norm(c.open), norm(c.close))}
                width="2.4"
                height={Math.max(1, Math.abs(norm(c.open) - norm(c.close)))}
                fill={up ? 'hsl(152 78% 52% / 0.7)' : 'hsl(358 82% 62% / 0.7)'}
                stroke="none"
              />
            </g>
          );
        })}
      </svg>

      <div
        className="absolute bottom-3 left-6 right-6 grid gap-[2px]"
        style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
      >
        {heat.map((v, i) => (
          <span
            key={i}
            className="h-2 rounded-[2px]"
            style={{
              backgroundColor: `hsl(${188 - v * 70} 90% ${30 + v * 30}% / ${0.2 + v * 0.7})`,
            }}
          />
        ))}
      </div>

      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        money_machine · vol_surface
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-signal-green">
        regime: risk-on
      </div>
    </div>
  );
}

function GameVisual({ id }: { id: string }) {
  const rng = useMemo(() => seeded(id), [id]);
  const trails = Array.from({ length: 10 }, (_, i) => ({
    delay: i * 0.06,
    offset: rng(),
  }));

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(80%_60%_at_50%_30%,hsl(28_95%_62%/0.18),transparent_60%),linear-gradient(180deg,hsl(222_30%_8%),hsl(222_24%_4%))] md:h-60">
      {/* court */}
      <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="court" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(28 95% 62%)" stopOpacity="0.06" />
            <stop offset="1" stopColor="hsl(28 95% 62%)" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <polygon
          points="20,10 80,10 95,55 5,55"
          fill="url(#court)"
          stroke="hsl(28 95% 62% / 0.6)"
          strokeWidth="0.2"
        />
        <line x1="50" y1="10" x2="50" y2="55" stroke="hsl(28 95% 62% / 0.4)" strokeWidth="0.15" />
        <line x1="13" y1="32" x2="87" y2="32" stroke="hsl(28 95% 62% / 0.4)" strokeWidth="0.15" />
      </svg>

      {/* ball trail */}
      {trails.map((t, i) => (
        <motion.span
          key={i}
          className="absolute size-2 rounded-full bg-accent-warm shadow-[0_0_10px_hsl(28_95%_62%)]"
          initial={{ top: '78%', left: '20%', opacity: 0 }}
          animate={{
            top: ['78%', '24%', '78%'],
            left: ['18%', `${30 + t.offset * 40}%`, '82%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            delay: t.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        rally · flow_hud
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-accent-warm">
        flow: 7.4 · streak: 12
      </div>
    </div>
  );
}

function SystemsVisual() {
  return (
    <div
      className={cn(
        'relative h-48 w-full overflow-hidden border-b border-white/[0.06]',
        'bg-gradient-to-b from-bg-elevated/80 to-bg-subtle',
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-30" />
    </div>
  );
}
