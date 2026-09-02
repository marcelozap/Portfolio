'use client';

import { motion } from 'framer-motion';
import { Compass, Music2, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FOCUS = [
  {
    icon: Compass,
    title: 'Trading as art',
    body: 'I look at trading as a living, unpredictable movement shaped by data, attention, and every person who participates.',
  },
  {
    icon: Music2,
    title: 'One song a day',
    body: 'Music is another language I use to make, listen, experiment, and stay in motion.',
  },
  {
    icon: Sparkles,
    title: 'Back it up',
    body: 'I back the practice with software, research, data, and technology that can survive contact with the real world.',
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
            <span className="text-gradient">Trading as art. One song a day.</span>
          </>
        }
        description="An independent company for trading, research, technology, and creative projects."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <div className="space-y-5 p-7 md:p-9">
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I look at trading like art: a living, unpredictable movement shaped by data,
              attention, and every person inside it.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I make one song a day. Music is another language I use to observe, experiment, and
              stay in motion.
            </p>
            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              I back both with software engineering, research, data workflows, and AI systems. XIV
              is where the practice becomes something I can build on.
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
