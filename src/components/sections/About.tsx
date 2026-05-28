'use client';

import { motion } from 'framer-motion';
import { Compass, Layers } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FOCUS = [
  {
    icon: Layers,
    title: 'Practical ownership',
    body: 'I like software that has to be clear, reliable, documented, and usable by people doing real work.',
  },
  {
    icon: Compass,
    title: 'Product sensibility',
    body: 'I bring the same care to user experience, interaction, and clarity whether the audience is an operator, teammate, or consumer.',
  },
];

const TAGS = [
  'C# · Azure · QA automation',
  'TypeScript · React · Next.js',
  'Python · data & automation workflows',
  'SwiftUI · SpriteKit · iOS product work',
  'Audio, interaction, and creative tooling',
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
            <span className="text-gradient">Software engineer with range.</span>
          </>
        }
        description="Software engineer based in Miami working across systems, analytics, automation, and independent product builds. XIV is a creative alias used for music and selected releases."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I work best on software that has to be dependable in practice. That can mean internal
              workflows, reporting, automation, validation, or tools that help teams make fewer
              mistakes. I also enjoy helping newer teammates ramp up, documenting clearly, and
              bringing a calm sense of structure when work gets messy.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Outside enterprise delivery, I build products that sharpen a different side of the
              stack: Rally, a premium tennis lifestyle product; GateKPT MusicOS, a creative
              operating system for live-loop artists; and Green Machine, a quantitative research
              platform. That mix keeps my systems thinking, UX instincts, and execution speed sharp.
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
