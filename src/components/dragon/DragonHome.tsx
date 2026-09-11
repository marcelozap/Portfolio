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
    enter: 'Market journal',
    read: 'Read my writing',
    scroll: 'More below',
    signature: 'Market structure / Execution / Risk',

    practiceLabel: '02 / Practice',
    practiceTitle: 'Dragon Scales.',
    practiceLead: 'Buy. Sell. Ride the tape.',
    practiceFacts: ['Free to play', 'Simulated prices', 'Virtual funds'],

    agentsLabel: '03 / XIV',
    agentsTitle: 'The dragons.',
    agents: [
      {
        name: 'Research Analyst',
        callsign: 'Atlas',
        color: 'gold',
      },
      {
        name: 'Quant Agent',
        callsign: 'Milo',
        color: 'green',
      },
      {
        name: 'Journal Coach',
        callsign: 'Echo',
        color: 'blue',
      },
      {
        name: 'Big Money Agent',
        callsign: 'Ledger',
        color: 'violet',
      },
    ],

    notesLabel: '01 / Writing',
    notesTitle: 'Research. Reflection.',
    notesBody: 'Personal essays on what I’m learning and living.',
    notesLink: 'Read my writing',
  },
  es: {
    eyebrow: 'Trader de opciones | XIV',
    premise: 'Todos son toros o osos.',
    first: 'Soy el',
    dragon: 'dragón.',
    intro:
      'Soy Marcelo. Mi trabajo se centra en estructura de mercado, ejecución, gestión del riesgo y revisión de resultados.',
    enter: 'Diario de mercado',
    read: 'Leer mis escritos',
    scroll: 'Más abajo',
    signature: 'Estructura / Ejecución / Riesgo',

    practiceLabel: '02 / Práctica',
    practiceTitle: 'Dragon Scales.',
    practiceLead: 'Compra. Vende. Sigue el movimiento.',
    practiceFacts: ['Gratis', 'Precios simulados', 'Fondos virtuales'],

    agentsLabel: '03 / XIV',
    agentsTitle: 'Los dragones.',
    agents: [
      {
        name: 'Research Analyst',
        callsign: 'Atlas',
        color: 'gold',
      },
      {
        name: 'Quant Agent',
        callsign: 'Milo',
        color: 'green',
      },
      {
        name: 'Journal Coach',
        callsign: 'Echo',
        color: 'blue',
      },
      {
        name: 'Big Money Agent',
        callsign: 'Ledger',
        color: 'violet',
      },
    ],

    notesLabel: '01 / Escritos',
    notesTitle: 'Investigar. Reflexionar.',
    notesBody: 'Ensayos personales sobre lo que aprendo y vivo.',
    notesLink: 'Leer mis textos',
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
          <Link href="/systems/xiv" className={styles.researchLink}>
            {locale === 'es' ? 'XIV · Investigación y análisis' : 'XIV · Research & analytics'}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
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
            <span>{locale === 'es' ? 'Diario de mercado' : 'Market journal'}</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <p className={styles.noteListLabel}>{locale === 'es' ? 'Recientes' : 'Latest writing'}</p>
          <ul className={styles.noteList}>
            {LATEST_NOTES.map((note) => (
              <li key={note.slug}>
                <Link href={`/ai-blog/${note.slug}`} className={styles.noteItem}>
                  <time className={styles.noteMeta} dateTime={note.date}>
                    {noteDate(note.date, locale)}
                  </time>
                  <span className={styles.noteTitle}>{note.title}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/ai-blog" className={styles.researchLink}>
            {locale === 'es' ? 'Todos mis escritos' : 'All writing'}
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
            <article key={agent.name} className={styles.agentRow}>
              <span
                className={`${styles.agentMark} ${styles[`agentMark${agent.color}`]}`}
                aria-hidden="true"
              >
                <Image
                  src="/brand/xiv-red-emblem.png"
                  alt=""
                  width={96}
                  height={96}
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
