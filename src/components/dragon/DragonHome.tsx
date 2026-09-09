import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PlayTeaser } from '@/components/play/PlayTeaser';
import styles from './DragonHome.module.css';

type Theory = {
  title: string;
  question: string;
};

type Agent = {
  name: string;
  line: string;
  status: string;
};

type Engineering = {
  title: string;
  blurb: string;
};

const COPY = {
  en: {
    eyebrow: 'XIV / Trading · Research · Code',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro: 'I trade my own money and build the tools behind my decisions.',
    enter: 'Play the paper tape',
    read: 'Read my writing',
    scroll: 'More below',
    signature: 'Trading / Analysis / AI',

    practiceLabel: '01 / Practice',
    practiceTitle: 'My capital. My decisions.',
    practiceLead: 'One private game, every day.',
    practiceFacts: [
      'No live orders',
      'One song + one journal line a day',
      'Built for speed and focus',
    ],

    theoriesLabel: '02 / The theories',
    theoriesTitle: 'Questions worth testing.',
    theories: [
      {
        title: 'Momentum',
        question: 'When does a move keep going — and when does it fade?',
      },
      {
        title: 'Changing markets',
        question: 'When should I change my mind?',
      },
      {
        title: 'Risk',
        question: 'How much can I lose — and does the idea survive new data?',
      },
    ],

    agentsLabel: '03 / Meet the agents',
    agentsTitle: 'Three specialists. One edge.',
    agents: [
      {
        name: 'Research Analyst',
        line: 'Builds trade ideas from catalysts and structure.',
        status: 'Draft thesis first, then review before action.',
      },
      {
        name: 'Quant Agent',
        line: 'Checks probabilities, pricing, and position risk math.',
        status: 'Stops bad inputs before the plan goes live.',
      },
      {
        name: 'Journal Coach',
        line: 'Reviews fills and execution mistakes after each session.',
        status: 'Turns every session into the next lesson.',
      },
    ],
    agentsCta: 'Open private desk',

    notesLabel: '04 / In my own words',
    notesTitle: 'Think for yourself.\nKeep building.',
    notesBody: 'What I’m learning, testing, and changing, straight from the desk.',
    notesLink: 'Read my writing',

    engineeringLabel: '05 / Engineering & AI',
    engineeringTitle: 'The work behind it.',
    engineeringBlurb: 'All my work is public if you want to inspect it.',
    engineering: [
      {
        title: 'Test automation',
        blurb: 'Repeatable UI tests with Playwright and Azure DevOps.',
      },
      {
        title: 'AI workflow tools',
        blurb: 'AI plugins for planning, test cases, and docs.',
      },
      {
        title: 'Data & integration',
        blurb: 'Python, SQL, and REST workflows for operational data.',
      },
    ],
    engineeringLink: 'Public GitHub projects',
    engineeringHref: 'https://github.com/marcelozap?tab=repositories',

    accessLabel: '06 / Private access',
    accessTitle: 'Private by design.',
    accessBody: 'Owner-only desk for notes, playbooks, and review status.',
    accessLinkText: 'Open private desk',
    accessHref: '/desk',
  },
  es: {
    eyebrow: 'XIV / Trading · Investigación · Código',
    premise: 'Todos son toros o osos.',
    first: 'Soy el',
    dragon: 'dragón.',
    intro: 'Opero con mi propio dinero y construyo las herramientas de mis decisiones.',
    enter: 'Entrar al juego',
    read: 'Leer mis escritos',
    scroll: 'Más abajo',
    signature: 'Trading / Análisis / IA',

    practiceLabel: '01 / Práctica',
    practiceTitle: 'Mi capital. Mis decisiones.',
    practiceLead: 'Un juego privado, todos los días.',
    practiceFacts: [
      'Sin órdenes en vivo',
      'Una canción + nota diaria',
      'Pensado para foco y velocidad',
    ],

    theoriesLabel: '02 / Las teorías',
    theoriesTitle: 'Preguntas que importan.',
    theories: [
      {
        title: 'Momentum',
        question: '¿Cuándo sigue avanzando un movimiento y cuándo se agota?',
      },
      {
        title: 'Mercados cambiantes',
        question: '¿Cuándo debo cambiar de idea?',
      },
      {
        title: 'Riesgo',
        question: '¿Cuánto puedo perder y si la idea sobrevive a los nuevos datos?',
      },
    ],

    agentsLabel: '03 / Conoce a los agentes',
    agentsTitle: 'Tres especialistas. Un enfoque.',
    agents: [
      {
        name: 'Research Analyst',
        line: 'Construye ideas desde catalizadores y estructura.',
        status: 'Primero redacta la tesis, luego la revisa.',
      },
      {
        name: 'Quant Agent',
        line: 'Valida probabilidad, precio y riesgo de la posición.',
        status: 'Evita que datos sucios entren al plan.',
      },
      {
        name: 'Journal Coach',
        line: 'Revisa entradas/salidas y disciplina después de cada sesión.',
        status: 'Convierte cada sesión en una mejora clara.',
      },
    ],
    agentsCta: 'Abrir escritorio privado',

    notesLabel: '04 / En mis propias palabras',
    notesTitle: 'Piensa por ti mismo.\nSigue construyendo.',
    notesBody: 'Lo que aprendo, pruebo y cambio, desde la mesa de trading.',
    notesLink: 'Leer mis textos',

    engineeringLabel: '05 / Ingeniería & IA',
    engineeringTitle: 'El trabajo detrás.',
    engineeringBlurb: 'Todo mi trabajo es visible si quieres revisar el código.',
    engineering: [
      {
        title: 'Automatización de pruebas',
        blurb: 'Pruebas de UI repetibles con Playwright y Azure DevOps.',
      },
      {
        title: 'Flujos con IA',
        blurb: 'Plugins para planificación, casos de prueba y documentación.',
      },
      {
        title: 'Datos e integración',
        blurb: 'Python, SQL y flujos REST para datos operativos.',
      },
    ],
    engineeringLink: 'Proyectos públicos en GitHub',
    engineeringHref: 'https://github.com/marcelozap?tab=repositories',

    accessLabel: '06 / Acceso privado',
    accessTitle: 'Privado por diseño.',
    accessBody: 'Escritorio privado para notas, playbooks y estado de revisión.',
    accessLinkText: 'Abrir escritorio privado',
    accessHref: '/desk',
  },
};

