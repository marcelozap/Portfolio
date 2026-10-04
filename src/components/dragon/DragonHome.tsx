import Image from 'next/image';
import Link from 'next/link';
import styles from './DragonHome.module.css';
import minimal from './MinimalHome.module.css';
const COLLECTION_AGENTS = [
  { name: 'Milo', callsign: 'Milo', color: 'violet' },
  { name: 'Mika', callsign: 'Mika', color: 'gold' },
  { name: 'Money', callsign: 'Money', color: 'green' },
] as const;
export function DragonHome({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const es = locale === 'es';
  return (
    <div className={minimal.page}>
      <section className={minimal.intro}>
        <p className={minimal.label}>Marcelo Zapata / XIV</p>
        <h1>{es ? 'Ingeniería de software.' : 'Software engineering.'}</h1>
        <p className={minimal.focus}>
          {es
            ? 'Automatización de pruebas. Ingeniería de datos.'
            : 'Test automation. Data engineering.'}
        </p>
        <p className={minimal.summary}>
          {es
            ? 'Construyo software, automatizo pruebas y trabajo con datos.'
            : 'I build software, automate tests, and work with data.'}
        </p>
        <a className={minimal.contact} href="mailto:xiv@marcelozapata.dev">
          {es ? 'Contactar' : 'Get in touch'} ↗
        </a>
      </section>
      <section id="experience" className={minimal.section}>
        <h2>{es ? 'Experiencia' : 'Experience'}</h2>
        <div>
          <p className={minimal.company}>
            Publix Super Markets <span>2022–2026</span>
          </p>
          <ul className={minimal.roles}>
            <li>
              <span>Sr Quality Assurance Engineer</span>
              <time>Jul–Aug 2026</time>
            </li>
            <li>
              <span>Software Engineer</span>
              <time>May 2025–Jul 2026</time>
            </li>
            <li>
              <span>Associate Software Engineer</span>
              <time>Dec 2022–May 2025</time>
            </li>
          </ul>
          <p className={minimal.summary}>
            {es
              ? 'Sistemas empresariales, automatización de calidad y tecnología de almacenes.'
              : 'Enterprise software, quality automation, and warehouse systems.'}
          </p>
          <p className={minimal.stack}>Python · SQL · Playwright · Azure DevOps</p>
        </div>
      </section>
      <section id="work" className={minimal.section}>
        <h2>{es ? 'Proyectos' : 'Projects'}</h2>
        <div className={minimal.projects}>
          <Link href="/ai-blog/before-i-trust-a-backtest-i-check-the-data">
            <span>Green Machine ↗</span>
            <p>{es ? 'Validación de datos en Python.' : 'Data validation in Python.'}</p>
          </Link>
          <Link href="/play">
            <span>Dragon Scales ↗</span>
            <p>
              {es
                ? 'Simulación de trading con fondos virtuales.'
                : 'Trading simulation with virtual funds.'}
            </p>
          </Link>
          <a href="https://malosound.ai/">
            <span>MaloSound ↗</span>
            <p>{es ? 'Exploración de sonido mediante código.' : 'Exploring sound through code.'}</p>
          </a>
        </div>
      </section>
      <section id="notes" className={minimal.section}>
        <h2>{es ? 'Escritos' : 'Writing'}</h2>
        <Link href="/ai-blog">
          {es ? 'Notas sobre software y datos' : 'Notes on software and data'} ↗
        </Link>
      </section>
      <section id="about" className={minimal.section}>
        <h2>{es ? 'Contacto' : 'Contact'}</h2>
        <div id="contact" className={minimal.links}>
          <a href="mailto:xiv@marcelozapata.dev">Email ↗</a>
          <a href="https://www.linkedin.com/in/marcelozap">LinkedIn ↗</a>
          <a href="https://github.com/marcelozap">GitHub ↗</a>
        </div>
      </section>
    </div>
  );
}
export function DragonCollection() {
  return (
    <div className={styles.home}>
      <section className={styles.collection} aria-labelledby="collection-title">
        <Link href="/" className={styles.researchLink}>
          Back to XIV
        </Link>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>XIV / Visual identity</p>
          <h1 id="collection-title">The dragons.</h1>
        </div>
        <div className={styles.agentList}>
          {COLLECTION_AGENTS.map((agent) => (
            <article key={agent.callsign} className={styles.agentRow}>
              <span
                className={styles.agentMark + ' ' + styles['agentMark' + agent.color]}
                aria-hidden="true"
              >
                <Image
                  src="/brand/xiv-dragon-emblem.png"
                  alt=""
                  width={52}
                  height={52}
                  className={styles.agentDragon}
                />
              </span>
              <p className={styles.agentRole}>{agent.callsign}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
