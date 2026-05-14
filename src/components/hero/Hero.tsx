'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  Cpu,
  Database,
  FolderKanban,
  GitMerge,
  Headphones,
  Joystick,
  Radar,
  Workflow,
} from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TypewriterRotation } from './TypewriterRotation';
import { CodeStream } from './CodeStream';
import { MarketTicker } from './MarketTicker';
import { scrollToSection } from '@/lib/utils';

const ParticleField = dynamic(() => import('./ParticleField').then((m) => m.ParticleField), {
  ssr: false,
  loading: () => null,
});

// the six experience tracks, in display order
const TRACKS = [
  { icon: GitMerge, label: 'DevOps · SRE', tone: 'text-accent' },
  { icon: Workflow, label: 'Publix · Automation Lead', tone: 'text-signal-green' },
  { icon: Database, label: 'Data Lake · Modernization', tone: 'text-accent-cool' },
  { icon: Radar, label: 'Green Machine · Trading OS', tone: 'text-signal-green' },
  { icon: Headphones, label: 'GATEKPT · Audio OS', tone: 'text-accent' },
  { icon: Joystick, label: 'Rally · Cinematic Game', tone: 'text-accent-warm' },
];

/**
 * Hero · the front door of XIV_OS.
 *
 * Reordered to put the operator's experience first. Layer order, back to front:
 *   1. R3F particle field (canvas)
 *   2. Drifting code fragments
 *   3. Heading + experience teaser + primary CTAs
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

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-7 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-ink-muted"
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent-glow))]" />
          XIV_OS · v0.1 · operator_dossier
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
          className="font-display text-[clamp(3.25rem,10vw,8.5rem)] font-semibold leading-[0.92] tracking-tight"
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
            Six parallel tracks of operations, engineering, data, and independent product work —
            built over years, in the dark hours. The full operator dossier is one click away.
          </p>
          <TypewriterRotation />
        </motion.div>

        {/* primary CTA row — experience first */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center gap-3"
        >
          <GlowButton variant="primary" href="#experience">
            <Briefcase className="size-4" />
            View Experience
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </GlowButton>
          <GlowButton variant="outline" href="#projects">
            <FolderKanban className="size-4" />
            Projects
          </GlowButton>
          <GlowButton variant="ghost" href="#engineering">
            <Cpu className="size-4" />
            Systems
          </GlowButton>
        </motion.div>

        {/* experience teaser — six tracks at a glance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="w-full"
        >
          <button
            type="button"
            onClick={() => scrollToSection('experience')}
            className="glass group w-full overflow-hidden p-4 text-left transition hover:border-accent/30 md:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                <span className="size-1 rounded-full bg-accent" />
                six tracks running in parallel
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent transition group-hover:translate-x-0.5">
                open dossier
                <ArrowRight className="size-3" />
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
              {TRACKS.map((t) => {
                const Icon = t.icon;
                return (
                  <li
                    key={t.label}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-ink-muted transition group-hover:bg-white/[0.04]"
                  >
                    <Icon className={`size-3.5 ${t.tone}`} />
                    <span className="truncate">{t.label}</span>
                  </li>
                );
              })}
            </ul>
          </button>
        </motion.div>
      </div>

      {/* bottom strip: ticker + scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-7xl px-6 pb-8 md:px-10"
      >
        <div className="glass flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <MarketTicker />
          <button
            type="button"
            onClick={() => scrollToSection('experience')}
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint transition hover:text-ink"
          >
            scroll · experience
            <ArrowDown className="size-3.5 animate-bounce text-accent" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
