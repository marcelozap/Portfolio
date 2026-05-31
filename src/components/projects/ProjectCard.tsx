'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Project } from '@/lib/projects';
import { cn } from '@/lib/utils';

const ACCENT: Record<Project['accent'], { glow: string; tint: string; ring: string }> = {
  cyan: {
    glow: 'shadow-[0_0_60px_-12px_hsl(188_100%_62%/0.45)]',
    tint: 'from-accent/20',
    ring: 'group-hover:border-accent/40',
  },
  amber: {
    glow: 'shadow-[0_0_60px_-12px_hsl(28_100%_62%/0.45)]',
    tint: 'from-accent-warm/20',
    ring: 'group-hover:border-accent-warm/40',
  },
  violet: {
    glow: 'shadow-[0_0_60px_-12px_hsl(268_80%_70%/0.45)]',
    tint: 'from-accent-cool/20',
    ring: 'group-hover:border-accent-cool/40',
  },
  green: {
    glow: 'shadow-[0_0_60px_-12px_hsl(152_78%_52%/0.45)]',
    tint: 'from-signal-green/20',
    ring: 'group-hover:border-signal-green/40',
  },
};

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  index: number;
}

const DOMAIN_LABEL: Record<Project['domain'], string> = {
  audio: 'creative tools',
  markets: 'research systems',
  game: 'consumer product',
  systems: 'systems',
  infra: 'infrastructure',
};

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-development': 'active build',
  prototype: 'working prototype',
  research: 'research',
};

function GreenMachineTerrainCardArt() {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-white/[0.06] bg-[linear-gradient(180deg,hsl(150_13%_13%),hsl(154_22%_7%))]">
      <div className="absolute inset-0 bg-[radial-gradient(80%_54%_at_50%_12%,hsl(150_24%_78%/0.14),transparent_68%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(150_12%_84%/0.035)_1px,transparent_1px),linear-gradient(0deg,hsl(150_12%_84%/0.028)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <svg
        viewBox="0 0 100 58"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="gm-card-mist" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(150 22% 84%)" stopOpacity="0.18" />
            <stop offset="1" stopColor="hsl(150 24% 10%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gm-card-forest" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(143 34% 38%)" stopOpacity="0.28" />
            <stop offset="1" stopColor="hsl(150 28% 7%)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <polygon
          points="0,58 0,19 9,15 17,23 28,13 38,26 49,18 60,23 70,12 80,21 91,16 100,23 100,58"
          fill="url(#gm-card-mist)"
        />
        <polygon
          points="0,58 0,35 8,30 16,36 27,26 38,34 48,26 59,32 70,24 81,34 91,28 100,32 100,58"
          fill="hsl(150 22% 18% / 0.78)"
        />
        <polygon
          points="0,58 0,45 9,42 18,46 29,41 40,47 51,42 62,46 73,40 84,47 93,43 100,46 100,58"
          fill="url(#gm-card-forest)"
        />
        <polyline
          points="0,35 8,30 16,36 27,26 38,34 48,26 59,32 70,24 81,34 91,28 100,32"
          fill="none"
          stroke="hsl(150 48% 66% / 0.72)"
          strokeWidth="0.42"
        />
        <path
          d="M4 47 C17 40 28 42 40 35 C52 28 62 31 75 22 C84 17 93 17 100 14"
          fill="none"
          stroke="hsl(150 42% 72% / 0.62)"
          strokeDasharray="1.6 1.5"
          strokeWidth="0.3"
        />
        <path
          d="M0 50 C17 47 29 50 42 45 C54 41 65 39 77 40 C88 41 94 36 100 34"
          fill="none"
          stroke="hsl(150 20% 86% / 0.2)"
          strokeDasharray="1 2"
          strokeWidth="0.22"
        />
        {Array.from({ length: 18 }, (_, i) => {
          const x = 4 + i * 5.4;
          const h = 2.2 + (i % 4) * 0.68;
          const y = 46 + (i % 3) * 1.15;
          return (
            <g key={i} opacity="0.68">
              <path
                d={`M${x} ${y - h} L${x - h * 0.45} ${y} L${x + h * 0.45} ${y} Z`}
                fill="hsl(145 34% 35% / 0.72)"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
        terrain / research memory
      </div>
    </div>
  );
}

/**
 * 3D-tilting project card. Mouse moves rotate the card on its X/Y axes
 * with a spring damper. Hover unlocks the accent glow.
 */
export function ProjectCard({ project, onOpen, index }: ProjectCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], ['7deg', '-7deg']), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], ['-7deg', '7deg']), {
    stiffness: 220,
    damping: 22,
  });
  const a = ACCENT[project.accent];

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(px);
    my.set(py);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="group relative block w-full text-left"
      aria-label={`Open ${project.name} project details`}
    >
      <GlassCard
        className={cn('relative h-full transition duration-500', a.ring, 'group-hover:' + a.glow)}
      >
        {/* accent wash */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition group-hover:opacity-100',
            a.tint,
          )}
        />

        <div className="relative grid gap-5 p-6 md:p-7">
          {project.id === 'green-machine' && <GreenMachineTerrainCardArt />}

          <div className="flex items-center justify-between">
            <span className="mono-tag tracking-[0.22em]">
              {DOMAIN_LABEL[project.domain]} / {STATUS_LABEL[project.status]}
            </span>
            <span className="font-mono text-[10px] text-ink-faint">{project.year}</span>
          </div>

          <h3 className="font-display text-2xl text-ink md:text-3xl">{project.name}</h3>
          <p className="text-sm leading-relaxed text-ink-muted md:text-base">{project.tagline}</p>

          <div className="grid grid-cols-3 gap-3 border-t border-white/[0.05] pt-4">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {m.label}
                </div>
                <div className="mt-1 font-display text-base tabular-nums text-ink">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <ul className="flex flex-wrap gap-1.5">
              {project.stack.slice(0, 3).map((s) => (
                <li key={s} className="mono-tag normal-case tracking-wider">
                  {s}
                </li>
              ))}
              {project.stack.length > 3 && (
                <li className="mono-tag normal-case tracking-wider">+{project.stack.length - 3}</li>
              )}
            </ul>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-accent transition group-hover:translate-x-0.5">
              open
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.button>
  );
}
