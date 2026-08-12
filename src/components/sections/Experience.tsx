'use client';

import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, type LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

type Accent = 'cyan' | 'green' | 'amber';

interface Role {
  period: string;
  title: string;
  org: string;
  type: string;
  icon: LucideIcon;
  accent: Accent;
  bullets: string[];
  tags: string[];
}

const ACCENT: Record<Accent, { dot: string; text: string; ring: string; tint: string }> = {
  cyan: {
    dot: 'bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.55)]',
    text: 'text-accent',
    ring: 'ring-accent/30',
    tint: 'from-accent/12',
  },
  green: {
    dot: 'bg-signal-green shadow-[0_0_10px_hsl(var(--signal-green)/0.45)]',
    text: 'text-signal-green',
    ring: 'ring-signal-green/30',
    tint: 'from-signal-green/10',
  },
  amber: {
    dot: 'bg-accent-warm shadow-[0_0_10px_hsl(var(--accent-warm)/0.45)]',
    text: 'text-accent-warm',
    ring: 'ring-accent-warm/30',
    tint: 'from-accent-warm/10',
  },
};

const ROLES: Role[] = [
  {
    period: 'Aug 2026 - Present',
    title: 'Sr Quality Assurance Engineer',
    org: 'Enterprise software delivery',
    type: 'Full-time',
    icon: Briefcase,
    accent: 'cyan',
    bullets: [
      'Lead AI-assisted quality and delivery workflows across four development teams.',
      'Build automation and data-validation processes with Playwright, Azure DevOps, SQL, REST APIs, Kafka, and reporting.',
      'Create reusable agents, templates, workflow standards, and team enablement material.',
      'Design onboarding and project-training materials using visual design and learning principles.',
    ],
    tags: ['AI workflows', 'Playwright', 'Azure DevOps', 'SQL', 'Kafka', 'training'],
  },
  {
    period: 'Jul 2025 - Aug 2026',
    title: 'Software Engineer',
    org: 'Enterprise inventory and data systems',
    type: 'Full-time',
    icon: Briefcase,
    accent: 'green',
    bullets: [
      'Modernized inventory-management workflows with REST APIs and integration services.',
      'Built Azure DevOps AI plugins for planning, work items, test cases, summaries, documentation, and tracking.',
      'Standardized repeatable AI-assisted engineering practices across the team.',
      'Supported troubleshooting, data-lake work, and OpenShift deployment using Python, SQL, Azure Databricks, and Data Lake tooling.',
    ],
    tags: ['REST APIs', 'Azure Databricks', 'Python', 'Data Lake', 'OpenShift', 'AI plugins'],
  },
  {
    period: 'Dec 2022 - Jul 2025',
    title: 'Associate Software Engineer',
    org: 'Enterprise software and automation',
    type: 'Full-time',
    icon: Briefcase,
    accent: 'green',
    bullets: [
      'Identified a manual-testing gap and drove a Playwright automation initiative from concept through adoption.',
      'Automated parallel UI coverage across four server-backed test applications with Azure DevOps suites running in about five minutes.',
      'Developed software and data workflows for operational reporting, pharmaceutical traceability, and food-supply-chain processes.',
      'Automated data collection, validation, transformation, reporting, and AI-assisted development workflows.',
    ],
    tags: ['QA automation', 'Playwright', 'C#', 'Azure', 'data workflows', 'traceability'],
  },
  {
    period: 'Jan 2020 - Apr 2022',
    title: 'Teacher',
    org: 'Florida State University',
    type: 'Part-time',
    icon: GraduationCap,
    accent: 'amber',
    bullets: [
      'Led individual and small-group instruction across mathematics, science, and computer science.',
      'Adapted explanations, exercises, and problem-solving strategies to different learning styles.',
      'Mentored more than 200 students annually across analytical thinking, programming fundamentals, and structured problem-solving.',
      'Helped students build confidence with difficult technical material through patient coaching and follow-up.',
    ],
    tags: ['teaching', 'communication', 'C++', 'math', 'mentoring', 'learning design'],
  },
];

export function Experience() {
  return (
    <section id="experience" className="section">
      <SectionHeader
        eyebrow="Experience"
        title={
          <>
            Software delivery.
            <br />
            <span className="text-gradient">Automation, AI workflows, teaching.</span>
          </>
        }
        description="Public, role-level summary aligned to LinkedIn. No confidential systems, private metrics, or internal details."
      />

      <ol className="relative mt-14 space-y-6 border-l border-white/[0.06] pl-8 md:pl-12">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent/40 via-accent-cool/20 to-transparent"
        />

        {ROLES.map((role, index) => {
          const a = ACCENT[role.accent];
          const Icon = role.icon;

          return (
            <motion.li
              key={`${role.title}-${role.period}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-[39px] top-3 flex size-4 items-center justify-center md:-left-[55px]">
                <span
                  className={cn(
                    'absolute inset-0 animate-pulse-glow rounded-full opacity-50 blur-md',
                    a.dot,
                  )}
                />
                <span className={cn('relative size-2 rounded-full', a.dot)} />
              </span>

              <GlassCard className="overflow-hidden">
                <div
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent',
                    a.tint,
                  )}
                />
                <div className="space-y-5 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-white/[0.03] ring-1',
                          a.ring,
                          a.text,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                          <span>{role.period}</span>
                          <span>/</span>
                          <span className={a.text}>{role.type}</span>
                        </div>
                        <h3 className="mt-1 font-display text-lg leading-tight text-ink md:text-xl">
                          {role.title}
                          <span className="mx-2 text-ink-faint">/</span>
                          <span className={a.text}>{role.org}</span>
                        </h3>
                      </div>
                    </div>
                  </div>

                  <ul className="grid gap-3 text-sm leading-relaxed text-ink-muted md:grid-cols-2 md:text-base">
                    {role.bullets.map((item) => (
                      <li key={item} className="border-l border-line bg-white/[0.01] px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <ul className="flex flex-wrap gap-1.5 border-t border-white/[0.04] pt-4">
                    {role.tags.map((tag) => (
                      <li key={tag} className="mono-tag normal-case tracking-wider">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
