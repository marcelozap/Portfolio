'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './DragonShell.module.css';

const SECTIONS = [
  { id: 'vision', en: 'Vision', es: 'Visión' },
  { id: 'work', en: 'Work', es: 'Proyectos' },
  { id: 'journal', en: 'Journal', es: 'Diario' },
  { id: 'contact', en: 'Contact', es: 'Contacto' },
];

export function Navbar() {
  const pathname = usePathname();
  const isSpanish = pathname.startsWith('/es');
  const homeHref = isSpanish ? '/es' : '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigationLinks = useRef<HTMLUListElement>(null);
  const languageHref =
    pathname === '/ai-blog/i-had-a-dream'
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
    <header className={styles.header}>
      <nav className={styles.navigation} aria-label={isSpanish ? 'Principal' : 'Main'}>
        <Link
          href={homeHref}
          className={styles.brand}
          aria-label={isSpanish ? 'XIV — inicio' : 'XIV — home'}
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/xiv-dragon-emblem.png"
            alt=""
            width={48}
            height={48}
            sizes="48px"
            quality={90}
            className={styles.emblem}
            priority
          />
          <span className={styles.brandCopy}>
            <span className={styles.wordmark}>XIV</span>
            <span className={styles.founder}>Marcelo Zapata</span>
          </span>
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
