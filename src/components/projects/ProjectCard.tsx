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
          <div className="flex items-center justify-between">
            <span className="mono-tag tracking-[0.22em]">
              {DOMAIN_LABEL[project.domain]} · {STATUS_LABEL[project.status]}
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
