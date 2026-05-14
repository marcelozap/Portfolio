'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowDown, Beaker, Cpu, FolderKanban } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TypewriterRotation } from './TypewriterRotation';
import { CodeStream } from './CodeStream';
import { MarketTicker } from './MarketTicker';

const ParticleField = dynamic(() => import('./ParticleField').then((m) => m.ParticleField), {
  ssr: false,
  loading: () => null,
});

/**
 * Hero · the front door of XIV_OS.
 *
 * Layer order, back to front:
 *   1. R3F particle field (canvas)
 *   2. Drifting code fragments
 *   3. Central content (heading, typewriter, CTAs)
 *   4. Bottom market ticker + scroll cue
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
      <ParticleField />
      <CodeStream />

      {/* center content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-ink-muted"
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent-glow))]" />
          XIV_OS · v0.1 · session_initialized
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
          className="font-display text-[clamp(3.5rem,11vw,9rem)] font-semibold leading-[0.92] tracking-tight"
        >
          <span className="block text-ink">XIV</span>
          <span className="text-gradient block">/ fourteen</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="max-w-2xl space-y-3"
        >
          <p className="text-balance text-lg text-ink-muted md:text-xl">
            A cinematic operating system for a developer, builder, and creative technologist — an
            ecosystem of tools, experiences, and ideas built in the dark hours.
          </p>
          <TypewriterRotation />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-wrap items-center gap-3"
        >
          <GlowButton variant="primary" href="#projects">
            <FolderKanban className="size-4" />
            Explore Projects
          </GlowButton>
          <GlowButton variant="outline" href="#engineering">
            <Beaker className="size-4" />
            Enter the Lab
          </GlowButton>
          <GlowButton variant="ghost" href="#about">
            <Cpu className="size-4" />
            View Systems
          </GlowButton>
        </motion.div>
      </div>

      {/* bottom strip: ticker + scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 mx-auto mt-20 w-full max-w-7xl px-6 pb-8 md:px-10"
      >
        <div className="glass flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <MarketTicker />
          <a
            href="#about"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint transition hover:text-ink"
          >
            scroll
            <ArrowDown className="size-3.5 animate-bounce text-accent" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
