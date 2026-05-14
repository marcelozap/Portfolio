'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Briefcase,
  Cpu,
  Database,
  GitMerge,
  Headphones,
  Joystick,
  type LucideIcon,
  Radar,
  ShieldCheck,
  Workflow,
  Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

type Kind = 'role' | 'system' | 'project';
type Accent = 'cyan' | 'amber' | 'violet' | 'green';

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
  amber: {
    dot: 'bg-accent-warm shadow-[0_0_10px_hsl(28_95%_62%)]',
    text: 'text-accent-warm',
    ring: 'ring-accent-warm/30',
    tint: 'from-accent-warm/10',
  },
  violet: {
    dot: 'bg-accent-cool shadow-[0_0_10px_hsl(268_80%_70%)]',
    text: 'text-accent-cool',
    ring: 'ring-accent-cool/30',
    tint: 'from-accent-cool/10',
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
    id: 'devops',
    period: '2023 — present',
    role: 'DevOps · Site Reliability Practice',
    org: 'XIV_OS',
    kind: 'system',
    accent: 'cyan',
    icon: GitMerge,
    summary:
      'A self-directed DevOps track built across every project in the XIV_OS portfolio. The goal: make personal infrastructure as repeatable and observable as a small startup’s, so individual focus is never wasted on yak-shaving.',
    highlights: [
      'Standardized GitHub Actions matrices (Node 20 & 22, lint · typecheck · build) across repositories.',
      'Container images for backends, deployed to single-box hosts and Vercel functions with parity.',
      'Husky + lint-staged hooks enforce Prettier and ESLint at commit-time, killing format drift.',
      'Centralized environment management — `.env.example` first, secrets in Vercel and platform vaults only.',
      'Runtime observability via structured logging hooks and uptime probes on every public surface.',
    ],
    stack: ['GitHub Actions', 'Docker', 'Vercel', 'Husky', 'Bash', 'OpenTelemetry'],
    metrics: [
      { label: 'Repos under CI', value: '6+' },
      { label: 'Deploy targets', value: '3' },
      { label: 'Mean PR → prod', value: '< 10m' },
    ],
  },
  {
    id: 'publix-automation',
    period: '2024 — present',
    role: 'Automation Lead · Operations',
    org: 'Publix',
    kind: 'role',
    accent: 'green',
    icon: Workflow,
    summary:
      'Stepped beyond the standard operations role to lead automation initiatives across the team. The job is operations on the surface and process engineering underneath: turning repeated handoffs, inventory checks, and customer-flow steps into structured systems the whole team can rely on.',
    highlights: [
      'Authored standard operating procedures for shift handoffs that became reference material across the team.',
      'Built lightweight tracking sheets and scripts to automate inventory reconciliation, eliminating a daily manual ritual.',
      'Designed a customer-flow checklist used during peak hours to keep wait times predictable.',
      'Onboarded new team members to the automation playbook, with measurable ramp-up time savings.',
      'Bridged the work between the floor and back-of-house — operations becoming a first-class engineering surface.',
    ],
    stack: ['SOPs', 'Process design', 'Spreadsheets-as-systems', 'Team enablement'],
    metrics: [
      { label: 'Hours saved / wk', value: '6–8' },
      { label: 'SOPs authored', value: '5' },
      { label: 'Tenure', value: '2+ yrs' },
    ],
  },
  {
    id: 'data-lake',
    period: '2025',
    role: 'Data Engineer · Migration Lead',
    org: 'Data Lake Modernization',
    kind: 'project',
    accent: 'violet',
    icon: Database,
    summary:
      'Led the modernization of a multi-source data-lake transfer pipeline. The legacy stack moved files nightly with brittle SFTP scripts and zero schema enforcement; the new system streams events, validates schemas at ingest, and exposes a queryable surface in minutes instead of hours.',
    highlights: [
      'Replaced ad-hoc SFTP file movers with an event-driven ingestion architecture using a managed object store + CDC.',
      'Introduced schema-on-write contracts (Parquet + Iceberg) so consumers stop chasing column rename drift.',
      'Backfilled three years of historical data into the new lake with idempotent jobs and full lineage.',
      'Built a Python orchestration layer with deterministic retries and structured failure summaries.',
      'Cut end-to-end transfer latency by an order of magnitude and made the pipeline observable for the first time.',
    ],
    stack: ['Python', 'Parquet', 'Apache Iceberg', 'Airflow', 'DuckDB', 'S3'],
    metrics: [
      { label: 'Latency', value: '↓ 10×' },
      { label: 'Sources unified', value: '12' },
      { label: 'Schema breaks', value: '0 / qtr' },
    ],
  },
  {
    id: 'green-machine',
    period: '2024 — present',
    role: 'Engineer · Distributed Trading Command Center',
    org: 'GREEN MACHINE',
    kind: 'project',
    accent: 'green',
    icon: Radar,
    summary:
      'Designed and built Green Machine — a distributed command center for SPY options analytics with real-time alerts. A Mac front-end talks to a Windows host over WebSockets through a strict handshake protocol, surfaces six factors per trade idea, and exposes an explicit kill switch for the operator.',
    highlights: [
      'Defined a versioned WebSocket API contract between the Mac dashboard and the Windows trading host.',
      'Built the Mac Control Deck: kill-switch, handshake, and six-factor tiles in a calm, glassy UI.',
      'FastAPI backend with Telegram alerting on threshold breaches and a `/ws/feed` broadcast channel.',
      'Vite-proxied dev experience so a single command boots backend + UI in lockstep.',
      'Strict separation of concerns: signal generation runs on the trading host; the Mac is operator UX only.',
    ],
    stack: ['React', 'Vite', 'FastAPI', 'WebSockets', 'Telegram API', 'Tailwind'],
    metrics: [
      { label: 'Hosts in mesh', value: '2' },
      { label: 'Factors / signal', value: '6' },
      { label: 'Kill-switch hops', value: '1' },
    ],
  },
  {
    id: 'gatekpt',
    period: '2025 — present',
    role: 'Engineer · Intelligent Audio OS',
    org: 'GATEKPT',
    kind: 'project',
    accent: 'cyan',
    icon: Headphones,
    summary:
      'Engineering GATEKPT — an intelligent operating system for audio production. A multi-threaded chat layer remembers the long arc of a record; a docked plugin-style UI runs alongside the DAW; the entire shell is audio-reactive so the interface breathes with the track.',
    highlights: [
      'Designed the threaded-session model so every project keeps its own conversation tree.',
      'Implemented callback memory — the assistant recalls earlier creative decisions across sessions.',
      'Built a Web Audio analyzer that drives UI motion (waveform overlays, transient flashes) in real time.',
      'Glass-UI plugin panels that snap to the side of the DAW, modeled on modern plugin chrome.',
      'Target latency floor of < 80ms for the interaction loop, validated with synthetic load tests.',
    ],
    stack: ['TypeScript', 'Web Audio', 'LLM', 'Tauri', 'React', 'WebGL'],
    metrics: [
      { label: 'Latency target', value: '< 80ms' },
      { label: 'DAW bridges', value: '3' },
      { label: 'Active threads', value: '∞' },
    ],
  },
  {
    id: 'rally',
    period: '2026 — building',
    role: 'Solo Designer · Cinematic Sport Game',
    org: 'RALLY',
    kind: 'project',
    accent: 'amber',
    icon: Joystick,
    summary:
      'Building RALLY — a tennis-inspired flow-state game where movement, focus, and timing replace power and spectacle. A small, fully-owned project: design, code, shader work, and audio direction all run through one operator.',
    highlights: [
      'Movement-first input model: placement and timing over button-mashing.',
      'Flow-state HUD that fades the deeper the rally goes — UI as a reward, not a requirement.',
      'Six neon court archetypes, each with its own physics and sound design treatment.',
      'Progression unlocks environmental layers (light, weather, crowd) earned through high-quality points.',
      '120fps frame target with a budget-aware render path for older hardware.',
    ],
    stack: ['Unity', 'C#', 'Shader Graph', 'Wwise', 'FMOD'],
    metrics: [
      { label: 'Court archetypes', value: '6' },
      { label: 'Frame target', value: '120fps' },
      { label: 'Audio layers', value: '14' },
    ],
  },
];

const KIND_LABEL: Record<Kind, string> = {
  role: 'role',
  system: 'system',
  project: 'project',
};

export function Experience() {
  return (
    <section id="experience" className="section">
      <SectionHeader
        eyebrow="Experience · the long arc"
        title={
          <>
            Operations, automation,
            <br />
            <span className="text-gradient">data, and the projects.</span>
          </>
        }
        description="Six tracks running in parallel — a full-time operations role, a self-directed DevOps practice, an enterprise data engineering migration, and three multi-disciplinary projects that anchor the XIV_OS portfolio."
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
                  {/* header row */}
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

                  {/* highlights */}
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

                  {/* stack + mobile metrics */}
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

      {/* legend strip */}
      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-2">
          <Briefcase className="size-3" /> role · operations
        </span>
        <span className="inline-flex items-center gap-2">
          <Cpu className="size-3" /> system · infrastructure
        </span>
        <span className="inline-flex items-center gap-2">
          <Zap className="size-3" /> project · creative engineering
        </span>
        <span className="inline-flex items-center gap-2">
          <Activity className="size-3" /> all signals live
        </span>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="size-3 text-signal-green" /> always building
        </span>
      </div>
    </section>
  );
}
