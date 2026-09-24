'use client';
import { XivCapitalLockup } from '@/components/brand/XivCapitalLockup';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './DragonShell.module.css';

const SECTIONS = [
  { id: 'notes', en: 'Writing', es: 'Escritos' },
  { id: 'work', en: 'Work', es: 'Trabajo' },
  { id: 'experience', en: 'Experience', es: 'Experiencia' },
  { id: 'sound', en: 'Sound', es: 'Sonido' },
  { id: 'about', en: 'About', es: 'Sobre mí' },
];

export function Navbar() {
  const pathname = usePathname();
  const isSpanish = pathname.startsWith('/es');
  const homeHref = isSpanish ? '/es' : '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigationLinks = useRef<HTMLUListElement>(null);
  const languageHref =
    pathname === '/play'
      ? '/es/play'
      : pathname === '/es/play'
        ? '/play'
        : pathname === '/ai-blog/i-had-a-dream'
          ? '/es/ai-blog/i-had-a-dream'
          : pathname === '/es/ai-blog/i-had-a-dream'
            ? '/ai-blog/i-had-a-dream'
            : isSpanish
              ? '/'
              : '/es';

  useEffect(() => {
    document.documentElement.lang = isSpanish ? 'es' : 'en';
    setMenuOpen(false);
  }, [pathname, isSpanish]);

  useEffect(() => {
    if (!menuOpen) return;
    navigationLinks.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <header className={styles.header} data-theme={pathname.includes('/play') ? 'game' : 'red'}>
      <nav className={styles.navigation} aria-label={isSpanish ? 'Principal' : 'Main'}>
        <Link
          href={homeHref}
          className={styles.brand}
          aria-label={isSpanish ? 'XIV — inicio' : 'XIV — home'}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.lockup}>
            <XivCapitalLockup width={78} showCapital={false} title="XIV" />
          </span>
          <span className={styles.founder}>Marcelo Zapata</span>
        </Link>

        <ul
          ref={navigationLinks}
          id="primary-navigation"
          className={styles.navigationLinks}
          data-open={menuOpen}
        >
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <Link href={`${homeHref}#${section.id}`} onClick={() => setMenuOpen(false)}>
                {isSpanish ? section.es : section.en}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.utilities}>
          <Link
            href={languageHref}
            className={styles.language}
            aria-label={isSpanish ? 'Switch to English' : 'Cambiar a español'}
            hrefLang={isSpanish ? 'en' : 'es'}
            onClick={() => setMenuOpen(false)}
          >
            {isSpanish ? 'EN' : 'ES'}
          </Link>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (isSpanish ? 'Cerrar' : 'Close') : isSpanish ? 'Menú' : 'Menu'}
            <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
