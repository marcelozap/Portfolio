'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Boxes,
  CircuitBoard,
  Cpu,
  GitMerge,
  Radio,
  Rocket,
  Workflow,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const CAPABILITIES = [
  {
    icon: CircuitBoard,
    title: 'Operational systems',
    body: 'Enterprise integrations and operational software where correctness and supportability matter.',
  },
  {
    icon: GitMerge,
    title: 'Release & QA automation',
    body: 'Playwright, CI/CD, secrets management, and repeatable validation for high-risk changes.',
  },
  {
    icon: Activity,
    title: 'Data & analytics',
    body: 'Data and reporting workflows that turn operational information into usable decisions.',
  },
  {
    icon: Workflow,
    title: 'Workflow tooling',
    body: 'Power Platform and API-based tools that reduce repetitive work and shorten the path to action.',
  },
  {
    icon: Cpu,
    title: 'Product UI engineering',
    body: 'React, Next.js, motion, and interfaces that feel intentional instead of assembled.',
  },
  {
    icon: Boxes,
    title: 'AI-assisted delivery',
    body: 'Breaking ambiguous legacy work into specs, acceptance criteria, and safer implementation slices.',
  },
  {
    title: 'Rapid prototyping',
    body: 'Throwaway versions are the cheapest tool for clarity. Ship one, learn, redo.',
    icon: Rocket,
  },
  {
    icon: Radio,
    title: 'Creative technology',
    body: 'Audio systems, game feel, and interaction design that keep product work from becoming generic.',
  },
];

const DASHBOARD = [
  { label: 'Enterprise work', value: 'Ops', tone: 'green' },
  { label: 'Data work', value: 'Analytics', tone: 'cyan' },
  { label: 'Build surface', value: 'web / iOS / data', tone: 'violet' },
  { label: 'Working style', value: 'systems + product', tone: 'amber' },
];

const TONE: Record<string, string> = {
  cyan: 'text-accent',
  violet: 'text-accent-cool',
  amber: 'text-accent-warm',
  green: 'text-signal-green',
};

export function Engineering() {
  return (
    <section id="engineering" className="section">
      <SectionHeader
        eyebrow="Capabilities"
        title={
          <>
            Operational depth,
            <br />
            <span className="text-gradient">product range.</span>
          </>
        }
        description="I&rsquo;m strongest where real-world operations and thoughtful software design meet. The same toolkit has to work in enterprise systems, internal platforms, and independent products."
      />

      {/* profile dashboard */}
      <GlassCard className="mt-14" scanline>
        <div className="grid grid-cols-2 divide-x divide-white/[0.04] md:grid-cols-4">
          {DASHBOARD.map((m) => (
            <div key={m.label} className="p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                {m.label}
              </div>
              <div
                className={`mt-2 font-display text-3xl tabular-nums md:text-4xl ${TONE[m.tone]}`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <GlassCard className="h-full transition hover:border-accent/30 hover:shadow-glow">
                <div className="flex h-full flex-col gap-3 p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/30">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="text-sm font-medium text-ink">{c.title}</h3>
                  <p className="text-[13px] leading-relaxed text-ink-muted">{c.body}</p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* faux architecture diagram */}
      <div className="mt-12">
        <ArchitectureDiagram />
      </div>
    </section>
  );
}

function ArchitectureDiagram() {
  const nodes = [
    { id: 'shell', label: 'portfolio / shell', x: 50, y: 16 },
    { id: 'gatekpt', label: 'GATEKPT / audio', x: 18, y: 60 },
    { id: 'green-machine', label: 'GREEN MACHINE / research', x: 50, y: 70 },
    { id: 'rally', label: 'RALLY / tennis app', x: 82, y: 60 },
  ];
  const edges: [string, string][] = [
    ['shell', 'gatekpt'],
    ['shell', 'green-machine'],
    ['shell', 'rally'],
  ];
  const findNode = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <GlassCard scanline>
      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            project map / operating range
          </div>
          <div className="font-mono text-[10px] text-ink-faint">2026</div>
        </div>

        <div className="relative h-72 overflow-hidden rounded-xl border border-white/[0.04] bg-bg/40">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
            <defs>
              <radialGradient id="node-glow" r="0.5" cx="0.5" cy="0.5">
                <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.6" />
                <stop offset="1" stopColor="hsl(188 95% 62%)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {edges.map(([a, b], i) => {
              const A = findNode(a);
              const B = findNode(b);
              return (
                <line
                  key={i}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke="hsl(188 95% 62%)"
                  strokeOpacity="0.4"
                  strokeWidth="0.25"
                  strokeDasharray="0.6 0.8"
                />
              );
            })}
            {nodes.map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="6" fill="url(#node-glow)" opacity="0.7" />
                <circle cx={n.x} cy={n.y} r="1.2" fill="hsl(188 95% 62%)" />
              </g>
            ))}
          </svg>

          {nodes.map((n) => (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 translate-y-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              {n.label}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
