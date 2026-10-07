import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const FEATURED_NOTE_SLUGS = [
  'before-i-trust-a-backtest-i-check-the-data',
  'my-big-bet',
  'coding-beats',
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
              ? 'Ingeniería de software · Automatización · Validación de datos'
              : 'Software Engineering · Automation · Data Validation'}
          </p>
          <h1 id="dragon-title" className={styles.title}>
            Marcelo Zapata<em>.</em>
          </h1>
          <p className={styles.philosophy}>
            {isSpanish
              ? 'Soy Marcelo Zapata. Automatizo procesos, informes y pruebas de software, y compruebo que los datos lleguen correctamente de un sistema a otro. Mi experiencia abarca operaciones de almacén y distribución, integraciones y QA manual y automatizado.'
              : 'I’m Marcelo Zapata. I automate workflows, reports, and software testing, and verify that data moves correctly between systems. My experience spans warehouse and distribution operations, integrations, and manual and automated QA.'}
          </p>
          <div className={styles.actions}>
            <a href="#experience" className={styles.primaryLink}>
              {isSpanish ? 'Ver mi experiencia' : 'View my experience'}{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="mailto:xiv@marcelozapata.dev" className={styles.secondaryLink}>
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
            <time>{isSpanish ? 'Jul–Ago 2026' : 'Jul–Aug 2026'}</time>
            <h3>Sr Quality Assurance Engineer</h3>
            <p>
              {isSpanish
                ? 'Pruebas manuales y automatizadas, coordinación de casos de prueba y validación de datos y APIs. Flujos de calidad con Playwright, Azure Pipelines, SQL y asistencia de IA.'
                : 'Manual and automated testing, test-case coordination, and data and API validation. Quality workflows using Playwright, Azure Pipelines, SQL, and AI assistance.'}
            </p>
          </li>
          <li>
            <time>May 2025–Jul 2026</time>
            <h3>Software Engineer</h3>
            <p>
              {isSpanish
                ? 'Desarrollo y modernización de APIs e integraciones para inventario, pedidos, facturas y almacenes. Investigación de errores y comprobación de que los datos del backend llegaran correctamente a los sistemas y reportes posteriores.'
                : 'Built and modernized inventory APIs and integration services for ordering, invoicing, and warehouse systems. Investigated failures and checked that backend data reached downstream systems and reports correctly.'}
            </p>
          </li>
          <li>
            <time>{isSpanish ? 'Dic 2022–May 2025' : 'Dec 2022–May 2025'}</time>
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
          <h2 id="work-title">{isSpanish ? 'Herramientas que construyo.' : 'Tools I build.'}</h2>
          <p className={styles.bodyCopy}>
            {isSpanish
              ? 'Automatización de procesos, validación de datos y herramientas de investigación.'
              : 'Workflow automation, data validation, and research tools.'}
          </p>
        </div>
        <div className={styles.projectList}>
          <Link href="/systems/automation" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Automatización y validación' : 'Automation and validation'}</h3>
              <p>
                {isSpanish
                  ? 'Procesos de almacén y distribución, informes automatizados, comprobaciones de datos y pruebas de software. Mi experiencia y las herramientas que uso.'
                  : 'Warehouse and distribution workflows, automated reports, data checks, and software testing. My experience and the tools I use.'}
              </p>
              <span>{isSpanish ? 'Ver experiencia ↗' : 'View experience ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
          <a href="/systems/xiv" target="_blank" rel="noreferrer" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Software de investigación' : 'Research software'}</h3>
              <p>
                {isSpanish
                  ? 'XIV Capital reúne mi investigación de opciones y las herramientas que construyo para apoyarla.'
                  : 'XIV Capital brings together my options research and the tools I build to support it.'}
              </p>
              <span>{isSpanish ? 'Ver el proyecto ↗' : 'View project ↗'}</span>
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
              <h3>{isSpanish ? 'Validación de datos' : 'Data validation'}</h3>
              <p>
                {isSpanish
                  ? 'Comprobaciones en Python de campos faltantes, cobertura y calidad de cotizaciones, con ejemplos sintéticos y límites documentados.'
                  : 'Python checks for missing fields, coverage, and quote quality, with synthetic fixtures and documented limitations.'}
              </p>
              <span>{isSpanish ? 'Ver método y resultados ↗' : 'Read method and results ↗'}</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <Link href="/ai-blog/i-had-a-dream" className={styles.project}>
            <div>
              <h3>{isSpanish ? 'Flujos de trabajo con IA' : 'AI-assisted workflows'}</h3>
              <p>
                {isSpanish
                  ? 'Un enfoque de tareas acotadas con IA, criterios de aceptación, pruebas y revisión humana.'
                  : 'An approach to bounded AI tasks, acceptance criteria, tests, and human review.'}
              </p>
              <span>{isSpanish ? 'Leer la nota ↗' : 'Read the note ↗'}</span>
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
              ? 'Soy ingeniero de software especializado en automatización de procesos e informes, validación de datos y pruebas. Busco oportunidades en automatización, QA e infraestructura de pruebas donde pueda aportar mi experiencia en operaciones de almacén y distribución.'
              : 'I’m a software engineer focused on workflow and report automation, data validation, and testing. I’m interested in automation, QA, and test infrastructure roles where I can apply my experience in warehouse and distribution operations.'}
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
            <a href="mailto:xiv@marcelozapata.dev" className={styles.contactLink}>
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
