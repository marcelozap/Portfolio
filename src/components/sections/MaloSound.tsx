'use client';

import { motion } from 'framer-motion';
import { Cable, Code2, Mic2, SlidersHorizontal } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const SOUND_LAYERS = [
  {
    icon: Mic2,
    title: 'Voice',
    body: 'Raw vocal ideas, take repair, melody fragments, and performance moments.',
  },
  {
    icon: Cable,
    title: 'Signal chain',
    body: 'Bass, keys, pedals, tones, DAW routing, and playable sound decisions.',
  },
  {
    icon: Code2,
    title: 'Live code',
    body: 'Python and control experiments for shaping sound, visuals, and workflow.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Performance system',
    body: 'Short clips, reactive visuals, live setups, and personal sound identity.',
  },
];

const WAVE_BARS = Array.from({ length: 56 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 0.42));
  const b = Math.abs(Math.cos(i * 0.17));
  return 10 + (a * 0.72 + b * 0.28) * 64;
});

export function MaloSound() {
  return (
    <section id="malosound" className="section">
      <SectionHeader
        eyebrow="MaloSound"
        title={
          <>
            Music technology.
            <br />
            <span className="text-gradient">Personal sound system.</span>
          </>
        }
        description="Voice, bass, pedals, Python, DAW recording, and live performance turned into one artist-tech identity."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7" scanline>
          <div className="space-y-7 p-7 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-tag">artist project</span>
              <span className="mono-tag">music-tech lab</span>
              <span className="mono-tag">live performance</span>
            </div>

            <p className="max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
              MaloSound is where I turn code, voice, bass, pedals, and live performance into one
              personal sound system.
            </p>

            <div className="border border-line bg-bg/55 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  site score
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  Victoria 9:08 PM
                </span>
              </div>

              <div className="mb-4 flex h-24 items-center gap-[3px] overflow-hidden border border-line bg-white/[0.015] px-3">
                {WAVE_BARS.map((height, i) => (
                  <motion.span
                    key={i}
                    className="block w-[3px] bg-accent/70"
                    style={{ height }}
                    initial={{ opacity: 0.38 }}
                    whileInView={{ opacity: [0.38, 0.95, 0.38] }}
                    viewport={{ once: false }}
                    transition={{
                      duration: 1.8 + (i % 7) * 0.12,
                      repeat: Infinity,
                      delay: i * 0.012,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-ink-muted">
                This site is scored by original MaloSound audio. Use the player at the bottom of the
                screen to keep the track running while you browse.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:col-span-5">
          {SOUND_LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <GlassCard>
                  <div className="flex gap-4 p-5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[2px] border border-line bg-white/[0.025] text-accent">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-medium text-ink">{layer.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{layer.body}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
