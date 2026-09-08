import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PlayTeaser } from '@/components/play/PlayTeaser';
import styles from './DragonHome.module.css';

/**
 * Output of the XIV Ops paper demo (2026-09-04): synthetic data, paper mode,
 * deterministic templates, no model. Trimmed to one line per role so the
 * screens read at a glance; numbers are the demo's.
 */
const DESK_SAMPLE = {
  stamp: 'XIV Ops · paper demo · synthetic data · nothing trades without me',
  thesis: 'SPY long_put · entry zone 480 · wrong beyond 492 · drafted for review',
  quant: 'No comparable setups on file — the evidence stays honestly empty',
  journal: 'Fill 4.95 → exit 7.40 · +1.6R · rule violations: none',
};

const COPY = {
  en: {
    eyebrow: 'XIV / Trading · Research · Code',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro: 'I’m Marcelo. I trade my own money and build the tools behind my decisions.',
    enter: 'Play the practice game',
    read: 'Meet the agents',
    scroll: 'My practice',
    signature: 'Trading / Analysis / AI',
    practiceLabel: '01 / My practice',
    practiceTitle: 'My capital. My decisions.',
    practiceLead: 'Trading is the center of my work.',
    practiceBody: 'My own view. My own review. My own tools.',
    practiceFacts: ['Independent trading', 'Market research', 'Personal tools'],
    theoryLabel: '02 / The theories',
    theoryTitle: 'Questions worth testing.',
    theories: [
      { name: 'Momentum', text: 'When does a move keep going — and when does it fade?' },
      { name: 'Changing markets', text: 'When the market changes, when should I change my mind?' },
      { name: 'Risk', text: 'How much can I lose — and does the idea survive new data?' },
    ],
    agentsLabel: '03 / Agents for analysis',
    agentsTitle: 'Three agents.\nI make the calls.',
    agentsIntro: 'They draft. I review and decide.',
    sampleLabel: 'Output',
    agents: [
      { name: 'Research Analyst', role: 'The thesis', text: 'Drafts the idea being tested.' },
      {
        name: 'Quant Agent',
        role: 'The evidence',
        text: 'Keeps the numbers separate from the story.',
      },
      { name: 'Journal Coach', role: 'The review', text: 'Reviews the decision after the trade.' },
    ],
    engineeringLabel: '04 / Engineering & AI',
    engineeringTitle: 'The work behind it.',
    feats: [
      { name: 'Test automation', text: 'Repeatable UI tests with Playwright and Azure DevOps.' },
      { name: 'AI workflow tools', text: 'AI plugins for planning, test cases, and docs.' },
      { name: 'Data & integration', text: 'Python, SQL, and REST workflows for operational data.' },
    ],
    codeLink: 'Public GitHub projects',
    notesLabel: '05 / In my own words',
    notesTitle: 'Think for yourself.\nKeep building.',
    notesBody: 'What I’m learning, questioning, and building — on my own terms.',
    notesLink: 'Read my writing',
  },
  es: {
    eyebrow: 'XIV / Trading · Investigación · Código',
    premise: 'Todos son toros u osos.',
    first: 'Yo soy el',
    dragon: 'dragón.',
    intro:
      'Soy Marcelo. Opero con mi propio dinero y construyo las herramientas detrás de mis decisiones.',
    enter: 'Jugar al juego de práctica',
    read: 'Conocer los agentes',
    scroll: 'Mi práctica',
    signature: 'Trading / Análisis / IA',
    practiceLabel: '01 / Mi práctica',
    practiceTitle: 'Mi capital. Mis decisiones.',
    practiceLead: 'El trading es el centro de mi trabajo.',
    practiceBody: 'Mi propia visión. Mi propia revisión. Mis propias herramientas.',
    practiceFacts: ['Trading independiente', 'Investigación de mercados', 'Herramientas propias'],
    theoryLabel: '02 / Las teorías',
    theoryTitle: 'Preguntas para investigar.',
    theories: [
      { name: 'Momentum', text: '¿Cuándo continúa un movimiento y cuándo pierde fuerza?' },
      {
        name: 'Mercados que cambian',
        text: 'Cuando el mercado cambia, ¿cuándo debo cambiar de opinión?',
      },
      { name: 'Riesgo', text: '¿Cuánto puedo perder — y la idea resiste datos nuevos?' },
    ],
    agentsLabel: '03 / Agentes de análisis',
    agentsTitle: 'Tres agentes.\nYo tomo las decisiones.',
    agentsIntro: 'Ellos redactan. Yo reviso y decido.',
    sampleLabel: 'Salida',
    agents: [
      { name: 'Research Analyst', role: 'La tesis', text: 'Redacta la idea a prueba.' },
      { name: 'Quant Agent', role: 'La evidencia', text: 'Separa los números del relato.' },
      { name: 'Journal Coach', role: 'La revisión', text: 'Revisa la decisión después de operar.' },
    ],
    engineeringLabel: '04 / Ingeniería e IA',
    engineeringTitle: 'El trabajo detrás.',
    feats: [
      {
        name: 'Automatización de pruebas',
        text: 'Pruebas de interfaz repetibles con Playwright y Azure DevOps.',
      },
      {
        name: 'Herramientas con IA',
        text: 'Plugins de IA para planificación, casos de prueba y documentación.',
      },
      {
        name: 'Datos e integración',
        text: 'Flujos con Python, SQL y APIs REST para datos operativos.',
      },
    ],
    codeLink: 'Proyectos públicos en GitHub',
    notesLabel: '05 / Con mis propias palabras',
    notesTitle: 'Piensa por ti mismo.\nSigue construyendo.',
    notesBody: 'Lo que aprendo, cuestiono y construyo — a mi manera.',
    notesLink: 'Leer mis textos',
  },
};

const DESK_SAMPLES = [DESK_SAMPLE.thesis, DESK_SAMPLE.quant, DESK_SAMPLE.journal];

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
            <a href={playHref} className={styles.primaryLink}>
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
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.theoryLabel}</p>
            <h2 id="theories-title">{copy.theoryTitle}</h2>
          </div>
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
              <div>
                <p className={styles.bodyCopy}>{agent.text}</p>
                <blockquote className={styles.sample}>
                  <span>{copy.sampleLabel}</span>
                  {DESK_SAMPLES[i]}
                </blockquote>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.sampleStamp}>{DESK_SAMPLE.stamp}</p>
      </section>

      <section id="engineering" className={styles.engineering} aria-labelledby="engineering-title">
        <span id="experience" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.engineeringLabel}</p>
          <h2 id="engineering-title">{copy.engineeringTitle}</h2>
          <a
            href="https://github.com/marcelozap?tab=repositories"
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
