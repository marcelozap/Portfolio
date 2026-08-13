'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Project } from '@/lib/projects';
import { cn } from '@/lib/utils';

const ACCENT: Record<Project['accent'], { glow: string; tint: string; ring: string }> = {
  cyan: {
    glow: '',
    tint: 'from-accent/10',
    ring: 'group-hover:border-accent/40',
  },
  amber: {
    glow: '',
    tint: 'from-accent-warm/8',
    ring: 'group-hover:border-accent/40',
  },
  violet: {
    glow: '',
    tint: 'from-accent-cool/8',
    ring: 'group-hover:border-accent/40',
  },
  green: {
    glow: '',
    tint: 'from-accent/8',
    ring: 'group-hover:border-accent/40',
  },
};

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  index: number;
}

const DOMAIN_LABEL: Record<Project['domain'], string> = {
  markets: 'research systems',
  game: 'practice system',
  systems: 'systems',
  infra: 'infrastructure',
};

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-development': 'active build',
  prototype: 'working prototype',
  research: 'research',
};

function ResearchDataCardArt() {
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
          <linearGradient id="research-card-mist" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(150 22% 84%)" stopOpacity="0.18" />
            <stop offset="1" stopColor="hsl(150 24% 10%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="research-card-forest" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(143 34% 38%)" stopOpacity="0.28" />
            <stop offset="1" stopColor="hsl(150 28% 7%)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <polygon
          points="0,58 0,19 9,15 17,23 28,13 38,26 49,18 60,23 70,12 80,21 91,16 100,23 100,58"
          fill="url(#research-card-mist)"
        />
        <polygon
          points="0,58 0,35 8,30 16,36 27,26 38,34 48,26 59,32 70,24 81,34 91,28 100,32 100,58"
          fill="hsl(150 22% 18% / 0.78)"
        />
        <polygon
          points="0,58 0,45 9,42 18,46 29,41 40,47 51,42 62,46 73,40 84,47 93,43 100,46 100,58"
          fill="url(#research-card-forest)"
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
      </svg>
      <div className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
        datasets / research memory
      </div>
    </div>
  );
}

