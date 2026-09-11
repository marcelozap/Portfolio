'use client';

import { usePathname } from 'next/navigation';
import styles from './DragonShell.module.css';

export function AmbientBackdrop() {
  const pathname = usePathname();

  return (
    <div
      aria-hidden="true"
      className={styles.backdrop}
      data-theme={pathname.includes('/play') ? 'game' : 'red'}
    />
  );
}
