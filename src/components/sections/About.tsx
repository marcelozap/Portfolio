'use client';

import { motion } from 'framer-motion';
import { Compass, Music2, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FOCUS = [
  {
    icon: Compass,
    title: 'The market as art',
    body: 'Green Machine is a place to study movement, uncertainty, risk, and the people who give a market its shape.',
  },
  {
    icon: Music2,
    title: 'One song a day',
    body: 'Music is another language: a daily practice for making, listening, measuring, and turning signal into feeling.',
  },
  {
    icon: Sparkles,
    title: 'Technology with a point of view',
    body: 'AI, software, and data are useful when they make room for better attention, better questions, and more human work.',
  },
];

const TAGS = [
  'Trading as art',
  'Market research',
  'AI systems',
  'Audio ML',
  'Movement',
  'Writing',
  'QA automation',
  'Data workflows',
];

export function About() {
  return (
    <section id="about" className="section">
      <SectionHeader
        eyebrow="About XIV"
        title={
          <>
            Founder of XIV.
            <br />
            <span className="text-gradient">Trading, research, technology, and creative work.</span>
          </>
        }
        description="A personal company for keeping the work connected while it is still becoming."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I see the market as an art form: a living, unpredictable system shaped by data,
              attention, and every person inside it. Green Machine is where I study that movement
              without pretending uncertainty is a flaw to hide.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Music is another language. MaloSound turns one song at a time into audio analysis,
              visual experiments, and creative work. Rally carries the same attention into movement,
              practice, and memory.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              My background in software engineering, QA automation, data workflows, and AI-assisted
              delivery taught me to build with structure, evidence, and respect for what can fail.
              XIV is where those disciplines meet the things I care about.
            </p>
            <div className="pt-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                current language
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
          {FOCUS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <GlassCard className="h-full">
                  <div className="flex h-full flex-col gap-2 p-5">
                    <span className="flex size-9 items-center justify-center rounded-[2px] bg-accent/10 text-accent ring-1 ring-accent/30">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="text-base font-medium text-ink">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
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
