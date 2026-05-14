'use client';

import { useEffect, useState } from 'react';

const LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'Systems', href: '#engineering' },
  { label: 'Music', href: '#music' },
  { label: 'Contact', href: 'mailto:hello@xiv-os.dev' },
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
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-ink-faint">
            XIV_OS · v0.1
          </span>
          <span className="hidden h-3 w-px bg-white/10 md:inline-block" />
          <span className="font-mono text-[11px] text-ink-faint">
            <span className="mr-2 inline-flex size-1.5 rounded-full bg-signal-green align-middle shadow-[0_0_8px_hsl(var(--signal-green))]" />
            session active
          </span>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="transition hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="font-mono text-[11px] tracking-widest text-ink-faint">{time}</div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] text-ink-faint md:px-10">
          <span>Crafted in the dark hours. Systems over noise.</span>
          <span className="font-mono">© {new Date().getFullYear()} XIV</span>
        </div>
      </div>
    </footer>
  );
}
