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
  highlights: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
}

const ACCENT: Record<
  Accent,
  { dot: string; text: string; ring: string; tint: string }
> = {
  green: {
    dot: 'bg-signal-green shadow-[0_0_10px_hsl(152_78%_52%)]',
    text: 'text-signal-green',
    ring: 'ring-signal-green/30',
    tint: 'from-signal-green/10',
  },
};

/** One role, LinkedIn-safe timeline by phase (2023–2026). */
const PUBLIX: Milestone = {
  id: 'publix',
  period: '2022 — present',
  role: 'Software Engineer',
  org: 'Publix',
  accent: 'green',
  icon: Briefcase,
  summary:
    'Software engineer building and supporting warehouse, pharmacy, analytics, and internal tooling systems across a large operational footprint. Work spans legacy modernization, QA automation, data pipelines, workflow software, incident support, and team enablement.',
  highlights: [
    'Led QA automation for conveyor and warehouse-control modernization on a C#-heavy stack, building Playwright coverage, pipeline execution, and secure test orchestration with Azure Key Vault.',
    'Modernizing legacy warehouse inventory batch jobs and system integrations by translating brittle behavior into smaller specs, regression-minded rebuilds, and clearer operational contracts.',
    'Built governed data lake and reporting workflows for DSCSA pharmacy tracing across 12 warehouse locations, using Snowflake, Databricks, and Power BI semantic models to improve visibility and decision support.',
    'Delivered Power Apps, Power Automate, and API-based workflow tooling that removed hundreds of hours of manual reconciliation and improved how warehouse and vendor teams handle file exceptions.',
    'Served as lead support engineer for controlled-substances software and file balance monitoring across 40+ warehouses, where accuracy, auditability, and calm response under pressure matter.',
    'Mentored newer teammates on testing discipline, documentation, CI/CD habits, and practical AI-assisted delivery patterns, drawing on earlier experience as a STEM instructor.',
  ],
  stack: [
    'C#',
    'Azure',
    'Playwright',
    'Azure Key Vault',
    'Snowflake',
    'Databricks',
    'Power BI',
    'Power Apps',
    'Power Automate',
    'REST APIs',
    'CI/CD',
  ],
  metrics: [
    { label: 'Warehouses supported', value: '40+' },
    { label: 'DSCSA locations', value: '12' },
    { label: 'Delivery lanes', value: 'QA · data · ops' },
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
            Software Engineer,
            <br />
            <span className="text-gradient">Publix.</span>
          </>
        }
        description="Warehouse operations, regulated systems, analytics, workflow tooling, and modernization work delivered across a large distribution environment."
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
                      <span>·</span>
                      <span className={a.text}>full-time</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg leading-tight text-ink md:text-xl">
                      {m.role}
                      <span className="mx-2 text-ink-faint">·</span>
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

              <ul className="grid gap-2 md:grid-cols-1">
                {m.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-[13px] leading-relaxed text-ink-muted"
                  >
                    <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', a.dot)} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

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
