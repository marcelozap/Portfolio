'use client';

import { motion } from 'framer-motion';
import { Briefcase, type LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

type Accent = 'green';

interface Milestone {
  id: string;
  period: string;
  role: string;
  org: string;
  accent: Accent;
  icon: LucideIcon;
  summary: string;
  focus: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
}

const ACCENT: Record<Accent, { dot: string; text: string; ring: string; tint: string }> = {
  green: {
    dot: 'bg-signal-green shadow-[0_0_10px_hsl(152_78%_52%)]',
    text: 'text-signal-green',
    ring: 'ring-signal-green/30',
    tint: 'from-signal-green/10',
  },
};

const PUBLIX: Milestone = {
  id: 'publix',
  period: '2022 - present',
  role: 'Software Engineer',
  org: 'Enterprise retail systems',
  accent: 'green',
  icon: Briefcase,
  summary:
    'Software engineer working across data workflows, analytics, internal tools, QA automation, and modernization. My focus is making systems easier to validate, support, and trust.',
  focus: [
    'AI-assisted delivery workflows',
    'Data lake and processing',
    'Semantic models and reporting',
    'Internal tools and automation',
  ],
  stack: [
    'C#',
    'Azure',
    'Python',
    'AI-assisted workflows',
    'Snowflake',
    'Databricks',
    'Data lakes',
    'Semantic layer',
    'Power BI',
    'ETL / ELT',
    'APIs',
  ],
  metrics: [
    { label: 'Focus', value: 'Data systems' },
    { label: 'Mode', value: 'QA / data' },
    { label: 'Delivery', value: 'Pipelines' },
  ],
};

export function Experience() {
  const m = PUBLIX;
  const a = ACCENT[m.accent];
  const Icon = m.icon;

  return (
    <section id="experience" className="section">
      <SectionHeader
        eyebrow="Experience"
        title={
          <>
            Software Engineer.
            <br />
            <span className="text-gradient">Clear delivery.</span>
          </>
        }
        description="Data engineering, QA automation, semantic layers, reporting, and modernization."
      />

      <ol className="relative mt-14 space-y-8 border-l border-white/[0.06] pl-8 md:pl-12">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent/40 via-accent-cool/20 to-transparent"
        />

        <motion.li
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <span className="absolute -left-[39px] top-3 flex size-4 items-center justify-center md:-left-[55px]">
            <span
              className={cn(
                'absolute inset-0 animate-pulse-glow rounded-full blur-md',
                a.dot,
                'opacity-50',
              )}
            />
            <span className={cn('relative size-2 rounded-full', a.dot)} />
          </span>

          <GlassCard className="overflow-hidden">
            <svg
              aria-hidden
              viewBox="0 0 100 44"
              className="pointer-events-none absolute inset-x-0 top-0 h-36 w-full opacity-25"
              preserveAspectRatio="none"
            >
              <path
                d="M0 30 C15 22 25 28 39 20 C52 12 65 20 79 12 C88 7 94 8 100 5"
                fill="none"
                stroke="hsl(var(--accent) / 0.45)"
                strokeWidth="0.26"
                strokeDasharray="1.4 1.6"
              />
              <path
                d="M0 38 C18 33 33 39 48 31 C64 22 77 31 100 22"
                fill="none"
                stroke="hsl(var(--accent-warm) / 0.28)"
                strokeWidth="0.22"
              />
            </svg>
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent',
                a.tint,
              )}
            />
            <div className="space-y-5 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] ring-1',
                      a.ring,
                      a.text,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                      <span>{m.period}</span>
                      <span>/</span>
                      <span className={a.text}>full-time</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg leading-tight text-ink md:text-xl">
                      {m.role}
                      <span className="mx-2 text-ink-faint">/</span>
                      <span className={a.text}>{m.org}</span>
                    </h3>
                  </div>
                </div>

                <div className="hidden gap-3 md:flex">
                  {m.metrics.map((mt) => (
                    <div
                      key={mt.label}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-right"
                    >
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                        {mt.label}
                      </div>
                      <div className={cn('font-display text-sm tabular-nums', a.text)}>
                        {mt.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-relaxed text-ink-muted md:text-base">
                {m.summary}
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {m.focus.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                      Focus
                    </div>
                    <div className="mt-1 text-sm text-ink-muted">{item}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-white/[0.04] pt-4 md:flex-row md:items-center md:justify-between">
                <ul className="flex flex-wrap gap-1.5">
                  {m.stack.map((s) => (
                    <li key={s} className="mono-tag normal-case tracking-wider">
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 md:hidden">
                  {m.metrics.map((mt) => (
                    <div
                      key={mt.label}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1"
                    >
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                        {mt.label}
                      </div>
                      <div className={cn('font-display text-xs tabular-nums', a.text)}>
                        {mt.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.li>
      </ol>
    </section>
  );
}
