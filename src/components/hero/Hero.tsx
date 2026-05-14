'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Briefcase, FolderKanban, Music } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TypewriterRotation } from './TypewriterRotation';
import { CodeStream } from './CodeStream';
import { MarketTicker } from './MarketTicker';
import { scrollToSection } from '@/lib/utils';

const ParticleField = dynamic(() => import('./ParticleField').then((m) => m.ParticleField), {
  ssr: false,
  loading: () => null,
});

/**
 * Hero — professional first impression: name, title, short line, projects first.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
      <ParticleField />
      <CodeStream />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-7 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-muted sm:flex-row sm:items-center sm:gap-3"
        >
          <span className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent-glow))]" />
            Marcelo Zapata
          </span>
          <span className="hidden text-ink-faint sm:inline">·</span>
          <span className="text-ink-faint">Software Engineer</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
          className="font-display text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.95] tracking-tight"
        >
          <span className="block text-ink">Marcelo Zapata</span>
          <span className="mt-1 block font-mono text-[clamp(1rem,3.5vw,1.35rem)] font-normal normal-case tracking-[0.12em] text-ink-muted">
            XIV <span className="text-ink-faint">/</span>{' '}
            <span className="text-gradient">creative moniker</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="max-w-xl space-y-3"
        >
          <p className="text-balance text-lg text-ink-muted md:text-xl">
            I am a software engineer. Here: selected projects, music, tennis-inspired game work, and
            trading tooling.
          </p>
          <TypewriterRotation />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="flex flex-wrap items-center gap-3"
        >
          <GlowButton variant="primary" href="#projects">
            <FolderKanban className="size-4" />
            Projects
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </GlowButton>
          <GlowButton variant="outline" href="#experience">
            <Briefcase className="size-4" />
            Experience
          </GlowButton>
          <GlowButton variant="ghost" href="#music">
            <Music className="size-4" />
            Music
          </GlowButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52 }}
          className="flex flex-wrap gap-2 font-mono text-[11px] text-ink-faint"
        >
          <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1">
            Trading · Green Machine
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1">
            Tennis · Rally
          </span>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1">
            Audio · GATEKPT
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-7xl px-6 pb-8 md:px-10"
      >
        <div className="glass flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <MarketTicker />
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint transition hover:text-ink"
          >
            scroll · projects
            <ArrowDown className="size-3.5 animate-bounce text-accent" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
