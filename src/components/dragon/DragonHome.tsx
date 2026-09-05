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
      'I’m Marcelo. I’m building XIV: an options-practice game, market theories, and agents for analysis. The engineering serves the product.',
    enter: 'Explore XIV',
    read: 'Access & pricing',
    scroll: 'The product',
    signature: 'Trading / Analysis / AI',
    productLabel: '01 / The product',
    productTitle: 'Practice the decision.',
    productLead: 'A game for learning how you think about markets.',
    productBody:
      'Work through fictional price action with simulated funds. Advance at your own pace, record your reasoning, and review the decisions you made. XIV is in development.',
    productFacts: ['Options practice', 'Journal & review', '14 levels / month'],
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
    accessLabel: '05 / Product access',
    accessTitle: 'Built to keep practicing.',
    priceStatus: 'Planned pricing · In development',
    firstPayment: 'Initial payment',
    recurring: 'Then $14/month',
    priceDetail:
      '$100 initial access + the first $14 monthly period. Continued gameplay requires the monthly membership.',
    inclusions:
      'The planned membership includes monthly collections of 14 levels, a trading journal, review tools, and a private inbox with human replies.',
    availability: 'Membership is not open for purchase yet.',
    cancellation:
      'After a paid period ends, expired members retain access to read and export their records; continued play requires an active membership.',
    contact: 'Ask about XIV',
    emailSubject: 'XIV product access',
  },
  es: {
    eyebrow: 'XIV / Trading. Investigación. Criterio propio.',
    premise: 'Todos son toros u osos.',
    first: 'Yo soy el',
    dragon: 'dragón.',
    intro:
      'Soy Marcelo. Estoy construyendo XIV: un juego para practicar opciones, teorías de mercado y agentes de análisis. La ingeniería está al servicio del producto.',
    enter: 'Explorar XIV',
    read: 'Acceso y precio',
    scroll: 'El producto',
    signature: 'Trading / Análisis / IA',
    productLabel: '01 / El producto',
    productTitle: 'Practicar la decisión.',
    productLead: 'Un juego para conocer cómo piensas sobre los mercados.',
    productBody:
      'Explora precios ficticios con fondos simulados. Avanza a tu ritmo, registra tu razonamiento y revisa tus decisiones. XIV está en desarrollo.',
    productFacts: ['Práctica de opciones', 'Diario y revisión', '14 niveles / mes'],
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
    accessLabel: '05 / Acceso al producto',
    accessTitle: 'Seguir practicando.',
    priceStatus: 'Precio previsto · En desarrollo',
    firstPayment: 'Pago inicial',
    recurring: 'Después, $14/mes',
    priceDetail:
      '$100 de acceso inicial + el primer período mensual de $14. Seguir jugando requiere la membresía mensual.',
    inclusions:
      'La membresía prevista incluye colecciones mensuales de 14 niveles, diario de trading, herramientas de revisión y un buzón privado con respuestas humanas.',
    availability: 'La membresía todavía no está disponible para comprar.',
    cancellation:
      'Al terminar el período pagado, se conserva el acceso para leer y exportar los registros; seguir jugando requiere una membresía activa.',
    contact: 'Consultar sobre XIV',
    emailSubject: 'Acceso al producto XIV',
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
            <a href="#product" className={styles.primaryLink}>
              {copy.enter}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#access" className={styles.secondaryLink}>
              {copy.read}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroBottom}>
          <a href="#product">
            <ArrowDown size={15} aria-hidden="true" />
            {copy.scroll}
          </a>
          <span>{copy.signature}</span>
        </div>
      </section>

      <section id="product" className={styles.vision} aria-labelledby="product-title">
        <span id="vision" className={styles.anchorAlias} aria-hidden="true" />
        <span id="about" className={styles.anchorAlias} aria-hidden="true" />
        <span id="work" className={styles.anchorAlias} aria-hidden="true" />
        <span id="projects" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.productLabel}</p>
          <h2 id="product-title">{copy.productTitle}</h2>
        </div>
        <div className={styles.visionBody}>
          <p className={styles.lead}>{copy.productLead}</p>
          <p className={styles.bodyCopy}>{copy.productBody}</p>
          <ul className={styles.productFacts}>
            {copy.productFacts.map((fact) => (
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

      <section id="access" className={styles.access} aria-labelledby="access-title">
        <span id="contact" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.accessLabel}</p>
          <h2 id="access-title">{copy.accessTitle}</h2>
          <p className={styles.bodyCopy}>{copy.inclusions}</p>
        </div>
        <div className={styles.pricing}>
          <p className={styles.priceStatus}>{copy.priceStatus}</p>
          <p className={styles.priceLabel}>{copy.firstPayment}</p>
          <p className={styles.price}>
            $114 <span>USD</span>
          </p>
          <p className={styles.recurring}>{copy.recurring}</p>
          <p className={styles.bodyCopy}>{copy.priceDetail}</p>
          <p className={styles.availability}>{copy.availability}</p>
          <a
            href={`mailto:xiv@marcelozapata.dev?subject=${encodeURIComponent(copy.emailSubject)}`}
            className={styles.primaryLink}
          >
            {copy.contact}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <p className={styles.cancellation}>{copy.cancellation}</p>
        </div>
      </section>
    </div>
  );
}
