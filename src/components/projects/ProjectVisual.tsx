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
 *   - audio: waveform / spectrum
 *   - markets: terrain research map
 *   - game: practice HUD
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
    case 'infra':
      return <InfraVisual id={project.id} />;
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
        musxiv / artist_os
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-accent">
        rec / 1.0 / 120 BPM
      </div>
    </div>
  );
}

function MarketsVisual({ id }: { id: string }) {
  const rng = useMemo(() => seeded(id), [id]);
  const mistId = `${id}-mist`;
  const forestId = `${id}-forest`;

  const ridge = Array.from({ length: 13 }, (_, i) => {
    const x = 4 + i * 8;
    const y = 48 - Math.sin(i * 0.72) * 9 - rng() * 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const upperRidge = Array.from({ length: 11 }, (_, i) => {
    const x = i * 10;
    const y = 30 - Math.sin(i * 0.86 + 0.8) * 7 - rng() * 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lowerRidge = Array.from({ length: 12 }, (_, i) => {
    const x = i * 9.2;
    const y = 64 - Math.sin(i * 0.65 + 1.4) * 6 - rng() * 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const trees = Array.from({ length: 26 }, (_, i) => ({
    x: 3 + i * 3.8,
    y: 69 + rng() * 5,
    h: 3 + rng() * 5,
  }));
  const trails = [
    'M5 72 C18 65 28 66 40 57 C53 47 65 48 78 37 C86 30 93 28 99 24',
    'M0 84 C15 78 24 74 38 76 C51 78 60 70 72 68 C83 66 90 60 100 57',
    'M8 55 C18 52 29 51 39 46 C48 42 56 40 66 41 C75 42 83 37 94 33',
  ];

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.06] bg-[linear-gradient(180deg,hsl(150_14%_14%),hsl(155_20%_7%))] md:h-60">
      <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_18%,hsl(150_30%_82%/0.14),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(150_15%_85%/0.035)_1px,transparent_1px),linear-gradient(0deg,hsl(150_15%_85%/0.03)_1px,transparent_1px)] bg-[size:54px_54px]" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={mistId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(150 20% 82%)" stopOpacity="0.18" />
            <stop offset="1" stopColor="hsl(150 24% 12%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={forestId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(142 34% 40%)" stopOpacity="0.24" />
            <stop offset="1" stopColor="hsl(150 28% 8%)" stopOpacity="0.62" />
          </linearGradient>
        </defs>

        <polygon points={`0,100 0,34 ${upperRidge} 100,100`} fill={`url(#${mistId})`} />
        <polygon points={`0,100 0,54 ${ridge} 100,100`} fill="hsl(150 22% 18% / 0.72)" />
        <polygon points={`0,100 0,70 ${lowerRidge} 100,100`} fill={`url(#${forestId})`} />

        <polyline
          points={upperRidge}
          fill="none"
          stroke="hsl(150 18% 84% / 0.28)"
          strokeWidth="0.35"
        />
        <polyline points={ridge} fill="none" stroke="hsl(150 42% 60% / 0.72)" strokeWidth="0.5" />
        <polyline
          points={lowerRidge}
          fill="none"
          stroke="hsl(150 26% 72% / 0.2)"
          strokeWidth="0.3"
        />

        {trails.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={i === 0 ? 'hsl(150 55% 72% / 0.78)' : 'hsl(150 20% 82% / 0.28)'}
            strokeWidth={i === 0 ? '0.46' : '0.24'}
            strokeDasharray={i === 0 ? '2 1.6' : '1 2.2'}
            animate={{ strokeDashoffset: [0, -7] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {trees.map((t, i) => (
          <g key={i} opacity="0.72">
            <path
              d={`M${t.x} ${t.y - t.h} L${t.x - t.h * 0.42} ${t.y} L${t.x + t.h * 0.42} ${t.y} Z`}
              fill="hsl(145 34% 34% / 0.68)"
            />
            <line
              x1={t.x}
              x2={t.x}
              y1={t.y - t.h * 0.15}
              y2={t.y + 2}
              stroke="hsl(150 18% 16% / 0.7)"
              strokeWidth="0.18"
            />
          </g>
        ))}

        <g opacity="0.48" stroke="hsl(150 20% 84% / 0.34)" strokeWidth="0.18">
          <line x1="13" x2="23" y1="24" y2="24" />
          <line x1="61" x2="73" y1="18" y2="18" />
          <line x1="71" x2="82" y1="52" y2="52" />
        </g>
      </svg>

      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {id === 'green-machine'
          ? 'green_machine / terrain_research'
          : `${id.replace(/-/g, '_')} / terrain`}
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        context / risk / history
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
      <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="practice-surface" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(28 95% 62%)" stopOpacity="0.06" />
            <stop offset="1" stopColor="hsl(28 95% 62%)" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <polygon
          points="20,10 80,10 95,55 5,55"
          fill="url(#practice-surface)"
          stroke="hsl(28 95% 62% / 0.6)"
          strokeWidth="0.2"
        />
        <line x1="50" y1="10" x2="50" y2="55" stroke="hsl(28 95% 62% / 0.4)" strokeWidth="0.15" />
        <line x1="13" y1="32" x2="87" y2="32" stroke="hsl(28 95% 62% / 0.4)" strokeWidth="0.15" />
      </svg>

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
        rally / practice_hud
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-accent-warm">
        flow: 7.4 / streak: 12
      </div>
    </div>
  );
}

function InfraVisual({ id }: { id: string }) {
  const rng = useMemo(() => seeded(id), [id]);
  const factors = Array.from({ length: 6 }, () => rng());

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-bg-elevated/80 to-bg-subtle md:h-60">
      <div className="grid-bg absolute inset-0 opacity-30" />

      <svg viewBox="0 0 100 60" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="node-g" r="0.5" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="hsl(152 78% 52%)" stopOpacity="0.7" />
            <stop offset="1" stopColor="hsl(152 78% 52%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="22" cy="30" r="9" fill="url(#node-g)" />
        <circle cx="78" cy="30" r="9" fill="url(#node-g)" />

        <motion.line
          x1="26"
          y1="30"
          x2="74"
          y2="30"
          stroke="hsl(152 78% 52% / 0.7)"
          strokeWidth="0.45"
          strokeDasharray="1.6 1.6"
          animate={{ strokeDashoffset: [0, -6.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />

        <circle cx="22" cy="30" r="1.6" fill="hsl(152 78% 52%)" />
        <circle cx="78" cy="30" r="1.6" fill="hsl(152 78% 52%)" />

        <motion.circle
          cx="22"
          cy="30"
          r="1.6"
          fill="none"
          stroke="hsl(152 78% 52% / 0.7)"
          strokeWidth="0.3"
          animate={{ r: [1.6, 5, 1.6], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.circle
          cx="78"
          cy="30"
          r="1.6"
          fill="none"
          stroke="hsl(152 78% 52% / 0.7)"
          strokeWidth="0.3"
          animate={{ r: [1.6, 5, 1.6], opacity: [0.7, 0, 0.7] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 1.2,
          }}
        />

        <text
          x="22"
          y="44"
          fontFamily="ui-monospace, monospace"
          fontSize="2.6"
          textAnchor="middle"
          fill="hsl(220 12% 70%)"
          letterSpacing="0.3"
        >
          MAC / UI
        </text>
        <text
          x="78"
          y="44"
          fontFamily="ui-monospace, monospace"
          fontSize="2.6"
          textAnchor="middle"
          fill="hsl(220 12% 70%)"
          letterSpacing="0.3"
        >
          HOST / SIGNALS
        </text>
        <text
          x="50"
          y="26"
          fontFamily="ui-monospace, monospace"
          fontSize="2.4"
          textAnchor="middle"
          fill="hsl(152 78% 52%)"
          letterSpacing="0.3"
        >
          /ws/feed
        </text>
      </svg>

      <div className="absolute inset-x-6 bottom-3 grid grid-cols-6 gap-1.5">
        {factors.map((v, i) => (
          <motion.div
            key={i}
            className="h-3 rounded-[3px] border border-white/[0.06]"
            style={{
              backgroundColor: `hsl(152 78% ${36 + v * 30}% / ${0.25 + v * 0.5})`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2 + v * 1.5,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        exec_mesh / ws_plane
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] tabular-nums text-signal-green">
        kill_switch: ARMED
      </div>
    </div>
  );
}

function SystemsVisual() {
  const nodes = [
    { x: 15, y: 30, label: 'source' },
    { x: 36, y: 18, label: 'score' },
    { x: 58, y: 33, label: 'gate' },
    { x: 82, y: 22, label: 'packet' },
  ];

  return (
    <div
      className={cn(
        'relative h-48 w-full overflow-hidden border-b border-white/[0.06]',
        'bg-[linear-gradient(135deg,hsl(238_20%_10%),hsl(156_20%_8%))] md:h-60',
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_72%_24%,hsl(296_70%_66%/0.16),transparent_62%),radial-gradient(52%_48%_at_18%_72%,hsl(153_80%_58%/0.12),transparent_58%)]" />
      <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" aria-hidden>
        <motion.path
          d="M15 30 C24 23 28 20 36 18 C47 16 50 29 58 33 C68 38 72 26 82 22"
          fill="none"
          stroke="hsl(296 70% 66% / 0.72)"
          strokeWidth="0.45"
          strokeDasharray="1.8 1.5"
          animate={{ strokeDashoffset: [0, -7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M14 41 C29 48 44 42 56 47 C68 52 79 43 91 46"
          fill="none"
          stroke="hsl(153 80% 58% / 0.32)"
          strokeWidth="0.3"
          strokeDasharray="1 2"
          animate={{ strokeDashoffset: [0, -5] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'linear' }}
        />
        {nodes.map((node, i) => (
          <g key={node.label}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="7"
              fill="hsl(238 20% 10% / 0.86)"
              stroke={i === 2 ? 'hsl(153 80% 58% / 0.7)' : 'hsl(296 70% 66% / 0.62)'}
              strokeWidth="0.35"
              animate={{ opacity: [0.72, 1, 0.72] }}
              transition={{ duration: 2.4, delay: i * 0.22, repeat: Infinity, ease: 'easeInOut' }}
            />
            <text
              x={node.x}
              y={node.y + 1}
              fontFamily="ui-monospace, monospace"
              fontSize="2.6"
              textAnchor="middle"
              fill="hsl(220 12% 78%)"
              letterSpacing="0.2"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        local_workflow_os / approval_gates
      </div>
      <div className="absolute right-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-cool">
        submit: manual
      </div>
    </div>
  );
}
