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
          <p className={styles.eyebrow}>Software · AI · Data · Sound</p>
          <h1 id="dragon-title" className={styles.title}>
            Marcelo
            <br />
            <em>Zapata.</em>
          </h1>
          <p className={styles.philosophy}>
            {isSpanish
              ? 'Construyo herramientas, escribo y hago música. Este es el espacio donde comparto lo que voy aprendiendo.'
              : 'I build tools, write, and make music. This is where I share what I’m learning along the way.'}
          </p>
          <div className={styles.actions}>
            <a href="#work" className={styles.primaryLink}>
              {isSpanish ? 'Explorar mi trabajo' : 'Explore my work'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
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
        <div className={styles.heroFoot}>
          <span>{isSpanish ? 'Un cuaderno abierto' : 'An open notebook'}</span>
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

      <section
        id="sound"
        className={`${styles.writing} ${styles.soundSection}`}
        aria-labelledby="sound-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '04 / Sonido' : '04 / Sound'}</p>
          <h2 id="sound-title">
            {isSpanish
              ? 'Canciones y el espacio para hacerlas.'
              : 'Songs and the space around them.'}
          </h2>
          <div className={styles.soundWave} aria-hidden="true">
            {Array.from({ length: 35 }, (_, index) => (
              <span
                key={index}
                style={{
                  height: `${18 + Math.round(Math.abs(Math.sin(index * 0.67)) * Math.sin(((index + 1) / 36) * Math.PI) * 82)}%`,
                }}
              />
            ))}
          </div>
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
          <p className={styles.eyebrow}>{isSpanish ? '05 / Sobre mí' : '05 / About'}</p>
          <h2 id="about-title">Marcelo Zapata.</h2>
        </div>
        <div className={styles.aboutCopy}>
          <p>
            {isSpanish
              ? 'Soy ingeniero de software y trabajo de forma independiente. Me interesan los sistemas fiables, las ideas claras y el proceso de crear: desde herramientas hasta escritos y sonido.'
              : 'I’m a software engineer building independently. I’m interested in reliable systems, clear thinking, and the process of making things—from tools to writing and sound.'}
          </p>
          <p>
            {isSpanish
              ? 'Este sitio reúne mi trabajo de ingeniería y mis notas. La música vive en marcelozapata.com; MaloSound.ai es el espacio de trabajo para construirla.'
              : 'This site gathers my engineering work and notes. The music lives at marcelozapata.com; MaloSound.ai is the workbench for building it.'}
          </p>
          <p>
            <a href="mailto:xiv@marcelozapata.dev" className={styles.contactLink}>
              {isSpanish ? 'Hablemos' : 'Get in touch'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
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
