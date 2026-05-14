'use client';

import { motion } from 'framer-motion';
import { Orbit, Radio, Waves } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SpacemanScene } from './SpacemanScene';

const TELEMETRY = [
  { icon: Orbit, label: 'orbit', value: 'stable' },
  { icon: Radio, label: 'signal', value: 'clear' },
  { icon: Waves, label: 'gravity', value: '0.00 g' },
];

/**
 * The Mirror — a single-frame moment: a spaceman with an electric guitar,
 * seen from behind, reflected in a dark mirror below. It's the emotional
 * thesis statement of XIV_OS: the same operator, reflected back, drifting
 * but tethered.
 */
export function Mirror() {
  return (
    <section id="mirror" className="section">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-8 lg:col-span-5">
          <SectionHeader
            eyebrow="Scene · the mirror"
            title={
              <>
                Drifting,
                <br />
                <span className="text-gradient">but tethered.</span>
              </>
            }
            description="Back to the room, electric guitar slung across the suit, floating in the slow gravity of a 3am studio. The mirror is what shows up when you've been iterating long enough to recognize yourself."
          />

          <div className="grid grid-cols-3 gap-3">
            {TELEMETRY.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <GlassCard className="h-full">
                    <div className="flex flex-col gap-1 p-4">
                      <Icon className="size-4 text-accent" />
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                        {t.label}
                      </div>
                      <div className="font-display text-sm text-ink">{t.value}</div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-ink-muted md:text-base">
            <p>
              The scene runs at zero-g — every part of the figure drifts on its own slow clock. The
              tether pulses, the helmet halo breathes, dust floats in lazy figure-eights.
            </p>
            <p>
              Move the pointer and the whole frame tilts; the mirror tilts the opposite way. The
              reflection isn&rsquo;t a copy. It&rsquo;s a record of how far the operator has drifted
              from where they started.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <SpacemanScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
