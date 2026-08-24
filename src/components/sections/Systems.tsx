'use client';

import { motion } from 'framer-motion';
import { BookOpen, Boxes, Megaphone, ShieldCheck, UsersRound } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const LANES = [
  {
    icon: Boxes,
    title: 'Ecommerce',
    text: 'Product context, intake, fulfillment, support, returns, follow-up, and operations.',
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    text: 'Brand context, campaigns, content planning, asset review, and channel handoff.',
  },
  {
    icon: BookOpen,
    title: 'Teaching',
    text: 'Lessons, examples, practice, explanation, notes, and student support.',
  },
  {
    icon: UsersRound,
    title: 'Management',
    text: 'Status, planning, decisions, risks, handoffs, team memory, and review loops.',
  },
  {
    icon: ShieldCheck,
    title: 'Software',
    text: 'Documentation, QA, testing, requirements, tickets, code context, and delivery.',
  },
];

const BUILD_LAYER = ['context', 'files', 'tools', 'decisions', 'review', 'outputs'];

export function Systems() {
  return (
    <section id="systems" className="section">
      <SectionHeader
        eyebrow="Systems"
        title={
          <>
            Not a blank chatbot.
            <br />
            <span className="text-gradient">Infrastructure around the job.</span>
          </>
        }
        description="Each role has different context, risk, language, files, decisions, and review points. The system should be designed around that reality."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4" scanline>
          <div className="flex h-full flex-col justify-between gap-8 p-7 md:p-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                build pattern
              </div>
              <p className="mt-4 text-2xl font-medium leading-tight text-ink md:text-3xl">
                Understand the workflow, then build the AI infrastructure around it.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BUILD_LAYER.map((item) => (
                <div
                  key={item}
                  className="border border-line bg-white/[0.025] px-3 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
          {LANES.map((lane, index) => {
            const Icon = lane.icon;
            return (
              <motion.div
                key={lane.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <GlassCard className="h-full">
                  <div className="flex h-full flex-col gap-4 p-5">
                    <span className="flex size-10 items-center justify-center rounded-[2px] border border-line bg-white/[0.025] text-accent">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-ink">{lane.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lane.text}</p>
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
