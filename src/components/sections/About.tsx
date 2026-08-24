'use client';

import { motion } from 'framer-motion';
import { Bot, Compass, Layers } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FOCUS = [
  {
    icon: Layers,
    title: 'Role-based systems',
    body: 'Different jobs need different context, files, decisions, and review steps. The system should match the work.',
  },
  {
    icon: Bot,
    title: 'Creator systems',
    body: 'My current work turns songs into structured data, then maps that data into catalog search, review surfaces, and movement-driven visuals.',
  },
  {
    icon: Compass,
    title: 'Trust surface',
    body: 'The goal is not more AI everywhere. The goal is lower resistance, clearer handoffs, and tools people can trust.',
  },
];

const TAGS = [
  'Role-based AI systems',
  'LLM workflows',
  'Audio-visual ML',
  'Creative technology',
  'QA automation',
  'Data validation',
  'Workflow infrastructure',
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
            <span className="text-gradient">AI systems designed around the work.</span>
          </>
        }
        description="Business workflow, software engineering, automation, machine learning, and trusted delivery systems."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I build at the intersection of technology, music, and movement. My work turns messy
              inputs into structured systems: workflows, data contracts, review surfaces, and tools
              that people can actually use.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I come from enterprise development environments, where software has to survive real
              teams, real constraints, and real production failure modes. That shaped how I build:
              with structure, proof, reproducibility, and attention to how systems fail.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Now I am focused on audio-visual ML systems, creative technology, and role-based AI
              infrastructure: turning songs into structured data, mapping sound into movement, and
              building tools that help people create with more clarity and control.
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
                    <span className="flex size-9 items-center justify-center rounded-[2px] bg-accent/10 text-accent ring-1 ring-accent/30">
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
