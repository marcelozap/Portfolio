'use client';

import { motion } from 'framer-motion';
import { Disc3, Guitar, Headphones, Moon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const TRACKS = [
  { title: 'Late · Empty Studio', length: '3:21', tape: 'A1' },
  { title: 'Bass · 2am Drift', length: '4:08', tape: 'A2' },
  { title: 'Cover · Untitled', length: '2:47', tape: 'B1' },
  { title: 'Sketch · Headlights', length: '1:54', tape: 'B2' },
];

const BARS = Array.from(
  { length: 64 },
  (_, i) => Math.abs(Math.sin(i * 0.4)) * 0.7 + Math.abs(Math.cos(i * 0.13)) * 0.3,
);

export function Music() {
  return (
    <section id="music" className="section">
      <SectionHeader
        eyebrow="Music · creative systems"
        title={
          <>
            Bedroom records,
            <br />
            <span className="text-gradient">dim-room electricity.</span>
          </>
        }
        description="Multi-instrumentalist with a guitar-first hand and bass-leaning ear. Songs assembled in small rooms, late, with cassette aesthetics and tape noise."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7" scanline>
          <div className="space-y-6 p-7 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-tag">
                <Disc3 className="size-3" />
                bedroom covers by XIV
              </span>
              <span className="mono-tag">
                <Moon className="size-3" />
                nocturnal mix
              </span>
            </div>

            <p className="max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Atmospheric composition centered on guitar and bass — long sustains, tape saturation,
              fingers-on-strings reality. The music sits in the same emotional register as the rest
              of XIV_OS: quiet, intentional, built in the dark hours.
            </p>

            {/* waveform */}
            <div className="relative h-28 rounded-xl border border-white/[0.06] bg-bg/40 p-3">
              <div className="grid-bg absolute inset-0 opacity-30" />
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
                tape · A side
              </div>
            </div>

            <ul className="divide-y divide-white/[0.04] overflow-hidden rounded-xl border border-white/[0.06]">
              {TRACKS.map((t, i) => (
                <motion.li
                  key={t.title}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-center gap-4 px-4 py-3 text-sm transition hover:bg-white/[0.03]"
                >
                  <span className="font-mono text-[11px] tabular-nums text-accent-warm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-ink">{t.title}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{t.tape}</span>
                  <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                    {t.length}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:col-span-5">
          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-warm/10 text-accent-warm ring-1 ring-accent-warm/30">
                <Guitar className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">Instruments in rotation</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Electric & acoustic guitar, four-string bass, layered pedals, small synths for
                texture. The signal chain matters as much as the song.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/30">
                <Headphones className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">The bedroom studio</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Dim lights, headphones, an interface, and time. Recordings are intimate by design —
                no spectacle, just the actual sound of a quiet room.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-3 p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-cool/10 text-accent-cool ring-1 ring-accent-cool/30">
                <Moon className="size-4" />
              </span>
              <h3 className="text-base font-medium text-ink">Late-night composition</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Most ideas land between midnight and 4am, when the world is still enough to hear the
                small parts of a song.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