function WorkflowSystemsCardArt() {
  return (
    <div className="terrain-surface h-32 bg-[linear-gradient(135deg,hsl(222_26%_9%),hsl(160_24%_8%))]">
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_76%_18%,hsl(296_70%_66%/0.18),transparent_62%),radial-gradient(55%_50%_at_22%_70%,hsl(153_80%_58%/0.14),transparent_58%)]" />
      <div className="absolute inset-x-4 top-4 grid grid-cols-4 gap-1.5">
        {['capture', 'check', 'review', 'ship'].map((label, i) => (
          <span
            key={label}
            className="h-5 rounded-[3px] border border-white/[0.07] bg-white/[0.035] px-1.5 pt-1 font-mono text-[7px] uppercase tracking-[0.14em] text-ink-faint transition group-hover:border-accent/25 group-hover:text-ink-muted"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 100 58" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path
          d="M10 42 H24 C30 42 30 25 38 25 H50 C58 25 58 38 66 38 H88"
          fill="none"
          stroke="hsl(296 70% 66% / 0.58)"
          strokeWidth="0.55"
          strokeDasharray="2 1.8"
        />
        <path
          d="M14 48 H36 M46 48 H66 M75 48 H92"
          stroke="hsl(153 80% 58% / 0.42)"
          strokeWidth="0.42"
        />
      </svg>
      <div className="absolute left-4 top-16 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
        approval gates / system records
      </div>
    </div>
  );
}

function GateKptCardArt() {
  const layers = ['power', 'compute', 'data', 'model', 'app', 'eval', 'deploy'];

  return (
    <div className="terrain-surface h-32 bg-[linear-gradient(135deg,hsl(205_34%_8%),hsl(162_28%_7%))]">
      <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_72%_18%,hsl(184_90%_70%/0.18),transparent_62%),radial-gradient(60%_48%_at_18%_78%,hsl(296_70%_66%/0.14),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(184_70%_70%/0.045)_1px,transparent_1px),linear-gradient(0deg,hsl(184_70%_70%/0.035)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute left-4 right-4 top-4 grid grid-cols-7 gap-1">
        {layers.map((layer, i) => (
          <span
            key={layer}
            className="h-12 rounded-[3px] border border-cyan-200/[0.12] bg-cyan-200/[0.035] px-1 pt-2 text-center font-mono text-[6.5px] uppercase tracking-[0.08em] text-ink-faint transition group-hover:border-accent/35 group-hover:text-ink-muted"
            style={{ transform: `translateY(${Math.abs(3 - i) * 3}px)` }}
          >
            {layer}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 100 58" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path
          d="M8 45 C22 29 31 36 43 22 C54 10 67 23 78 14 C88 6 94 10 99 7"
          fill="none"
          stroke="hsl(184 90% 70% / 0.58)"
          strokeWidth="0.42"
          strokeDasharray="1.8 1.6"
        />
        <path
          d="M6 52 H22 M30 52 H46 M54 52 H70 M78 52 H94"
          stroke="hsl(296 70% 66% / 0.36)"
          strokeWidth="0.36"
        />
      </svg>
      <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
        gatekpt / learning system
      </div>
    </div>
  );
}

function RallyCardArt() {
  return (
    <div className="terrain-surface h-32 bg-[linear-gradient(135deg,hsl(146_28%_10%),hsl(38_32%_12%))]">
      <div className="absolute inset-0 bg-[radial-gradient(68%_70%_at_78%_28%,hsl(38_55%_58%/0.18),transparent_62%)]" />
      <svg viewBox="0 0 100 58" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path
          d="M10 8 H88 L98 54 H2 Z"
          fill="hsl(150 32% 11% / 0.72)"
          stroke="hsl(42 48% 72% / 0.36)"
          strokeWidth="0.35"
        />
        <path
          d="M50 8 L50 54 M6 35 H94 M25 8 L18 54 M75 8 L82 54"
          stroke="hsl(42 42% 82% / 0.34)"
          strokeWidth="0.25"
        />
        <path
          d="M11 46 C27 25 41 26 55 36 C70 47 82 40 91 15"
          fill="none"
          stroke="hsl(38 65% 62% / 0.72)"
          strokeDasharray="1.8 1.6"
          strokeWidth="0.42"
        />
        <g fill="hsl(42 38% 82% / 0.82)" stroke="hsl(38 65% 62% / 0.42)" strokeWidth="0.18">
          <circle cx="12" cy="47" r="1.15" />
          <path d="M12 48.3 L12 52.5 M10.1 50 H13.9 M12 52.5 L10 55 M12 52.5 L14 55" />
          <circle cx="90" cy="16" r="1.15" />
          <path d="M90 17.3 L90 21.5 M88.1 19 H91.9 M90 21.5 L88 24 M90 21.5 L92 24" />
        </g>
        <circle r="1.05" fill="hsl(38 95% 68%)">
          <animateMotion
            dur="3.4s"
            repeatCount="indefinite"
            path="M12 47 C29 20 44 23 58 34 C72 45 83 36 90 16 C72 32 50 39 12 47"
          />
        </circle>
      </svg>
      <div className="absolute right-4 top-4 grid grid-cols-2 gap-1.5">
        {['sessions', 'data', 'goals', 'review'].map((label) => (
          <span
            key={label}
            className="rounded-[3px] border border-white/[0.07] bg-bg/35 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-ink-faint transition group-hover:border-accent-warm/30 group-hover:text-ink-muted"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
        practice data / progress
      </div>
    </div>
  );
}

function ProjectEnvironment({ project }: { project: Project }) {
  if (project.id === 'gatekpt') return <GateKptCardArt />;
  if (project.id === 'fsu-options-research') return <ResearchDataCardArt />;
  if (project.id === 'ai-workflow-systems') return <WorkflowSystemsCardArt />;
  if (project.id === 'rally') return <RallyCardArt />;
  return null;
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
      aria-label={`View details for ${project.name}`}
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
          <ProjectEnvironment project={project} />

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
