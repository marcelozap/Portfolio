import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PlayTeaser } from '@/components/play/PlayTeaser';
import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const COPY = {
  en: {
    eyebrow: 'Options Trader | XIV',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro:
      'I’m Marcelo. My work centers on market structure, execution, risk management, and performance review.',
    research: 'XIV on LinkedIn',
    enter: 'Explore MaloSound',
    read: 'Read my writing',
    scroll: 'More below',
    signature: 'Market structure / Execution / Risk',

    notesLabel: '01 / Writing',
    notesTitle: 'Notes & essays.',
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
    intro:
      'Soy Marcelo. Mi trabajo se centra en estructura de mercado, ejecución, gestión del riesgo y revisión de resultados.',
    research: 'XIV en LinkedIn',
    enter: 'Explorar MaloSound',
    read: 'Leer mis escritos',
    scroll: 'Más abajo',
    signature: 'Estructura / Ejecución / Riesgo',

    notesLabel: '01 / Escritos',
    notesTitle: 'Notas y ensayos.',
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
        <svg
          className={styles.stars}
          viewBox="0 0 1440 1000"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {Array.from({ length: 75 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 317 + 83) % 1440}
              cy={(i * 173 + 29) % 1000}
              r={i % 7 === 0 ? 1.2 : 0.65}
              opacity={0.18 + (i % 4) * 0.1}
            />
          ))}
        </svg>
        <div className={styles.art}>
          <Image
            src="/brand/xiv-red-skyline.png"
            alt={
              locale === 'es'
                ? 'Dragón de XIV sobre una ciudad nocturna.'
                : 'Red and white XIV skyline, with a dragon forming the I.'
            }
            fill
            priority
            sizes="100vw"
            quality={95}
            className={styles.artImage}
          />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.spark} />
            {copy.eyebrow}
          </p>
          <p className={styles.premise}>{copy.premise}</p>
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
          <div className={styles.actions}>
            <a
              href="https://malosound.ai/"
              className={styles.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.enter}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <Link href="/ai-blog" className={styles.secondaryLink}>
              {copy.read}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroBottom}>
          <span>{copy.scroll}</span>
          <span>{copy.signature}</span>
        </div>
      </section>

      <section id="notes" className={styles.writing} aria-labelledby="notes-title">
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
          <a
            href="https://malosound.ai/"
            className={styles.marketLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>MaloSound.ai</span>
            <span>{copy.market}</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <p className={styles.noteListLabel}>{copy.notesLatest}</p>
          <ul className={styles.noteList}>
            {LATEST_NOTES.map((note) => (
              <li key={note.slug}>
                <Link href={`/ai-blog/${note.slug}`} className={styles.noteItem}>
                  <time className={styles.noteMeta} dateTime={note.date}>
                    {note.number} · {noteDate(note.date, locale)}
                  </time>
                  <span className={styles.noteTitle}>{note.title}</span>
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

      <section id="practice" className={styles.vision} aria-labelledby="practice-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.practiceLabel}</p>
          <h2 id="practice-title">{copy.practiceTitle}</h2>
        </div>
        <div className={styles.visionBody}>
          <p className={styles.lead}>{copy.practiceLead}</p>
          <ul className={styles.practiceFacts}>
            {copy.practiceFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className={styles.visionWide}>
          <PlayTeaser locale={locale} />
        </div>
      </section>

      <section id="agents" className={styles.writing} aria-labelledby="agents-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.agentsLabel}</p>
          <h2 id="agents-title">{copy.agentsTitle}</h2>
        </div>
        <div className={styles.agentList}>
          {copy.agents.map((agent) => (
            <article key={agent.callsign} className={styles.agentRow}>
              <span
                className={`${styles.agentMark} ${styles[`agentMark${agent.color}`]}`}
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
