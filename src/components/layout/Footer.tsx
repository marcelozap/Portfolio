'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { scrollToSection } from '@/lib/utils';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

const LINKS = [
  { label: 'Projects', id: 'projects' as const },
  { label: 'Experience', id: 'experience' as const },
  { label: 'Sound', id: 'music' as const },
];

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
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
              <Image
                src="/brand/gatekpt-icon.png"
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            </span>
            <div className="font-display text-sm font-medium text-ink">Marcelo Zapata</div>
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            Build - move - sound
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          {LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="transition hover:text-accent"
              >
                {link.label}
              </button>
            </li>
          ))}
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="transition hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="font-mono text-[11px] tracking-widest text-ink-faint">{time}</div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] text-ink-faint md:px-10">
          <span>Portfolio - Marcelo Zapata</span>
          <span className="font-mono">(c) {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
