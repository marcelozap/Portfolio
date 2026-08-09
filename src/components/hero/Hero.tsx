'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, ExternalLink, FolderKanban, Github, Linkedin } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

const FEATURED_WORK = [
  {
    name: 'GateKPT',
    href: '#projects',
    meta: 'public',
    note: 'AI stack and learning map',
    external: false,
  },
  {
    name: 'Green Machine',
    href: '/fsu-options-research',
    meta: 'case study',
    note: 'research data and risk review',
    external: false,
  },
  {
    name: 'Rally',
    href: '/rally',
    meta: 'prototype',
    note: 'practice data and progress',
    external: false,
  },
];

const PROOF_ITEMS = [
  ['GateKPT', 'public AI stack map'],
  ['Green Machine', 'research system'],
  ['MaloSound', 'original site score'],
  ['XIV', 'international signal'],
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
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
            <span className="text-ink-faint">software / AI systems / data / sound</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="font-display text-[clamp(2.85rem,7vw,5.4rem)] font-semibold leading-[0.96] tracking-tight"
          >
            <span className="block text-ink">Marcelo Zapata</span>
            <span className="mt-3 block max-w-3xl text-[clamp(1.35rem,3vw,2.45rem)] font-medium leading-[1.08] text-ink-muted">
              AI systems, data engineering, and original sound design.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="max-w-2xl space-y-3"
          >
            <p className="text-balance text-base leading-7 text-ink-muted md:text-lg">
              I build software systems, publish the artifacts behind the learning, and score the
              site with original MaloSound audio.
            </p>
            <p className="max-w-2xl text-sm font-medium leading-6 text-accent/85">
              C# / Azure / Python / React / Playwright / Power BI / AI evaluation
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
              View Work
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
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
          <div className="border border-line bg-bg-elevated/55 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4 text-sm font-medium text-ink-faint">
              <span>Artifacts</span>
              <span className="text-accent">3</span>
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
                ['AI', 'stack'],
                ['Data', 'systems'],
                ['QA', 'review'],
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
        <div className="grid grid-cols-4 border-y border-line bg-bg/70">
          {PROOF_ITEMS.map(([label, value]) => (
            <div key={label} className="border-r border-line px-4 py-3 last:border-r-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {label}
              </div>
              <div className="mt-1 text-sm font-medium text-ink-muted">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
