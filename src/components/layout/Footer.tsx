'use client';

import { ExternalLink, Github, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { scrollToSection } from '@/lib/utils';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

const LINKS = [
  { label: 'Projects', id: 'projects' as const },
  { label: 'Experience', id: 'experience' as const },
  { label: 'MaloSound', id: 'malosound' as const },
  { label: 'About', id: 'about' as const },
];

const SOCIAL_ICONS = {
  LinkedIn: Linkedin,
  GitHub: Github,
  Contact: Mail,
} as const;

export function Footer() {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          timeZoneName: 'short',
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
              <Image src="/favicon.svg" alt="" width={24} height={24} className="rounded-full" />
            </span>
            <div className="font-display text-sm font-medium text-ink">Marcelo Zapata</div>
          </div>
          <div className="mt-1 whitespace-nowrap text-[12px] font-medium tracking-[0.04em] text-ink-muted">
            Software / AI systems / data
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-muted md:flex-nowrap md:justify-center">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 md:flex-nowrap">
            {LINKS.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="whitespace-nowrap transition hover:text-accent"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <ul className="flex items-center gap-1.5">
            {SOCIAL_LINKS.map((link) => {
              const Icon = SOCIAL_ICONS[link.label] ?? ExternalLink;
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={link.label}
                    title={link.label}
                    className="flex size-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.025] text-ink-muted transition hover:border-accent/35 hover:text-accent"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="shrink-0 text-xs font-medium text-ink-faint">{time}</div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] text-ink-faint md:px-10">
          <span>Portfolio - Marcelo Zapata</span>
          <span>(c) {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
