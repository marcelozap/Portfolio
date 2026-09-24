'use client';
import { XivCapitalLockup } from '@/components/brand/XivCapitalLockup';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import styles from './DragonShell.module.css';

export function Footer() {
  const pathname = usePathname();
  const isSpanish = pathname.startsWith('/es');

  return (
    <footer className={styles.footer} data-theme={pathname.includes('/play') ? 'game' : 'red'}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <Link href={isSpanish ? '/es' : '/'} className={styles.footerIdentity}>
            <XivCapitalLockup width={128} showCapital={false} title="XIV" />
            <span>
              {isSpanish ? 'Software · IA · Datos · Sonido' : 'Software · AI · Data · Sound'}
            </span>
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
          <a href="https://www.marcelozapata.com/">
            {isSpanish ? 'Música — marcelozapata.com' : 'Music — marcelozapata.com'}
          </a>
          <span>© {new Date().getFullYear()} XIV</span>
        </div>
      </div>
    </footer>
  );
}
