import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const COPY = {
  en: {
    eyebrow: 'Options Trader | XIV',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro: 'Options trading and market research.',
    research: 'XIV on LinkedIn',
    enter: 'Explore MaloSound',
    read: 'Read my writing',
    scroll: 'More below',
    signature: 'Market structure / Execution / Risk',

    notesLabel: '01 / Writing',
    notesTitle: 'Selected writing.',
    notesBody: 'Personal essays on what I’m learning and living.',
    notesLatest: 'Latest',
    notesLink: 'Read my writing',
    market: 'Market price movement, translated into music, color, and motion.',

    practiceLabel: '02 / Practice',
    practiceTitle: 'Dragon Scales.',
    practiceLead: 'Buy. Sell. Ride the tape.',
    practiceFacts: ['Free to play', 'Simulated prices', 'Virtual funds'],

    agentsLabel: '03 / XIV',
    agentsTitle: 'The dragons.',
    agentsLead: '',
    agents: [
      { name: 'Milo', callsign: 'Milo', color: 'violet' },
      { name: 'Mika', callsign: 'Mika', color: 'gold' },
      { name: 'Money', callsign: 'Money', color: 'green' },
    ],
  },
  es: {
    eyebrow: 'Trader de opciones | XIV',
    premise: 'Todos son toros o osos.',
    first: 'Soy el',
    dragon: 'dragón.',
    intro: 'Trading de opciones e investigación de mercados.',
    research: 'XIV en LinkedIn',
    enter: 'Explorar MaloSound',
    read: 'Leer mis escritos',
    scroll: 'Más abajo',
    signature: 'Estructura / Ejecución / Riesgo',

    notesLabel: '01 / Escritos',
    notesTitle: 'Escritos seleccionados.',
    notesBody: 'Ensayos personales sobre lo que aprendo y vivo.',
    notesLatest: 'Recientes',
    notesLink: 'Leer mis textos',
    market: 'El movimiento del precio del mercado, traducido en música, color y movimiento.',

    practiceLabel: '02 / Práctica',
    practiceTitle: 'Dragon Scales.',
    practiceLead: 'Compra. Vende. Sigue el movimiento.',
    practiceFacts: ['Gratis', 'Precios simulados', 'Fondos virtuales'],

    agentsLabel: '03 / XIV',
    agentsTitle: 'Los dragones.',
    agentsLead: '',
    agents: [
      { name: 'Milo', callsign: 'Milo', color: 'violet' },
      { name: 'Mika', callsign: 'Mika', color: 'gold' },
      { name: 'Money', callsign: 'Money', color: 'green' },
    ],
  },
};

const LATEST_NOTES = FIELD_NOTES.slice(0, 3);

function noteDate(iso: string, locale: 'en' | 'es') {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function DragonHome({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const copy = COPY[locale];

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="dragon-title">
        <div className={styles.art}>
          <Image
            src="/brand/xiv-mirrored-dragons.png"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={95}
            className={styles.artImage}
          />
        </div>
        <div className={styles.heroCopy}>
          <Image
            src="/brand/xiv-segmented-mark.png"
            alt="XIV"
            width={170}
            height={170}
            priority
            className={styles.heroMark}
          />
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="dragon-title" className={styles.title}>
            <span>{copy.first} </span>
            <span className={styles.dragonWord}>{copy.dragon}</span>
          </h1>
          <p className={styles.intro}>{copy.intro}</p>
          <a
            href="https://www.linkedin.com/company/xiv-trading-technology/"
            className={styles.researchLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.research}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        id="notes"
        className={`${styles.writing} ${styles.selectedWriting}`}
        aria-labelledby="notes-title"
      >
        <span id="contact" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.notesLabel}</p>
          <h2 id="notes-title">
            {copy.notesTitle.split('\n').map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h2>
          <p className={styles.bodyCopy}>{copy.notesBody}</p>
        </div>
        <div className={styles.writingBody}>
          <ul className={styles.noteList}>
            {LATEST_NOTES.map((note) => (
              <li key={note.slug}>
                <Link href={`/ai-blog/${note.slug}`} className={styles.noteItem}>
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
            {copy.notesLink}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="practice" className={styles.writing} aria-labelledby="projects-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{locale === 'es' ? '02 / Proyectos' : '02 / Projects'}</p>
          <h2 id="projects-title">
            {locale === 'es' ? 'Otras formas de explorar.' : 'Other ways to explore.'}
          </h2>
        </div>
        <div className={styles.projectList}>
          <a
            href="https://malosound.ai/"
            className={styles.project}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <h3>MaloSound</h3>
              <p>{copy.market}</p>
              <span>{locale === 'es' ? 'Explorar MaloSound' : 'Explore MaloSound'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <Link href={locale === 'es' ? '/es/play' : '/play'} className={styles.project}>
            <div>
              <h3>Dragon Scales</h3>
              <p>
                {locale === 'es'
                  ? 'Un juego de trading gratuito con precios simulados y fondos virtuales.'
                  : 'A free trading game with simulated prices and virtual funds.'}
              </p>
              <span>{locale === 'es' ? 'Jugar' : 'Play'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section id="about" className={styles.writing} aria-labelledby="about-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{locale === 'es' ? '03 / Sobre mí' : '03 / About'}</p>
          <h2 id="about-title">Marcelo Zapata.</h2>
        </div>
        <div className={styles.aboutCopy}>
          <p>
            {locale === 'es'
              ? 'El trading forma parte de mi vida desde hace diez años, junto a una carrera en ingeniería de software y sistemas empresariales.'
              : 'Trading has been part of my life for ten years, alongside a career in software engineering and enterprise systems.'}
          </p>
          <p>
            {locale === 'es'
              ? 'XIV comenzó como mi proyecto de tesis de ingeniería de software en Florida State University. Hoy reúne mi trabajo en trading de opciones e investigación de mercados.'
              : 'XIV began as my software engineering thesis at Florida State University. Today it brings together my options trading and market research.'}
          </p>
          <Link href="/systems/xiv" className={styles.researchLink}>
            {locale === 'es' ? 'Los orígenes de XIV' : 'The origins of XIV'}{' '}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link href="/dragons" className={styles.archiveLink}>
            {locale === 'es' ? 'Los dragones de XIV' : 'The XIV dragons'}{' '}
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
          {COPY.en.agents.map((agent) => (
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
