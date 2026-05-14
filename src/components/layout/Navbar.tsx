'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/components/interactive/CommandPalette';

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'engineering', label: 'Systems' },
  { id: 'projects', label: 'Projects' },
  { id: 'music', label: 'Music' },
];

/**
 * Scroll to a section by id with deterministic smooth behavior and a manual
 * offset that matches `scroll-padding-top` so the section header is never
 * occluded by the fixed navbar.
 */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(null, '', `#${id}`);
}

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['hsl(var(--bg) / 0)', 'hsl(var(--bg) / 0.72)']);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);
  const [active, setActive] = useState<string | null>(null);
  const { open: openPalette } = useCommandPalette();

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className="fixed inset-x-0 top-0 z-40 backdrop-blur-xl"
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-white"
      />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-3"
          aria-label="XIV home"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-[11px] tracking-widest text-ink shadow-inset">
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/20 to-transparent opacity-60" />
            <span className="relative">XIV</span>
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.32em] text-ink-muted group-hover:text-ink sm:inline">
            XIV_OS
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToSection(item.id)}
                data-active={active === item.id}
                className={cn(
                  'nav-link rounded-full px-3 py-2 text-sm text-ink-muted transition hover:text-ink',
                  active === item.id && 'text-ink',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-muted transition hover:border-accent/40 hover:text-ink"
          aria-label="Open command palette"
        >
          <Command className="size-3.5" />
          <span className="hidden sm:inline">Command</span>
          <kbd className="hidden rounded border border-white/10 bg-bg-subtle px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </nav>
    </motion.header>
  );
}
