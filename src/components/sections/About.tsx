'use client';

import { motion } from 'framer-motion';
import { Compass, GitBranch, Layers, Moon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const BELIEFS = [
  {
    icon: GitBranch,
    title: 'Iteration is the work.',
    body: 'Mastery is a byproduct of versioning yourself for long enough.',
  },
  {
    icon: Layers,
    title: 'Systems create freedom.',
    body: 'Build the loop once, then live inside it. Discipline compounds.',
  },
  {
    icon: Compass,
    title: 'Real world matters.',
    body: 'Operations under pressure makes for sharper software engineers.',
  },
  {
    icon: Moon,
    title: 'The dark hours.',
    body: 'Late-night focus is where the best ideas actually land.',
  },
];

const INTERESTS = [
  'DevOps',
  'Automation',
  'Software architecture',
  'UI / UX experimentation',
  'Interactive experiences',
  'Trading systems',
  'Music technology',
  'Immersive digital environments',
];

export function About() {
  return (
    <section id="about" className="section">
      <SectionHeader
        eyebrow="About"
        title={
          <>
            A systems-oriented operator
            <br />
            <span className="text-gradient">balancing discipline & invention.</span>
          </>
        }
        description="XIV is a developer and creative technologist building tools, experiences, and ideas at the intersection of engineering, markets, and music — while holding down full-time operations work in the real world."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I work full-time at Publix while independently developing technical systems and
              creative software. The two lives feed each other: operations sharpen reliability and
              timing; software gives the work a second life that compounds long after the shift
              ends.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I think in systems. I&rsquo;m most alive at the seam between calm engineering and
              emotional design — building things that feel as considered as they are precise.
            </p>

            <div className="pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                deep interests
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {INTERESTS.map((tag) => (
                  <li key={tag} className="mono-tag normal-case tracking-wider">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:col-span-5 lg:grid-cols-2">
          {BELIEFS.map((b, i) => {
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
