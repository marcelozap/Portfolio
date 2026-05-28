'use client';

import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FolderKanban,
  Github,
  Linkedin,
} from 'lucide-react';
import { MarketTicker } from './MarketTicker';
import { GlowButton } from '@/components/ui/GlowButton';
import { scrollToSection } from '@/lib/utils';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--line)/0.28)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--line)/0.22)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_74%_28%,hsl(var(--accent)/0.08),transparent_62%),radial-gradient(60%_50%_at_18%_82%,hsl(var(--accent-warm)/0.055),transparent_58%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-signal-green" />
              Marcelo Zapata
            </span>
            <span className="hidden text-ink-faint sm:inline">/</span>
            <span className="text-ink-faint">Systems, Product, Automation</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="font-display text-[clamp(2.85rem,7vw,5.4rem)] font-semibold leading-[0.96] tracking-tight"
          >
            <span className="block text-ink">Marcelo Zapata</span>
            <span className="mt-3 block max-w-3xl text-[clamp(1.35rem,3vw,2.45rem)] font-medium leading-[1.08] text-ink-muted">
              Software engineer for reliable tools, product systems, and automation.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="max-w-2xl space-y-3"
          >
            <p className="text-balance text-base leading-7 text-ink-muted md:text-lg">
              I build practical software where reliability, workflow clarity, and product judgment
              matter: analytics tools, internal platforms, automation, and independent products.
            </p>
            <p className="max-w-2xl font-mono text-[12px] uppercase leading-6 tracking-[0.14em] text-accent/80">
              Open to software engineering roles with deeper product scope, platform ownership, and
              systems responsibility.
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
            <GlowButton variant="outline" href="#experience">
              <Briefcase className="size-4" />
              Experience
            </GlowButton>
            <GlowButton
              variant="ghost"
              href="https://www.linkedin.com/in/marcelozap"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin className="size-4" />
              LinkedIn
            </GlowButton>
            <GlowButton
              variant="ghost"
              href="https://github.com/marcelozap"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" />
              GitHub
            </GlowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            className="grid w-full max-w-2xl grid-cols-1 gap-2 pt-1 text-sm text-ink-muted sm:grid-cols-3"
          >
            {['Reliable tools', 'Internal platforms', 'Product systems'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 border-l border-accent/40 bg-white/[0.015] px-3 py-2"
              >
                <CheckCircle2 className="size-4 shrink-0 text-accent/80" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.18 }}
          className="hidden lg:block"
          aria-label="Engineering focus areas"
        >
          <div className="border border-white/[0.08] bg-bg-elevated/55 p-5 shadow-[0_30px_120px_-60px_hsl(0_0%_0%/0.9)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              <span>Engineering Profile</span>
              <span className="text-signal-green">Available</span>
            </div>
            <div className="space-y-4">
              {[
                ['Systems', 'APIs, data flows, tooling, and reliability work.'],
                ['Product', 'User-centered interfaces for repeated workflows and decisions.'],
                ['Automation', 'Repeatable workflows with clear validation and ownership.'],
                ['Analytics', 'Dashboards, reporting, and evidence-driven review loops.'],
              ].map(([label, body]) => (
                <div key={label} className="grid grid-cols-[7rem_1fr] gap-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent/75">
                    {label}
                  </div>
                  <p className="text-sm leading-6 text-ink-muted">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 border-t border-white/[0.08] pt-4 text-center">
              {[
                ['Tools', 'Systems'],
                ['3', 'Products'],
                ['Data', 'Tools'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-semibold text-ink">{value}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    {label}
                  </div>
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
        className="relative z-10 mx-auto mt-10 w-full max-w-7xl px-6 pb-6 md:px-10"
      >
        <div className="flex flex-col gap-3 border-y border-white/[0.08] bg-bg/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <MarketTicker />
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint transition hover:text-ink"
          >
            scroll / projects
            <ArrowDown className="size-3.5 text-accent transition group-hover:translate-y-0.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
