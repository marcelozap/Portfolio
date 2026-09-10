import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PlayTeaser } from '@/components/play/PlayTeaser';
import styles from './DragonHome.module.css';

const COPY = {
  en: {
    eyebrow: 'Options Trader | XIV',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro:
      'I’m Marcelo. My work centers on market structure, execution, risk management, and performance review.',
    enter: 'My market perspective',
    read: 'Read my writing',
    scroll: 'More below',
    signature: 'Market structure / Execution / Risk',

    practiceLabel: '02 / Practice',
    practiceTitle: 'Dragon Tape.',
    practiceLead: 'Buy. Sell. Ride the tape.',
    practiceFacts: ['Free to play', 'Simulated prices', 'Virtual funds'],

    agentsLabel: '03 / The dragons',
    agentsTitle: 'Future ideas.',
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

    notesLabel: '01 / Perspective',
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
    enter: 'Mi perspectiva del mercado',
    read: 'Leer mis escritos',
    scroll: 'Más abajo',
    signature: 'Estructura / Ejecución / Riesgo',

    practiceLabel: '02 / Práctica',
    practiceTitle: 'Dragon Tape.',
    practiceLead: 'Compra. Vende. Sigue el movimiento.',
    practiceFacts: ['Gratis', 'Precios simulados', 'Fondos virtuales'],

    agentsLabel: '03 / Los dragones',
    agentsTitle: 'Ideas para el futuro.',
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

    notesLabel: '01 / Perspectiva',
    notesTitle: 'Investigar. Reflexionar.',
    notesBody: 'Ensayos personales sobre lo que aprendo y vivo.',
    notesLink: 'Leer mis textos',
  },
};

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
        </div>
        <div className={styles.writingBody}>
          <a
            href="https://malosound.ai/"
            className={styles.marketLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>MaloSound.ai</span>
            <span>{locale === 'es' ? 'Mi perspectiva del mercado' : 'My market perspective'}</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <p className={styles.bodyCopy}>{copy.notesBody}</p>
          <Link href="/ai-blog" className={styles.primaryLink}>
            {copy.notesLink}
            <ArrowUpRight size={18} aria-hidden="true" />
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
