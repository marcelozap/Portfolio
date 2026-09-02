'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github, Mail } from 'lucide-react';
import Image from 'next/image';
import { GlowButton } from '@/components/ui/GlowButton';

const FEATURED_WORK = [
  {
    name: 'Green Machine',
    href: '/systems/green-machine',
    meta: 'market / research',
    note: 'trading as an art form, with data and risk in view',
    external: false,
  },
  {
    name: 'MaloSound',
    href: '/systems/malosound',
    meta: 'music / signal',
    note: 'songs, audio analysis, and visual experiments',
    external: false,
  },
  {
    name: 'Rally',
    href: '/systems/rally',
    meta: 'movement / practice',
    note: 'computer vision for training memory and better practice',
    external: false,
  },
  {
    name: 'AI Blog',
    href: '/ai-blog',
    meta: 'writing',
    note: 'notes on attention, technology, work, and becoming',
    external: false,
  },
];

const NAV_STRIP = [
  {
    label: 'Projects',
    href: '#projects',
  },
  {
    label: 'AI Blog',
    href: '/ai-blog',
  },
  {
    label: 'About XIV',
    href: '#about',
  },
  {
    label: 'Contact',
    href: '#contact',
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[760px] flex-col justify-start overflow-hidden pb-16 pt-28 md:min-h-[100svh] md:justify-center md:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/brand/xiv-command-key-visual.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_50%] opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--bg)/0.98)_0%,hsl(var(--bg)/0.92)_28%,hsl(var(--bg)/0.58)_62%,hsl(var(--bg)/0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--bg)/0.18)_0%,transparent_42%,hsl(var(--bg)/0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_54%_at_28%_46%,hsl(var(--bg)/0),hsl(var(--bg)/0.62)_68%,hsl(var(--bg)/0.9)_100%)]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] bg-[linear-gradient(180deg,transparent,hsl(var(--bg)/0.86))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-20 mx-auto grid w-full max-w-7xl items-end gap-10 px-6 md:px-10 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="hero-copy flex max-w-3xl flex-col items-start gap-5 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-1 text-sm font-medium text-ink-muted sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-signal-green" />
              XIV
            </span>
            <span className="hidden text-ink-faint sm:inline">/</span>
            <span className="text-ink-faint">
              independent company / trading / research / creative work
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="font-display text-[clamp(2.85rem,7vw,5.4rem)] font-semibold leading-[0.96] tracking-tight"
          >
            <span className="block text-ink">Marcelo Zapata</span>
            <span className="mt-3 block max-w-3xl text-[clamp(1.35rem,3vw,2.45rem)] font-medium leading-[1.08] text-ink-muted">
              Founder of XIV.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="max-w-2xl space-y-3"
          >
            <p className="text-balance text-base leading-7 text-ink-muted md:text-lg">
              An independent company for trading, research, technology, and creative projects.
            </p>
            <p className="max-w-2xl text-sm font-medium leading-6 text-accent/85">
              I see the market as an art form: a living, unpredictable system shaped by data,
              attention, and every person inside it. Music is another language I use to study the
              world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="grid w-full max-w-xl grid-cols-3 border border-line bg-bg/55 backdrop-blur-xl"
          >
            {[
              ['Market', 'art form'],
              ['Music', 'language'],
              ['XIV', 'one field'],
            ].map(([label, value]) => (
              <a
                key={label}
                href="#projects"
                className="border-r border-line px-3 py-3 last:border-r-0 hover:bg-white/[0.035]"
              >
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {label}
                </span>
                <span className="mt-1 block font-display text-lg text-ink">{value}</span>
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="flex flex-wrap items-center gap-3"
          >
            <GlowButton variant="primary" href="#projects">
              <ArrowUpRight className="size-4" />
              Explore XIV
            </GlowButton>
            <GlowButton
              variant="outline"
              href="https://github.com/marcelozap"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" />
              GitHub
            </GlowButton>
            <GlowButton variant="ghost" href="#contact">
              <Mail className="size-4" />
              Contact
            </GlowButton>
            <GlowButton variant="ghost" href="/ai-blog">
              AI Blog
            </GlowButton>
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.18 }}
          className="hidden pb-8 lg:block"
          aria-label="Selected work"
        >
          <div className="bg-bg-elevated/48 border border-line p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4 text-sm font-medium text-ink-faint">
              <span>Inside XIV</span>
              <span className="text-accent">4</span>
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
                ['4', 'project lanes'],
                ['1', 'company'],
                ['1', 'point of view'],
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
        className="relative z-20 mx-auto mt-10 hidden w-full max-w-7xl px-6 pb-6 md:block md:px-10"
      >
        <div className="bg-bg/72 grid border-y border-line backdrop-blur-xl lg:grid-cols-4">
          {NAV_STRIP.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative overflow-hidden border-r border-line px-5 py-5 transition last:border-r-0 hover:border-accent/35 hover:bg-accent/5"
            >
              <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-cool to-transparent transition duration-300 group-hover:scale-x-100" />
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint transition group-hover:text-accent">
                {item.label}
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
