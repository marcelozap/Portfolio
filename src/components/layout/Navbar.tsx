'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Github, Languages, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

const EN_NAV_ITEMS = [
  { id: 'experience', label: 'Experience' },
  { id: 'offers', label: 'Work together' },
];
const ES_NAV_ITEMS = [
  { id: 'experience', label: 'Experiencia' },
  { id: 'offers', label: 'Trabajemos juntos' },
];
const OBSERVED_SECTION_IDS = EN_NAV_ITEMS.map((n) => n.id);

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['hsl(var(--bg) / 0)', 'hsl(var(--bg) / 0.72)']);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();
  const isSpanish = pathname.startsWith('/es');
  const navItems = isSpanish ? ES_NAV_ITEMS : EN_NAV_ITEMS;
  const languageHref =
    pathname === '/ai-blog/i-had-a-dream'
      ? '/es/ai-blog/i-had-a-dream'
      : pathname === '/es/ai-blog/i-had-a-dream'
        ? '/ai-blog/i-had-a-dream'
        : isSpanish
          ? '/'
          : '/es';

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.href = isSpanish ? `/es#${id}` : `/#${id}`;
  };

  useEffect(() => {
    document.documentElement.lang = isSpanish ? 'es' : 'en';
  }, [isSpanish]);

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
  }, [isSpanish]);

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
        <Link
          href={isSpanish ? '/es' : '/'}
          className="group flex items-center gap-3"
          aria-label={isSpanish ? 'Inicio de Marcelo Zapata' : 'Marcelo Zapata home'}
        >
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
              {isSpanish ? 'sistemas de IA / flujos de trabajo' : 'AI systems / workflows'}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
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
              href={isSpanish ? '/es#ai-blog' : '/ai-blog'}
              className="nav-link rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition hover:text-ink"
            >
              {isSpanish ? 'Blog de IA' : 'AI Blog'}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="https://www.linkedin.com/in/marcelozap"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="flex size-9 items-center justify-center rounded-[2px] border border-line bg-white/[0.025] text-ink-muted transition hover:border-accent/40 hover:text-accent"
          >
            <Linkedin className="size-4" />
          </a>
          <a
            href="https://github.com/marcelozap"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="flex size-9 items-center justify-center rounded-[2px] border border-line bg-white/[0.025] text-ink-muted transition hover:border-accent/40 hover:text-accent"
          >
            <Github className="size-4" />
          </a>
          <Link
            href={languageHref}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-line bg-white/[0.025] px-2.5 text-xs font-medium text-ink-muted transition hover:border-accent/40 hover:text-accent sm:px-3"
            aria-label={isSpanish ? 'Switch to English' : 'Cambiar a español'}
            title={isSpanish ? 'Switch to English' : 'Cambiar a español'}
          >
            <Languages className="size-4" />
            <span>{isSpanish ? 'English' : 'Español'}</span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
