'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const OFFERS = [
  {
    name: 'AI Workflow Strategy Call',
    price: '$250/hr',
    timeline: '60-90 min',
    bestFor:
      'A focused paid call for founders, operators, managers, independent people, or builders who want to talk through where AI can actually help.',
    deliverables: [
      'Workflow diagnosis',
      'AI fit and risk review',
      'Role-specific agent ideas',
      'Build-vs-buy direction',
      'Follow-up summary',
    ],
  },
  {
    name: 'Workflow Audit',
    price: '$750',
    timeline: '3 hours',
    bestFor:
      'A bundled deep-dive for leaders, teams, and independent operators who know AI should help but need the opportunity mapped clearly.',
    deliverables: [
      'Three-hour working session',
      'Workflow map',
      'AI opportunity list',
      'Risk and review points',
      'Role-based agent plan',
    ],
  },
  {
    name: 'Agent Prototype Sprint',
    price: '$2,500',
    timeline: '2 weeks',
    bestFor:
      'A team or independent operator ready to test one useful AI workflow with real files, tools, and review steps.',
    deliverables: [
      'One working agentic workflow',
      'Prompt and tool structure',
      'Input/output templates',
      'Review checklist',
      'Handoff documentation',
    ],
  },
  {
    name: 'AI Operating System Build',
    price: '$7,500+',
    timeline: '4-6 weeks',
    bestFor:
      'Organizations that need repeatable AI infrastructure across a role, department, or core process.',
    deliverables: [
      'Multi-step workflow system',
      'Role-specific knowledge structure',
      'Automation and documentation layer',
      'Quality gates and review loops',
      'Training and adoption materials',
    ],
  },
];

const EVIDENCE = [
  "Four years building and shipping software inside a Fortune 100 retailer's technology organization",
  'Built AI-assisted systems for a local Miami business that increased customer flow by 200% while maintaining operations without adding work for the owners',
  'AI-assisted workflows across QA, documentation, planning, and delivery',
  'Automation with Playwright, Azure DevOps, SQL, REST APIs, message-queue/topic workflows, and reporting',
  'Public role-systems repo with a built creator-system package, tests, schemas, and CI configuration',
  'Training material for analysts, engineers, managers, and directors',
];

export function Offers() {
  return (
    <section id="offers" className="section border-y border-white/[0.06] bg-white/[0.015]">
      <SectionHeader
        eyebrow="Pricing"
        title={
          <>
            Practical AI help.
            <br />
            <span className="text-gradient">Built around the work.</span>
          </>
        }
        description="For organizations, independent people, and teams that want useful AI without adding more work or losing human judgment."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {OFFERS.map((offer, index) => (
          <motion.div
            key={offer.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
          >
            <GlassCard className="h-full">
              <div className="flex h-full flex-col gap-6 p-6 md:p-7">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl text-ink">{offer.name}</h3>
                    <span className="mono-tag shrink-0">{offer.timeline}</span>
                  </div>
                  <div className="mt-4 font-display text-4xl text-ink">{offer.price}</div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">{offer.bestFor}</p>
                </div>

                <ul className="grid gap-3 border-t border-white/[0.06] pt-5">
                  {offer.deliverables.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <div className="p-6 md:p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              proof base
            </div>
            <ul className="mt-5 grid gap-3">
              {EVIDENCE.map((item) => (
                <li
                  key={item}
                  className="border-l border-accent/30 bg-white/[0.015] px-4 py-3 text-sm leading-relaxed text-ink-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex h-full flex-col justify-between gap-6 p-6 md:p-7">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                who this is for
              </div>
              <p className="mt-4 text-2xl font-medium leading-tight text-ink md:text-3xl">
                Large companies, local businesses, growing teams, independent people, educators, and
                creators who need AI to fit the work and life already in front of them.
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/marcelozap"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 border border-line bg-white/[0.025] px-4 py-3 text-sm font-medium text-ink-muted transition hover:border-accent/40 hover:text-ink"
            >
              Start a conversation
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
