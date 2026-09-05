import styles from './DragonShell.module.css';

export function AmbientBackdrop() {
  return <div aria-hidden="true" className={styles.backdrop} />;
}
