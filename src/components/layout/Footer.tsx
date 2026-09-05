'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import styles from './DragonShell.module.css';

export function Footer() {
  const isSpanish = usePathname().startsWith('/es');

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <Link href={isSpanish ? '/es' : '/'} className={styles.footerIdentity}>
            <span className={styles.footerWordmark}>XIV</span>
            <span>{isSpanish ? 'Visión independiente' : 'Independent vision'}</span>
          </Link>
          <ul className={styles.socialLinks} aria-label={isSpanish ? 'Conectar' : 'Connect'}>
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {link.label === 'Contact' ? 'xiv@marcelozapata.dev' : link.label}
                  {link.href.startsWith('http') && <span aria-hidden="true"> ↗</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.footerBottom}>
          <span>Marcelo Zapata</span>
          <span>© {new Date().getFullYear()} XIV</span>
        </div>
      </div>
    </footer>
  );
}
