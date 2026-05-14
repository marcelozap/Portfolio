'use client';

import { motion } from 'framer-motion';
import { Briefcase, GitMerge, type LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

type Kind = 'role' | 'system';
type Accent = 'cyan' | 'green';

interface Milestone {
  id: string;
  period: string;
  role: string;
  org: string;
  kind: Kind;
  accent: Accent;
  icon: LucideIcon;
  summary: string;
  highlights: string[];
  stack: string[];
  metrics: { label: string; value: string }[];
}

const ACCENT: Record<Accent, { dot: string; text: string; ring: string; tint: string }> = {
  cyan: {
    dot: 'bg-accent shadow-[0_0_10px_hsl(var(--accent-glow))]',
    text: 'text-accent',
    ring: 'ring-accent/30',
    tint: 'from-accent/10',
  },
  green: {
    dot: 'bg-signal-green shadow-[0_0_10px_hsl(152_78%_52%)]',
    text: 'text-signal-green',
    ring: 'ring-signal-green/30',
    tint: 'from-signal-green/10',
  },
};

const TIMELINE: Milestone[] = [
  {
    id: 'publix',
    period: '2022 — present',
    role: 'Software Engineer',
    org: 'Publix',
    kind: 'role',
    accent: 'green',
    icon: Briefcase,
    summary:
      'Full-time software engineer shipping internal systems for stores and support teams. One role, multiple initiatives — automation, reliability, and data work — with the same bar for quality as production customer software.',
    highlights: [
      'Automation & internal tooling: eliminated recurring manual workflows with scripts, lightweight apps, and clear ownership so improvements survive handoffs.',
      'Data / platform delivery: modernized ingestion paths with stronger contracts (Parquet / Iceberg where applicable), idempotent jobs, retries, and lineage so analysts trust the lake.',
      'Operational resilience: wrote and socialized runbooks, dashboards, and playbooks that reduce on-call thrash and speed up incident recovery.',
      'Cross-functional delivery: worked with store operations and back-office teams to translate floor problems into maintainable software.',
      'Mentoring & consistency: raised the baseline for reviews, testing discipline, and release hygiene within the team’s constraints.',
    ],
    stack: ['TypeScript', 'Python', 'SQL', 'ETL / orchestration', 'Git', 'Observability'],
    metrics: [
      { label: 'Role', value: 'SWE' },
      { label: 'Focus', value: 'Internal' },
      { label: 'Stack', value: 'Polyglot' },
    ],
  },
  {
    id: 'practice',
    period: '2023 — present',
    role: 'Engineering practice',
    org: 'Independent · portfolio',
    kind: 'system',
    accent: 'cyan',
    icon: GitMerge,
    summary:
      'How side projects and open-source-style rigor stay aligned: reproducible builds, CI on every push, containers when the problem calls for it, and production deploys that are boring on purpose.',
    highlights: [
      'GitHub Actions matrices across Node 20 / 22 with lint, typecheck, and build gates.',
      'Vercel-first shipping for frontends; FastAPI / WebSocket services containerized when needed.',
      'Husky + lint-staged to keep formatting and static analysis non-debatable at commit time.',
      'Structured logging, basic SLO thinking, and kill-switches on anything market-facing.',
    ],
    stack: ['GitHub Actions', 'Docker', 'Vercel', 'Husky', 'Prettier', 'ESLint'],
    metrics: [
      { label: 'CI', value: 'Matrix' },
      { label: 'Deploy', value: '< 10m' },
    ],
  },
];

const KIND_LABEL: Record<Kind, string> = {
  role: 'full-time',
  system: 'practice',
};

export function Experience() {
  return (
    <section id="experience" className="section">
      <SectionHeader
        eyebrow="Experience"
        title={
          <>
            Software engineering
            <br />
            <span className="text-gradient">at work and in the lab.</span>
          </>
        }
        description="Full-time software engineer at Publix — one role with multiple delivery threads. Side projects (music, markets, games) live under Projects; this section is the professional spine."
      />

      <ol className="relative mt-14 space-y-8 border-l border-white/[0.06] pl-8 md:pl-12">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent/40 via-accent-cool/20 to-transparent"
        />

        {TIMELINE.map((m, i) => {
          const a = ACCENT[m.accent];
          const Icon = m.icon;
          return (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
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
                          <span className={a.text}>{KIND_LABEL[m.kind]}</span>
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

                  <ul className="grid gap-2 md:grid-cols-2">
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
          );
        })}
      </ol>
    </section>
  );
}
