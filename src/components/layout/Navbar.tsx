'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Command, ExternalLink, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/components/interactive/CommandPalette';

const NAV_ITEMS = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
];
const OBSERVED_SECTION_IDS = NAV_ITEMS.map((n) => n.id);

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['hsl(var(--bg) / 0)', 'hsl(var(--bg) / 0.72)']);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);
  const [active, setActive] = useState<string | null>(null);
  const { open: openPalette } = useCommandPalette();

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.href = `/#${id}`;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    OBSERVED_SECTION_IDS.forEach((id) => {
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
        <Link href="/" className="group flex items-center gap-3" aria-label="Marcelo Zapata home">
          <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03] text-ink shadow-inset">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-accent/20 to-transparent opacity-60" />
            <Image
              src="/favicon.svg"
              alt=""
              width={24}
              height={24}
              className="relative rounded-full"
              priority
            />
          </span>
          <span className="hidden flex-col items-start sm:flex">
            <span className="font-display text-[13px] font-medium leading-tight text-ink">
              Marcelo Zapata
            </span>
            <span className="text-[11px] font-medium tracking-[0.04em] text-ink-muted">
              software / data
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goToSection(item.id)}
                data-active={active === item.id}
                className={cn(
                  'nav-link rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition hover:text-ink',
                  active === item.id && 'text-ink',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <Link
              href="https://gatekpt.ai"
              className="nav-link inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition hover:text-ink"
              target="_blank"
              rel="noreferrer"
            >
              GateKPT
              <ExternalLink className="size-3" />
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="https://gatekpt.ai"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:border-accent/40 hover:text-ink sm:flex"
          >
            <FolderKanban className="size-3.5" />
            GateKPT
          </Link>
          <button
            onClick={openPalette}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:border-accent/40 hover:text-ink"
            aria-label="Open command palette"
          >
            <Command className="size-3.5" />
            <span className="hidden sm:inline">Command</span>
            <kbd className="hidden rounded border border-white/10 bg-bg-subtle px-1.5 py-0.5 text-[10px] sm:inline">
              Ctrl K
            </kbd>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
