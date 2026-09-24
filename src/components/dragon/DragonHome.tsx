import { XivCapitalLockup } from '@/components/brand/XivCapitalLockup';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const FEATURED_NOTE_SLUGS = [
  'i-had-a-dream',
  'the-chat-box-is-only-the-top-floor',
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
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="dragon-title">
        <div className={styles.heroCopy}>
          <div className={styles.heroIdentity}>
            <XivCapitalLockup width={124} showCapital={false} title="XIV" />
          </div>
          <p className={styles.eyebrow}>Software · AI · Data · Sound</p>
          <h1 id="dragon-title" className={styles.title}>
            Marcelo Zapata.
          </h1>
          <p className={styles.philosophy}>
            {isSpanish
              ? 'Construyo sistemas fiables para el trabajo real y escribo canciones en inglés y español.'
              : 'I build reliable systems for real work and write songs in English and Spanish.'}
          </p>
          <p className={styles.intro}>
            {isSpanish
              ? 'Ingeniero de software, constructor de herramientas de IA y compositor.'
              : 'Software engineer, AI builder, and songwriter.'}
          </p>
          <div className={styles.actions}>
            <a
              href="https://github.com/marcelozap"
              target="_blank"
              rel="noreferrer"
              className={styles.primaryLink}
            >
              GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href="https://marcelozapata.com"
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryLink}
            >
              {isSpanish ? 'Escuchar música' : 'Listen to my music'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section
        id="notes"
        className={`${styles.writing} ${styles.selectedWriting}`}
        aria-labelledby="notes-title"
      >
        <span id="contact" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '01 / Escritos' : '01 / Writing'}</p>
          <h2 id="notes-title">{isSpanish ? 'Lo que estoy aprendiendo.' : 'What I’m learning.'}</h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Notas sobre construir con software, IA y atención humana.'
              : 'Notes on building with software, AI, and human attention.'}
          </p>
        </div>
        <div className={styles.writingBody}>
          <ul className={styles.noteList}>
            {FEATURED_NOTES.map((note) => (
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
            {isSpanish ? 'Leer todos los escritos' : 'Read all writing'}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="work" className={styles.writing} aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '02 / Trabajo' : '02 / Work'}</p>
          <h2 id="work-title">
            {isSpanish ? 'Sistemas que se pueden usar.' : 'Systems people can use.'}
          </h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Software práctico, automatización de calidad y flujos de trabajo con IA.'
              : 'Practical software, quality automation, and AI-enabled workflows.'}
          </p>
        </div>
        <div className={styles.projectList}>
          <a
            href="https://github.com/marcelozap"
            target="_blank"
            rel="noreferrer"
            className={styles.project}
          >
            <div>
              <h3>{isSpanish ? 'Automatización de calidad' : 'Quality automation'}</h3>
              <p>
                {isSpanish
                  ? 'Playwright, pruebas de API y sistemas repetibles para que los equipos puedan entregar con confianza.'
                  : 'Playwright, API checks, and repeatable test systems that help teams ship with confidence.'}
              </p>
              <span>GitHub ↗</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <a
            href="https://github.com/marcelozap"
            target="_blank"
            rel="noreferrer"
            className={styles.project}
          >
            <div>
              <h3>{isSpanish ? 'Datos e integraciones' : 'Data and integrations'}</h3>
              <p>
                {isSpanish
                  ? 'Python, SQL, REST y flujos que hacen que los sistemas sean más claros y fáciles de confiar.'
                  : 'Python, SQL, REST, and practical workflows that make systems easier to understand and trust.'}
              </p>
              <span>GitHub ↗</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <Link href="/ai-blog/i-had-a-dream" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Sistemas de trabajo con IA' : 'AI work systems'}</h3>
              <p>
                {isSpanish
                  ? 'Documentos, ciclos de agentes y revisiones que mantienen el juicio en manos de la persona.'
                  : 'Documents, agent loops, and reviewable workflows that keep judgment with the human.'}
              </p>
              <span>{isSpanish ? 'Leer la nota ↗' : 'Read the note ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="sound" className={styles.writing} aria-labelledby="sound-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '03 / Sonido' : '03 / Sound'}</p>
          <h2 id="sound-title">
            {isSpanish
              ? 'Canciones y el espacio para hacerlas.'
              : 'Songs and the space around them.'}
          </h2>
        </div>
        <div className={styles.projectList}>
          <a
            href="https://marcelozapata.com"
            target="_blank"
            rel="noreferrer"
            className={styles.project}
          >
            <div>
              <h3>Marcelo Zapata</h3>
              <p>
                {isSpanish
                  ? 'Canciones en inglés y español. Guitarra y voz primero; el resto sirve a la canción.'
                  : 'Songs in English and Spanish. Guitar and voice first; everything else serves the song.'}
              </p>
              <span>marcelozapata.com ↗</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <a
            href="https://malosound.ai"
            target="_blank"
            rel="noreferrer"
            className={styles.project}
          >
            <div>
              <h3>MaloSound.ai</h3>
              <p>
                {isSpanish
                  ? 'Un espacio de trabajo para encontrar la historia, grabar la toma y construir el sonido.'
                  : 'A music workbench for finding the story, recording the take, and building the sound.'}
              </p>
              <span>malosound.ai ↗</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="about" className={styles.writing} aria-labelledby="about-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '04 / Sobre mí' : '04 / About'}</p>
          <h2 id="about-title">Marcelo Zapata.</h2>
        </div>
        <div className={styles.aboutCopy}>
          <p>
            {isSpanish
              ? 'Soy ingeniero de software y compositor. Me interesa el punto donde las herramientas precisas, la evidencia y la expresión humana se encuentran.'
              : 'I’m a software engineer and songwriter. I’m interested in the point where precise tools, evidence, and human expression meet.'}
          </p>
          <p>
            {isSpanish
              ? 'Este sitio reúne mi trabajo de ingeniería y mis notas. La música vive en marcelozapata.com; MaloSound.ai es el espacio de trabajo para construirla.'
              : 'This site gathers my engineering work and notes. The music lives at marcelozapata.com; MaloSound.ai is the workbench for building it.'}
          </p>
          <Link href="/systems/xiv" className={styles.archiveLink}>
            {isSpanish ? 'Archivo de investigación anterior' : 'Older research archive'}{' '}
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
