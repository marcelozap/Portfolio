import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const FEATURED_NOTE_SLUGS = [
  'from-chatting-with-ai-to-working-with-it',
  'before-i-trust-a-backtest-i-check-the-data',
  'ai-is-an-addictive-product-on-a-subscription',
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
          <p className={styles.eyebrow}>
            {isSpanish
              ? 'Ingeniero de software sénior | IA y automatización | Ingeniería de datos'
              : 'Senior Software Engineer | AI & Automation | Data Engineering'}
          </p>
          <h1 id="dragon-title" className={styles.title}>
            Marcelo Zapata<em>.</em>
          </h1>
          <p className={styles.philosophy}>
            {isSpanish
              ? 'Soy ingeniero de software sénior y graduado de Florida State University, con casi cuatro años de experiencia en ingeniería de software en Publix. Desarrollé integraciones empresariales, apoyé flujos de datos e informes y lideré iniciativas de automatización entre equipos de desarrollo. Mis proyectos personales incluyen aplicaciones para iOS y herramientas de IA.'
              : 'I’m a senior software engineer and Florida State University graduate with nearly four years of software engineering experience at Publix. I built enterprise integrations, supported data and reporting workflows, and led automation initiatives across development teams. My personal projects include custom iOS apps and AI tools.'}
          </p>
          <div className={styles.actions}>
            <a href="#experience" className={styles.primaryLink}>
              {isSpanish ? 'Ver mi experiencia' : 'View my experience'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="mailto:mzapata.music@icloud.com" className={styles.secondaryLink}>
              {isSpanish ? 'Contactarme' : 'Contact me'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroFoot}>
          <span>
            {isSpanish
              ? 'Marcelo Zapata / Ingeniería de software'
              : 'Marcelo Zapata / Software engineering'}
          </span>
          <a href="#work">{isSpanish ? 'Ideas en práctica ↓' : 'Ideas into practice ↓'}</a>
        </div>
      </section>

      <section id="experience" className={styles.writing} aria-labelledby="experience-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '01 / Experiencia' : '01 / Experience'}</p>
          <h2 id="experience-title">
            {isSpanish ? 'Software en el mundo real.' : 'Software in the real world.'}
          </h2>
          <p className={styles.bodyCopy}>Publix Super Markets · 2022–2026</p>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Automatización de procesos e informes, validación de datos y pruebas en operaciones reales.'
              : 'Workflow and report automation, data validation, and testing in real operations.'}
          </p>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Power Apps y Power Automate para procesos operativos. SQL, Azure Databricks y Azure Data Lake para comprobar datos. Power BI para informes. Azure Pipelines, Playwright y Selenium para pruebas repetibles.'
              : 'Power Apps and Power Automate for operational workflows. SQL, Azure Databricks, and Azure Data Lake for data checks. Power BI for reporting. Azure Pipelines, Playwright, and Selenium for repeatable testing.'}
          </p>
          <Link href="/systems/automation" className={styles.archiveLink}>
            {isSpanish ? 'Ver automatización y validación' : 'Explore automation and validation'}{' '}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <ol className={styles.experienceList}>
          <li>
            <time>{isSpanish ? 'May 2025–Ago 2026' : 'May 2025–Aug 2026'}</time>
            <h3>Senior Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Lideré flujos de calidad y entrega asistidos por IA en cuatro equipos de desarrollo. Desarrollé procesos de validación y automatización con Playwright, Azure DevOps CI/CD, SQL, APIs REST, Kafka e informes estructurados, además de materiales de formación y prácticas reutilizables de IA.'
                : 'Led AI-assisted quality and delivery workflows across four development teams. Built validation and automation processes using Playwright, Azure DevOps CI/CD, SQL, REST APIs, Kafka, and structured reporting, alongside reusable AI workflows and onboarding materials.'}
            </p>
          </li>
          <li>
            <time>May 2024–May 2025</time>
            <h3>Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Desarrollo y modernización de APIs e integraciones para inventario, pedidos, facturas y almacenes. Investigación de errores y comprobación de que los datos del backend llegaran correctamente a los sistemas y reportes posteriores.'
                : 'Built and modernized inventory APIs and integration services for ordering, invoicing, and warehouse systems. Investigated failures and checked that backend data reached downstream systems and reports correctly.'}
            </p>
          </li>
          <li>
            <time>{isSpanish ? 'Dic 2022–May 2024' : 'Dec 2022–May 2024'}</time>
            <h3>Associate Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Casos de prueba y pruebas de campo para sistemas de grúas y cintas transportadoras, incluidas instalaciones de alimentos congelados. Apoyo a la modernización de aplicaciones locales hacia herramientas en el navegador.'
                : 'Wrote test cases and performed field testing for crane and conveyor systems, including frozen-food facilities. Supported modernization from on-premises applications to browser-based tools.'}
            </p>
          </li>
        </ol>
      </section>

      <section id="work" className={styles.writing} aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '02 / Proyectos' : '02 / Projects'}</p>
          <h2 id="work-title">
            {isSpanish ? 'Proyectos que puedes explorar.' : 'Projects you can explore.'}
          </h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Una vista previa de Vela Tennis, un juego de opciones y notas sobre cómo construyo con IA.'
              : 'A Vela Tennis preview, a playable options game, and notes on building with AI.'}
          </p>
        </div>
        <div className={styles.projectList}>
          <Link href="/vela-tennis" className={styles.project}>
            <div>
              <h3>Vela Tennis</h3>
              <p>
                {isSpanish
                  ? 'Una aplicación de tenis para iOS. Actualmente está bajo revisión en la App Store; la página incluye un video de gameplay.'
                  : 'A custom iOS tennis app currently under App Store review, with a gameplay preview you can watch.'}
              </p>
              <span>{isSpanish ? 'Ver gameplay ↗' : 'Watch gameplay ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
          <Link href="/play" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Dragon Scales' : 'Dragon Scales'}</h3>
              <p>
                {isSpanish
                  ? 'Un juego de mercado de opciones con precios simulados, riesgo y fondos virtuales.'
                  : 'A playable options-market game with simulated prices, risk, and virtual funds.'}
              </p>
              <span>{isSpanish ? 'Jugar ↗' : 'Play the game ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
          <Link href="/ai-blog" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'AI Blog' : 'AI Blog'}</h3>
              <p>
                {isSpanish
                  ? 'Notas sobre ingeniería de software, automatización, datos y el cambio hacia trabajar con agentes de IA.'
                  : 'Notes on software engineering, automation, data, and the shift toward working with AI agents.'}
              </p>
              <span>{isSpanish ? 'Leer las notas ↗' : 'Read the notes ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        id="notes"
        className={`${styles.writing} ${styles.selectedWriting}`}
        aria-labelledby="notes-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '03 / Escritos' : '03 / Writing'}</p>
          <h2 id="notes-title">
            {isSpanish ? 'Notas sobre software y mercados.' : 'Notes on software and markets.'}
          </h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Calidad de datos, herramientas de investigación y lo que aprendo al construir.'
              : 'Data quality, research tools, and what I learn while building.'}
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

      <section id="about" className={styles.writing} aria-labelledby="about-title">
        <span id="contact" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{isSpanish ? '04 / Sobre mí' : '04 / About'}</p>
          <h2 id="about-title">Marcelo Zapata.</h2>
        </div>
        <div className={styles.aboutCopy}>
          <p>
            {isSpanish
              ? 'Soy graduado de Florida State University con formación en informática y negocios. Mi trabajo abarca aplicaciones, APIs, datos, IA y automatización. Busco oportunidades de ingeniería de software para construir sistemas útiles y responsabilizarme de su fiabilidad.'
              : 'I graduated from Florida State University with a background in computer science and business. My work spans application development, APIs, data workflows, AI, and automation. I’m interested in software engineering roles where I can build useful systems and take responsibility for their reliability.'}
          </p>
          <p>
            {isSpanish
              ? 'Trabajo con Python, SQL, C#/.NET, JavaScript/TypeScript y PowerShell. También puedo configurar agentes de IA. Elijo scripts, herramientas de automatización o agentes según lo que requiera el proceso, su coste y su mantenimiento.'
              : 'I work with Python, SQL, C#/.NET, JavaScript/TypeScript, and PowerShell. I can also configure AI agents. I choose scripts, workflow tools, or agents according to the process, cost, and maintenance needs.'}
          </p>
          <p>
            {isSpanish
              ? 'Este sitio documenta mi investigación y mis herramientas. Comparto mi proceso personal; no gestiono dinero de terceros ni ofrezco asesoramiento de inversión.'
              : 'This site documents my research and tools. I share my personal process; I do not manage other people’s money or provide investment advice.'}
          </p>
          <p>
            <a href="mailto:mzapata.music@icloud.com" className={styles.contactLink}>
              {isSpanish ? 'Hablemos' : 'Get in touch'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </p>
          <Link href="/systems/xiv" className={styles.archiveLink}>
            {isSpanish ? 'Investigación XIV Capital' : 'XIV Capital research'}{' '}
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
