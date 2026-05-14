'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface Milestone {
  id: string;
  period: string;
  role: string;
  org: string;
  description: string;
  signals: { icon: typeof Clock; label: string }[];
}

const TIMELINE: Milestone[] = [
  {
    id: 'publix',
    period: '2022 — present',
    role: 'Operations · Customer Experience',
    org: 'Publix',
    description:
      'Frontline operations work in a high-volume retail environment. Hundreds of micro-decisions per shift train the same muscle that good software requires: composure, throughput, and customer empathy. The job is proof of discipline; the rest of the night is the lab.',
    signals: [
      { icon: ShieldCheck, label: 'Composure under pressure' },
      { icon: Users, label: 'Customer interaction at volume' },
      { icon: Clock, label: 'Strict time management' },
      { icon: Sparkles, label: 'Consistency over years' },
    ],
  },
  {
    id: 'independent',
    period: '2023 — present',
    role: 'Independent · Software & Creative Systems',
    org: 'XIV_OS',
    description:
      'Self-directed development of tools at the intersection of engineering, music, and markets. Nights and weekends compounded into a portfolio of systems: GATEKPT, MONEY MACHINE, and RALLY — each a different angle on the same idea of disciplined creation.',
    signals: [
      { icon: Sparkles, label: 'Three multi-disciplinary projects' },
      { icon: Clock, label: 'Long-arc focus across years' },
      { icon: ShieldCheck, label: 'Shipping in the margins' },
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="section">
      <SectionHeader
        eyebrow="Experience"
        title={
          <>
            Proof of discipline,
            <br />
            <span className="text-gradient">compounded over time.</span>
          </>
        }
        description="Two parallel tracks. Real-world operations and independent software development — same operator, same principles."
      />

      <ol className="relative mt-14 space-y-10 border-l border-white/[0.06] pl-8 md:pl-12">
        {/* vertical glow indicator following the timeline */}
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent/40 via-transparent to-transparent"
        />

        {TIMELINE.map((m, i) => (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            <span className="absolute -left-[39px] top-2 flex size-4 items-center justify-center md:-left-[55px]">
              <span className="absolute inset-0 animate-pulse-glow rounded-full bg-accent/40 blur-md" />
              <span className="relative size-2 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent-glow))]" />
            </span>

            <GlassCard>
              <div className="space-y-4 p-6 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                      {m.period}
                    </div>
                    <h3 className="mt-1 font-display text-xl text-ink md:text-2xl">
                      {m.role}
                      <span className="mx-2 text-ink-faint">·</span>
                      <span className="text-accent">{m.org}</span>
                    </h3>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-relaxed text-ink-muted md:text-base">
                  {m.description}
                </p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {m.signals.map((s) => {
                    const Icon = s.icon;
                    return (
                      <li
                        key={s.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-ink-muted"
                      >
                        <Icon className="size-3 text-accent/80" />
                        {s.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </GlassCard>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
