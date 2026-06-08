'use client';

import { motion } from 'framer-motion';
import { Disc3, Guitar, Headphones } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const TRACK = {
  title: 'XIV Ambient',
};

const BARS = Array.from(
  { length: 64 },
  (_, i) => Math.abs(Math.sin(i * 0.4)) * 0.7 + Math.abs(Math.cos(i * 0.13)) * 0.3,
);

export function Music() {
  return (
    <section id="music" className="section">
      <SectionHeader
        eyebrow="Sound"
        title={
          <>
            Guitar,
            <br />
            <span className="text-gradient">space, feel.</span>
          </>
        }
        description="Small audio sketches. If something fits a project, contact me."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7" scanline>
          <div className="space-y-6 p-7 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-tag">
                <Disc3 className="size-3" />
                audio sketch
              </span>
              <span className="mono-tag normal-case tracking-wider">M. Zapata</span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
              <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                credit
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-base">
                Audio on this site was made by Marcelo Zapata. For use or collaboration, contact
                me.
              </p>
            </div>

            <p className="max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Guitar, bass, and light texture. Kept simple.
            </p>

            <div className="relative h-28 overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(180deg,hsl(var(--bg-elevated)/0.72),hsl(var(--bg)/0.88))] p-3">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <svg
                viewBox="0 0 100 42"
                className="absolute inset-0 size-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 28 C12 16 21 30 34 18 C47 7 57 25 69 16 C82 6 90 18 100 10"
                  fill="none"
                  stroke="hsl(var(--accent-cool) / 0.34)"
                  strokeWidth="0.3"
                />
                <path
                  d="M0 33 C17 25 28 34 43 27 C58 20 70 27 86 18 C94 14 98 13 100 12"
                  fill="none"
                  stroke="hsl(var(--accent-warm) / 0.34)"
                  strokeDasharray="1.4 1.6"
                  strokeWidth="0.28"
                />
              </svg>
              <div className="relative flex h-full items-center justify-between gap-[3px]">
                {BARS.map((b, i) => (
                  <motion.span
                    key={i}
                    className="block w-[3px] rounded-full bg-accent-warm/80"
                    initial={{ height: 4 }}
                    whileInView={{
                      height: [4, 10 + b * 70, 4],
                      opacity: [0.3, 1, 0.3],
                    }}
                    viewport={{ once: false }}
                    transition={{
                      duration: 1.8 + b * 0.6,
                      repeat: Infinity,
                      delay: i * 0.015,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <div className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                waveform
              </div>
            </div>

            <ul className="divide-y divide-white/[0.04] overflow-hidden rounded-xl border border-white/[0.06]">
              <motion.li
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 px-4 py-3 text-sm transition hover:bg-white/[0.03]"
              >
                <span className="font-mono text-[11px] tabular-nums text-accent-warm">01</span>
                <span className="flex-1 text-ink">{TRACK.title}</span>
                <span className="font-mono text-[10px] text-ink-faint">amb.</span>
                <span className="font-mono text-[11px] tabular-nums text-ink-muted">-</span>
              </motion.li>
            </ul>
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:col-span-5">
          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-warm/10 text-accent-warm ring-1 ring-accent-warm/30">
                <Guitar className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">Instruments</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Guitar, bass, and keys when the part needs it.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/30">
                <Headphones className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">Recording</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Simple home recording and rough ideas.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-cool/10 text-accent-cool ring-1 ring-accent-cool/30">
                <Disc3 className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">Contact</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                If a sound fits something, contact me.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
