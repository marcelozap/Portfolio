import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import styles from './DragonHome.module.css';

const COPY = {
  en: {
    eyebrow: 'XIV / Trading. Research. Independent thinking.',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro:
      'I’m Marcelo. I trade, study markets, and build the tools behind my decisions. XIV is my independent research practice: theories, analysis agents, and experiments in code.',
    enter: 'Explore my research',
    read: 'Meet the agents',
    scroll: 'My practice',
    signature: 'Trading / Analysis / AI',
    practiceLabel: '01 / My practice',
    practiceTitle: 'My capital. My decisions.',
    practiceLead: 'Trading is the center of my work.',
    practiceBody:
      'I develop my own view of markets, review my decisions, and build tools that help me think more clearly. XIV brings that work together.',
    experiment:
      'The options-practice game is one of my personal experiments in development: fictional prices, simulated funds, and a journal for examining decisions.',
    practiceFacts: ['Independent trading', 'Market research', 'Personal tools'],
    theoryLabel: '02 / The theories',
    theoryTitle: 'Questions worth testing.',
    theoryIntro:
      'My research explores momentum, changing market conditions, and risk. These are ongoing research questions.',
    theories: [
      { name: 'Momentum', text: 'When does a move persist, and when does it lose strength?' },
      { name: 'Market regimes', text: 'How should a thesis change when market conditions change?' },
      {
        name: 'Risk & validation',
        text: 'How much risk does a theory require, and does it survive testing on later data?',
      },
    ],
    agentsLabel: '03 / Agents for analysis',
    agentsTitle: 'Different roles.\nReviewable reasoning.',
    agentsIntro:
      'A separate research desk in development supports my analysis. These agents produce drafts and context; I review the work and make the decisions.',
    agents: [
      {
        name: 'Research Analyst',
        role: 'The thesis',
        text: 'Drafts a research narrative from market context and the question being studied.',
      },
      {
        name: 'Quant Agent',
        role: 'The evidence',
        text: 'Calculates historical and statistical context, keeping the numbers separate from model-written interpretation.',
      },
      {
        name: 'Journal Coach',
        role: 'The review',
        text: 'Turns post-trade notes into a draft review of the reasoning and lessons.',
      },
    ],
    agentNote:
      'The practice game uses its own simulation engine. Agent-generated research is a separate workflow.',
    engineeringLabel: '04 / Engineering & AI',
    engineeringTitle: 'The work behind it.',
    engineeringIntro: 'A short version of what I’ve built.',
    feats: [
      {
        name: 'Test automation',
        text: 'Built Playwright and Azure DevOps workflows that turn manual checks into repeatable UI tests.',
      },
      {
        name: 'AI workflow tools',
        text: 'Created AI plugins for planning, work items, test cases, documentation, and summaries.',
      },
      {
        name: 'Data & integration',
        text: 'Built Python, SQL, and REST API workflows for collecting, validating, and connecting operational data.',
      },
    ],
    codeLink: 'Explore my code',
    notesLabel: '05 / In my own words',
    notesTitle: 'Think for yourself.\nKeep building.',
    notesBody:
      'I write about AI, technology, and the ideas that shape how I work. This is a record of what I’m learning, questioning, and building on my own terms.',
    notesLink: 'Read my writing',
  },
  es: {
    eyebrow: 'XIV / Trading. Investigación. Criterio propio.',
    premise: 'Todos son toros u osos.',
    first: 'Yo soy el',
    dragon: 'dragón.',
    intro:
      'Soy Marcelo. Hago trading, estudio los mercados y construyo las herramientas detrás de mis decisiones. XIV es mi práctica de investigación independiente: teorías, agentes de análisis y experimentos con código.',
    enter: 'Ver mi investigación',
    read: 'Conocer los agentes',
    scroll: 'Mi práctica',
    signature: 'Trading / Análisis / IA',
    practiceLabel: '01 / Mi práctica',
    practiceTitle: 'Mi capital. Mis decisiones.',
    practiceLead: 'El trading es el centro de mi trabajo.',
    practiceBody:
      'Desarrollo mi propia visión de los mercados, reviso mis decisiones y construyo herramientas que me ayudan a pensar con más claridad. XIV reúne ese trabajo.',
    experiment:
      'El juego para practicar opciones es uno de mis experimentos personales en desarrollo: precios ficticios, fondos simulados y un diario para examinar decisiones.',
    practiceFacts: ['Trading independiente', 'Investigación de mercados', 'Herramientas propias'],
    theoryLabel: '02 / Las teorías',
    theoryTitle: 'Preguntas para investigar.',
    theoryIntro:
      'Mi investigación explora el momentum, los cambios de mercado y el riesgo. Son preguntas de investigación abiertas.',
    theories: [
      { name: 'Momentum', text: '¿Cuándo continúa un movimiento y cuándo pierde fuerza?' },
      {
        name: 'Regímenes de mercado',
        text: '¿Cómo debe cambiar una tesis cuando cambian las condiciones del mercado?',
      },
      {
        name: 'Riesgo y validación',
        text: '¿Cuánto riesgo exige una teoría y resiste las pruebas con datos posteriores?',
      },
    ],
    agentsLabel: '03 / Agentes de análisis',
    agentsTitle: 'Distintos roles.\nRazonamiento revisable.',
    agentsIntro:
      'Un entorno de investigación independiente, en desarrollo, apoya mi análisis. Los agentes preparan borradores y contexto; yo reviso el trabajo y tomo las decisiones.',
    agents: [
      {
        name: 'Research Analyst',
        role: 'La tesis',
        text: 'Prepara un borrador de investigación a partir del contexto de mercado y la pregunta estudiada.',
      },
      {
        name: 'Quant Agent',
        role: 'La evidencia',
        text: 'Calcula contexto histórico y estadístico, separando los números de la interpretación escrita por un modelo.',
      },
      {
        name: 'Journal Coach',
        role: 'La revisión',
        text: 'Convierte las notas posteriores a una operación en un borrador de revisión del razonamiento y las lecciones.',
      },
    ],
    agentNote:
      'El juego de práctica usa su propio motor de simulación. La investigación con agentes es un flujo independiente.',
    engineeringLabel: '04 / Ingeniería e IA',
    engineeringTitle: 'El trabajo detrás.',
    engineeringIntro: 'Una versión breve de lo que he construido.',
    feats: [
      {
        name: 'Automatización de pruebas',
        text: 'Desarrollé flujos con Playwright y Azure DevOps para convertir revisiones manuales en pruebas de interfaz repetibles.',
      },
      {
        name: 'Herramientas con IA',
        text: 'Creé plugins de IA para planificación, tareas, casos de prueba, documentación y resúmenes.',
      },
      {
        name: 'Datos e integración',
        text: 'Desarrollé flujos con Python, SQL y APIs REST para recopilar, validar y conectar datos operativos.',
      },
    ],
    codeLink: 'Ver mi código',
    notesLabel: '05 / Con mis propias palabras',
    notesTitle: 'Piensa por ti mismo.\nSigue construyendo.',
    notesBody:
      'Escribo sobre IA, tecnología y las ideas que influyen en mi forma de trabajar. Es un registro de lo que aprendo, cuestiono y construyo a mi manera.',
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
            src="/brand/xiv-dragon-world.png"
            alt={
              locale === 'es'
                ? 'Dragón de XIV en violeta, magenta y cian sobre una ciudad nocturna.'
                : 'XIV’s violet, magenta, and cyan dragon above a city at night.'
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
            <a href="#theories" className={styles.primaryLink}>
              {copy.enter}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#agents" className={styles.secondaryLink}>
              {copy.read}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroBottom}>
          <a href="#practice">
            <ArrowDown size={15} aria-hidden="true" />
            {copy.scroll}
          </a>
          <span>{copy.signature}</span>
        </div>
      </section>

      <section id="practice" className={styles.vision} aria-labelledby="practice-title">
        <span id="product" className={styles.anchorAlias} aria-hidden="true" />
        <span id="vision" className={styles.anchorAlias} aria-hidden="true" />
        <span id="about" className={styles.anchorAlias} aria-hidden="true" />
        <span id="work" className={styles.anchorAlias} aria-hidden="true" />
        <span id="projects" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.practiceLabel}</p>
          <h2 id="practice-title">{copy.practiceTitle}</h2>
        </div>
        <div className={styles.visionBody}>
          <p className={styles.lead}>{copy.practiceLead}</p>
          <p className={styles.bodyCopy}>{copy.practiceBody}</p>
          <p className={styles.experiment}>{copy.experiment}</p>
          <ul className={styles.practiceFacts}>
            {copy.practiceFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="theories" className={styles.work} aria-labelledby="theories-title">
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.theoryLabel}</p>
            <h2 id="theories-title">{copy.theoryTitle}</h2>
          </div>
          <p className={styles.bodyCopy}>{copy.theoryIntro}</p>
        </div>
        <div className={styles.theories}>
          {copy.theories.map((theory, i) => (
            <article key={theory.name}>
              <span>0{i + 1}</span>
              <h3>{theory.name}</h3>
              <p className={styles.bodyCopy}>{theory.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="agents" className={styles.journal} aria-labelledby="agents-title">
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.agentsLabel}</p>
            <h2 id="agents-title">
              {copy.agentsTitle.split('\n').map((line) => (
                <span key={line}>{line} </span>
              ))}
            </h2>
          </div>
          <p className={styles.bodyCopy}>{copy.agentsIntro}</p>
        </div>
        <div className={styles.agentList}>
          {copy.agents.map((agent, i) => (
            <article className={styles.agentRow} key={agent.name}>
              <span className={styles.projectNumber}>0{i + 1}</span>
              <div>
                <p className={styles.agentRole}>{agent.role}</p>
                <h3>{agent.name}</h3>
              </div>
              <p className={styles.bodyCopy}>{agent.text}</p>
            </article>
          ))}
        </div>
        <p className={styles.researchNote}>{copy.agentNote}</p>
      </section>

      <section id="engineering" className={styles.engineering} aria-labelledby="engineering-title">
        <span id="experience" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.engineeringLabel}</p>
          <h2 id="engineering-title">{copy.engineeringTitle}</h2>
          <p className={styles.bodyCopy}>{copy.engineeringIntro}</p>
          <a
            href="https://github.com/marcelozap"
            target="_blank"
            rel="noreferrer"
            className={styles.secondaryLink}
          >
            {copy.codeLink}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <ul className={styles.feats}>
          {copy.feats.map((feat) => (
            <li key={feat.name}>
              <h3>{feat.name}</h3>
              <p className={styles.bodyCopy}>{feat.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="notes" className={styles.writing} aria-labelledby="notes-title">
        <span id="access" className={styles.anchorAlias} aria-hidden="true" />
        <span id="journal" className={styles.anchorAlias} aria-hidden="true" />
        <span id="ai-blog" className={styles.anchorAlias} aria-hidden="true" />
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
          <a href="/ai-blog" className={styles.primaryLink}>
            {copy.notesLink}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