export function DragonHome({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const copy = COPY[locale];
  const playHref = locale === 'es' ? '/es/play' : '/play';

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="dragon-title">
        <div className={styles.art}>
          <Image
            src="/brand/xiv-dragon-world.png"
            alt={
              locale === 'es'
                ? 'Dragón de XIV sobre una ciudad nocturna.'
                : 'XIV dragon over a night city.'
            }
            fill
            priority
            sizes="(max-width: 760px) 800px, 1800px"
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
          <div className={styles.actions}>
            <Link href={playHref} className={styles.primaryLink}>
              {copy.enter}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
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

      <section id="theories" className={styles.work} aria-labelledby="theories-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.theoriesLabel}</p>
          <h2 id="theories-title">{copy.theoriesTitle}</h2>
        </div>
        <div className={styles.theories}>
          {copy.theories.map((item: Theory) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <h3>{item.question}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="agents" className={styles.writing} aria-labelledby="agents-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.agentsLabel}</p>
          <h2 id="agents-title">{copy.agentsTitle}</h2>
        </div>
        <div className={styles.agentList}>
          {copy.agents.map((agent: Agent) => (
            <article key={agent.name} className={styles.agentRow}>
              <p className={styles.agentRole}>{agent.name}</p>
              <h3>{agent.line}</h3>
              <p className={styles.agentStatus}>{agent.status}</p>
            </article>
          ))}
        </div>
        <div className={styles.writingBody}>
          <Link href="/desk" className={styles.primaryLink}>
            {copy.agentsCta}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
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
          <p className={styles.bodyCopy}>{copy.notesBody}</p>
          <Link href="/ai-blog" className={styles.primaryLink}>
            {copy.notesLink}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="engineering" className={styles.writing} aria-labelledby="engineering-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.engineeringLabel}</p>
          <h2 id="engineering-title">{copy.engineeringTitle}</h2>
        </div>
        <div className={styles.writingBody}>
          <p className={styles.bodyCopy}>{copy.engineeringBlurb}</p>
          <ul className={styles.feats}>
            {copy.engineering.map((item: Engineering) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p className={styles.bodyCopy}>{item.blurb}</p>
              </li>
            ))}
          </ul>
          <Link href={copy.engineeringHref} className={styles.primaryLink}>
            {copy.engineeringLink}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="access" className={styles.writing} aria-labelledby="access-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.accessLabel}</p>
          <h2 id="access-title">{copy.accessTitle}</h2>
        </div>
        <div className={styles.writingBody}>
          <p className={styles.bodyCopy}>{copy.accessBody}</p>
          <Link href={copy.accessHref} className={styles.primaryLink}>
            {copy.accessLinkText}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
