import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const FEATURED_NOTE_SLUGS = [
  'before-i-trust-a-backtest-i-check-the-data',
  'are-tech-companies-the-new-banks',
  'all-in-every-time',
] as const;

const FEATURED_NOTES = FEATURED_NOTE_SLUGS.map((slug) =>
  FIELD_NOTES.find((note) => note.slug === slug),
).filter((note): note is (typeof FIELD_NOTES)[number] => Boolean(note));

const COLLECTION_AGENTS = [
  { name: 'Milo', callsign: 'Milo', color: 'violet' },
  { name: 'Mika', callsign: 'Mika', color: 'gold' },
  { name: 'Money', callsign: 'Money', color: 'green' },
] as const;

function noteDate(iso: string, locale: 'en' | 'es') {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function DragonHome({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const isSpanish = locale === 'es';

  return (
    <div className={`${styles.home} ${styles.studioHome}`}>
      <section className={styles.hero} aria-labelledby="dragon-title">
        <Image
          src="/brand/xiv-gold-horizon.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.horizon}
        />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Options · Research · Risk</p>
          <h1 id="dragon-title" className={styles.title}>
            Marcelo
            <br />
            <em>Zapata.</em>
          </h1>
          <p className={styles.philosophy}>
            {isSpanish
              ? 'Estudio opciones, estructura de mercado y gestión del riesgo. Construyo herramientas para investigar ideas y revisar decisiones.'
              : 'I study options, market structure, and risk. I build tools to research ideas and review decisions.'}
          </p>
          <div className={styles.actions}>
            <a href="#work" className={styles.primaryLink}>
              {isSpanish ? 'Explorar mi investigación' : 'Explore my research'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href="/systems/xiv"
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryLink}
            >
              {isSpanish ? 'Conocer XIV' : 'Explore XIV'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroFoot}>
          <span>{isSpanish ? 'Investigación independiente' : 'Independent research'}</span>
          <a href="#work">{isSpanish ? 'Ideas en práctica ↓' : 'Ideas into practice ↓'}</a>
        </div>
      </section>

      <section
        id="notes"
        className={`${styles.writing} ${styles.selectedWriting}`}
        aria-labelledby="notes-title"
      >
        <span id="contact" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '01 / Investigación' : '01 / Research'}</p>
          <h2 id="notes-title">
            {isSpanish ? 'Notas sobre los mercados.' : 'Notes on the markets.'}
          </h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Opciones, empresas y las preguntas detrás de cada tesis.'
              : 'Options, businesses, and the questions behind each thesis.'}
          </p>
        </div>
        <div className={styles.writingBody}>
          <ul className={styles.noteList}>
            {FEATURED_NOTES.map((note, index) => (
              <li key={note.slug}>
                <Link href={`/ai-blog/${note.slug}`} className={styles.noteItem}>
                  <span className={styles.noteArt} data-art={index} aria-hidden="true">
                    <svg viewBox="0 0 400 180" fill="none">
                      {index === 0 ? (
                        <>
                          {[30, 52, 74, 96, 118].map((radius) => (
                            <circle key={radius} cx="200" cy="130" r={radius} />
                          ))}
                          <path d="M0 130H400M200 0V180" />
                        </>
                      ) : index === 1 ? (
                        <>
                          {[0, 1, 2, 3, 4].map((layer) => (
                            <path
                              key={layer}
                              d={`M100 ${70 + layer * 20} L200 ${20 + layer * 20} L300 ${70 + layer * 20} L200 ${120 + layer * 20} Z`}
                            />
                          ))}
                        </>
                      ) : (
                        <>
                          <path d="M0 145L110 95L180 120L270 35L400 85" />
                          <circle cx="270" cy="35" r="12" />
                          <path d="M0 165L110 115L180 140L270 55L400 105" />
                        </>
                      )}
                    </svg>
                  </span>
                  <time className={styles.noteMeta} dateTime={note.date}>
                    {note.number} · {noteDate(note.date, locale)}
                  </time>
                  <span className={styles.noteTitle}>{note.title}</span>
                  <span className={styles.noteSummary}>{note.summary}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/ai-blog" className={styles.secondaryLink}>
            {isSpanish ? 'Leer todos los escritos' : 'Read all writing'}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="work" className={styles.writing} aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '02 / Herramientas' : '02 / Tools'}</p>
          <h2 id="work-title">
            {isSpanish ? 'Del análisis a la revisión.' : 'From research to review.'}
          </h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Herramientas de software para investigar, comprobar los datos y documentar decisiones.'
              : 'Software for research, data checks, and documenting decisions.'}
          </p>
        </div>
        <div className={styles.projectList}>
          <a href="/systems/xiv" target="_blank" rel="noreferrer" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Investigación de opciones' : 'Options research'}</h3>
              <p>
                {isSpanish
                  ? 'XIV reúne mi investigación de opciones y las herramientas que construyo para apoyarla.'
                  : 'XIV brings together my options research and the tools I build to support it.'}
              </p>
              <span>{isSpanish ? 'Ver investigación ↗' : 'View research ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <a
            href="/ai-blog/before-i-trust-a-backtest-i-check-the-data"
            target="_blank"
            rel="noreferrer"
            className={styles.project}
          >
            <div>
              <h3>{isSpanish ? 'Calidad de los datos' : 'Data quality'}</h3>
              <p>
                {isSpanish
                  ? 'Antes de confiar en un backtest, reviso la cobertura, los datos faltantes y la calidad de las cotizaciones.'
                  : 'Before trusting a backtest, I examine coverage, missing data, and quote quality.'}
              </p>
              <span>{isSpanish ? 'Ver investigación ↗' : 'View research ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <Link href="/ai-blog/i-had-a-dream" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Investigación con IA' : 'AI-assisted research'}</h3>
              <p>
                {isSpanish
                  ? 'Flujos de investigación que organizan la evidencia y dejan las decisiones en mis manos.'
                  : 'Research workflows that organize evidence and keep decisions with me.'}
              </p>
              <span>{isSpanish ? 'Leer la nota ↗' : 'Read the note ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="experience" className={styles.writing} aria-labelledby="experience-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '03 / Experiencia' : '03 / Experience'}</p>
          <h2 id="experience-title">
            {isSpanish ? 'Software en el mundo real.' : 'Software in the real world.'}
          </h2>
          <p className={styles.bodyCopy}>Publix Super Markets · 2022–2026</p>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Sistemas empresariales, integraciones y automatización de calidad.'
              : 'Enterprise systems, integrations, and quality automation.'}
          </p>
        </div>
        <ol className={styles.experienceList}>
          <li>
            <time>{isSpanish ? 'Jul–Ago 2026' : 'Jul–Aug 2026'}</time>
            <h3>Sr Quality Assurance Engineer</h3>
            <p>
              {isSpanish
                ? 'Flujos de calidad con IA para cuatro equipos de desarrollo. Validación con Playwright, Azure DevOps, SQL, APIs REST y Kafka.'
                : 'AI-assisted quality workflows across four development teams. Validation with Playwright, Azure DevOps, SQL, REST APIs, and Kafka.'}
            </p>
          </li>
          <li>
            <time>May 2025–Jul 2026</time>
            <h3>Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Desarrollo y modernización de APIs e integraciones para inventario, pedidos, facturas, proveedores y almacenes.'
                : 'Built and modernized inventory APIs and integration services across ordering, invoicing, supplier, and warehouse systems.'}
            </p>
          </li>
          <li>
            <time>{isSpanish ? 'Dic 2022–May 2025' : 'Dec 2022–May 2025'}</time>
            <h3>Associate Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Modernización de sistemas de almacén que dan soporte a equipos de automatización, incluidas grúas y cintas transportadoras.'
                : 'Helped modernize warehouse technology supporting automation equipment, including crane and conveyor-control systems.'}
            </p>
          </li>
        </ol>
      </section>

      <section id="about" className={styles.writing} aria-labelledby="about-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '04 / Sobre mí' : '04 / About'}</p>
          <h2 id="about-title">Marcelo Zapata.</h2>
        </div>
        <div className={styles.aboutCopy}>
          <p>
            {isSpanish
              ? 'Soy trader de opciones con experiencia en ingeniería de software. Me centro en la estructura del mercado, la ejecución y la gestión del riesgo.'
              : 'I’m an options trader with a background in software engineering. My focus is market structure, execution, and risk management.'}
          </p>
          <p>
            {isSpanish
              ? 'Este sitio documenta mi investigación y mis herramientas. Comparto mi proceso personal; no gestiono dinero de terceros ni ofrezco asesoramiento de inversión.'
              : 'This site documents my research and tools. I share my personal process; I do not manage other people’s money or provide investment advice.'}
          </p>
          <p>
            <a href="mailto:xiv@marcelozapata.dev" className={styles.contactLink}>
              {isSpanish ? 'Hablemos' : 'Get in touch'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </p>
          <Link href="/systems/xiv" className={styles.archiveLink}>
            {isSpanish ? 'Investigación XIV' : 'XIV research'}{' '}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
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
