'use client';

import { motion } from 'framer-motion';
import { Compass, Layers } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FOCUS = [
  {
    icon: Layers,
    title: 'Systems & product',
    body: 'Reliable internals, clear boundaries, and interfaces people can trust.',
  },
  {
    icon: Compass,
    title: 'Craft',
    body: 'Thoughtful UX on top of solid engineering — especially where tools get heavy use.',
  },
];

const TAGS = [
  'TypeScript · React · Next.js',
  'Python · data pipelines',
  'Markets & analytics',
  'Audio & creative tools',
  'Game prototypes',
];

export function About() {
  return (
    <section id="about" className="section">
      <SectionHeader
        eyebrow="About"
        title={
          <>
            Marcelo Zapata
            <br />
            <span className="text-gradient">Software engineer.</span>
          </>
        }
        description="Full-time software engineer at Publix. Outside formal role: independent work in software for music, markets, and games. Creative releases are sometimes credited as XIV."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              The same standard applies to internal systems and personal projects: correct behavior
              first, maintainability second, presentation last.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Side work includes Green Machine—a discipline-first stack unifying automated markets research
              with risk-aware orchestration—as well as audio tooling (GATEKPT) and a tennis game concept
              (Rally). Music on this site is original composition.
            </p>
            <div className="pt-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                focus areas
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <li key={tag} className="mono-tag normal-case tracking-wider">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:col-span-5">
          {FOCUS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <GlassCard className="h-full">
                  <div className="flex h-full flex-col gap-2 p-5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/30">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="text-base font-medium text-ink">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{b.body}</p>
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
