'use client';

import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Github,
  Linkedin,
} from 'lucide-react';
import { MarketTicker } from './MarketTicker';
import { GlowButton } from '@/components/ui/GlowButton';
import { scrollToSection } from '@/lib/utils';

const FEATURED_WORK = [
  {
    name: 'FSU Options Research',
    href: '/fsu-options-research',
    meta: 'Python / FastAPI',
    note: 'market data and risk analysis',
    external: false,
  },
  {
    name: 'Rally',
    href: '/rally',
    meta: 'SwiftUI',
    note: 'coming soon',
    external: false,
  },
  {
    name: 'AI Workflow Systems',
    href: '#projects',
    meta: 'AI / QA',
    note: 'approval-gated automation',
    external: false,
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--line)/0.28)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--line)/0.22)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_74%_28%,hsl(var(--accent)/0.11),transparent_62%),radial-gradient(62%_50%_at_18%_82%,hsl(var(--accent-warm)/0.13),transparent_58%),radial-gradient(48%_38%_at_42%_18%,hsl(var(--accent-cool)/0.075),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,transparent,hsl(var(--bg)/0.86))]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-1 text-sm font-medium text-ink-muted sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-signal-green" />
              Marcelo Zapata
            </span>
            <span className="hidden text-ink-faint sm:inline">/</span>
            <span className="text-ink-faint">software / automation / data</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="font-display text-[clamp(2.85rem,7vw,5.4rem)] font-semibold leading-[0.96] tracking-tight"
          >
            <span className="block text-ink">Marcelo Zapata</span>
            <span className="mt-3 block max-w-3xl text-[clamp(1.35rem,3vw,2.45rem)] font-medium leading-[1.08] text-ink-muted">
              Software engineer.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="max-w-2xl space-y-3"
          >
            <p className="text-balance text-base leading-7 text-ink-muted md:text-lg">
              Data tools, QA automation, AI-assisted workflows, and practical interfaces.
            </p>
            <p className="max-w-2xl text-sm font-medium leading-6 text-accent/85">
              C# / Azure / Python / React / Playwright / Power BI
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="flex flex-wrap items-center gap-3"
          >
            <GlowButton variant="primary" href="#projects">
              <FolderKanban className="size-4" />
              View Projects
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </GlowButton>
            <GlowButton variant="outline" href="/fsu-options-research">
              <ExternalLink className="size-4" />
              FSU Research
            </GlowButton>
            <GlowButton variant="outline" href="#experience">
              <Briefcase className="size-4" />
              Experience
            </GlowButton>
            <GlowButton
              variant="ghost"
              href="https://www.linkedin.com/in/marcelozap"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="size-11 justify-center !px-0"
            >
              <Linkedin className="size-4" />
            </GlowButton>
            <GlowButton
              variant="ghost"
              href="https://github.com/marcelozap"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="size-11 justify-center !px-0"
            >
              <Github className="size-4" />
            </GlowButton>
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.18 }}
          className="hidden lg:block"
          aria-label="Selected work"
        >
          <div className="border border-white/[0.08] bg-bg-elevated/55 p-5 shadow-[0_30px_120px_-60px_hsl(31_76%_35%/0.36)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4 text-sm font-medium text-ink-faint">
              <span>Selected work</span>
              <span className="text-signal-green">3</span>
            </div>
            <div className="space-y-2">
              {FEATURED_WORK.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  className="group grid grid-cols-[1fr_auto] gap-4 border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-accent/35 hover:bg-white/[0.04]"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{item.name}</span>
                    <span className="mt-1 block text-xs text-ink-muted">{item.note}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-medium text-ink-faint">
                    {item.meta}
                    <ExternalLink className="size-3 opacity-60 transition group-hover:opacity-100" />
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 border-t border-white/[0.08] pt-4 text-center">
              {[
                ['Data', 'systems'],
                ['QA', 'automation'],
                ['UI', 'tools'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-semibold text-ink">{value}</div>
                  <div className="mt-1 text-xs font-medium text-ink-faint">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="relative z-10 mx-auto mt-10 hidden w-full max-w-7xl px-6 pb-6 md:block md:px-10"
      >
        <div className="flex flex-col gap-3 border-y border-white/[0.08] bg-bg/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <MarketTicker />
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-faint transition hover:text-ink"
          >
            Scroll to work
            <ArrowDown className="size-3.5 text-accent transition group-hover:translate-y-0.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
