import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { FIELD_NOTES } from '@/lib/field-notes';
import styles from './DragonHome.module.css';

const COPY = {
  en: {
    eyebrow: 'XIV / An independent point of view',
    premise: 'Everyone is a bull or a bear.',
    first: 'I am the',
    dragon: 'dragon.',
    intro:
      'I’m Marcelo. XIV is where I study markets, build with technology, and make music. This is my world, in the making.',
    enter: 'Explore my world',
    read: 'Read the journal',
    scroll: 'Keep exploring',
    signature: 'Markets / Technology / Music',
    visionLabel: '01 / The vision',
    visionTitle: 'The dragon is me.',
    visionLead: 'I see connections. Then I make something with them.',
    visionBody:
      'Trading is an art form to me. Music is another language. Software gives me a way to experiment with both. XIV brings these practices together, with room to learn and change direction.',
    verbs: ['Observe', 'Create', 'Build'],
    workLabel: '02 / The work',
    workTitle: 'One world.\nDifferent forms.',
    workIntro: 'The ideas take shape through research, sound, movement, and working code.',
    projects: [
      {
        name: 'XIV',
        lane: 'Markets & systems',
        description: 'Research, experiments, and the independent vision connecting the work.',
        href: '/systems/xiv',
        color: 'pink',
      },
      {
        name: 'MaloSound',
        lane: 'Music & sound',
        description:
          'Original music, audio analysis, and a daily practice of making and listening.',
        href: '/systems/malosound',
        color: 'gold',
      },
      {
        name: 'Rally',
        lane: 'Movement & practice',
        description: 'Computer vision and tools for observing movement and learning from practice.',
        href: '/systems/rally',
        color: 'cyan',
      },
    ],
    projectAction: 'Explore',
    journalLabel: '03 / The journal',
    journalTitle: 'Thinking in public.',
    journalIntro: 'Notes on AI, technology, attention, and the world I’m learning to see.',
    journalAll: 'All writing',
    contactLabel: '04 / Connect',
    contactTitle: 'Ideas welcome.',
    contactBody: 'Markets, music, technology—or something that crosses all three.',
    noteLanguage: '',
  },
  es: {
    eyebrow: 'XIV / Una mirada independiente',
    premise: 'Todos son toros u osos.',
    first: 'Yo soy el',
    dragon: 'dragón.',
    intro:
      'Soy Marcelo. XIV es donde estudio los mercados, construyo con tecnología y hago música. Este es mi mundo, en construcción.',
    enter: 'Explorar mi mundo',
    read: 'Leer el diario',
    scroll: 'Seguir explorando',
    signature: 'Mercados / Tecnología / Música',
    visionLabel: '01 / La visión',
    visionTitle: 'El dragón soy yo.',
    visionLead: 'Veo conexiones. Después creo algo con ellas.',
    visionBody:
      'Para mí, el trading es una forma de arte. La música es otro lenguaje. El software me permite experimentar con ambos. XIV reúne estas prácticas, con espacio para aprender y cambiar de dirección.',
    verbs: ['Observar', 'Crear', 'Construir'],
    workLabel: '02 / Los proyectos',
    workTitle: 'Un mundo.\nDistintas formas.',
    workIntro: 'Las ideas toman forma en la investigación, el sonido, el movimiento y el código.',
    projects: [
      {
        name: 'XIV',
        lane: 'Mercados y sistemas',
        description:
          'Investigación, experimentos y la visión independiente que conecta el trabajo.',
        href: '/systems/xiv',
        color: 'pink',
      },
      {
        name: 'MaloSound',
        lane: 'Música y sonido',
        description:
          'Música original, análisis de audio y una práctica diaria de crear y escuchar.',
        href: '/systems/malosound',
        color: 'gold',
      },
      {
        name: 'Rally',
        lane: 'Movimiento y práctica',
        description:
          'Visión por computadora y herramientas para observar el movimiento y aprender de la práctica.',
        href: '/systems/rally',
        color: 'cyan',
      },
    ],
    projectAction: 'Explorar',
    journalLabel: '03 / El diario',
    journalTitle: 'Pensar en público.',
    journalIntro: 'Notas sobre IA, tecnología, atención y el mundo que estoy aprendiendo a ver.',
    journalAll: 'Todos los textos',
    contactLabel: '04 / Conectar',
    contactTitle: 'Las ideas son bienvenidas.',
    contactBody: 'Mercados, música, tecnología o algo que conecte las tres.',
    noteLanguage: 'Artículos en inglés',
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
                ? 'Dragón de XIV en violeta, magenta y cian, enroscado sobre una ciudad nocturna.'
                : 'XIV’s violet, magenta, and cyan dragon coiled above a city at night.'
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
            <a href="#work" className={styles.primaryLink}>
              {copy.enter}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#journal" className={styles.secondaryLink}>
              {copy.read}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.heroBottom}>
          <a href="#vision">
            <ArrowDown size={15} aria-hidden="true" />
            {copy.scroll}
          </a>
          <span>{copy.signature}</span>
        </div>
      </section>

      <section id="vision" className={styles.vision} aria-labelledby="vision-title">
        <span id="about" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{copy.visionLabel}</p>
          <h2 id="vision-title">{copy.visionTitle}</h2>
        </div>
        <div className={styles.visionBody}>
          <p className={styles.lead}>{copy.visionLead}</p>
          <p className={styles.bodyCopy}>{copy.visionBody}</p>
          <ol className={styles.verbs}>
            {copy.verbs.map((verb, i) => (
              <li key={verb}>
                <span>0{i + 1}</span>
                {verb}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="work" className={styles.work} aria-labelledby="work-title">
        <span id="projects" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.workLabel}</p>
            <h2 id="work-title">
              {copy.workTitle.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          <p className={styles.bodyCopy}>{copy.workIntro}</p>
        </div>
        <div className={styles.projectList}>
          {copy.projects.map((project, i) => (
            <Link
              href={project.href}
              key={project.name}
              className={styles.project}
              data-accent={project.color}
            >
              <span className={styles.projectNumber}>0{i + 1}</span>
              <div className={styles.projectName}>
                <p>{project.lane}</p>
                <h3>{project.name}</h3>
              </div>
              <p className={styles.projectDescription}>{project.description}</p>
              <span className={styles.projectAction}>
                {copy.projectAction}
                <ArrowUpRight size={23} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="journal" className={styles.journal} aria-labelledby="journal-title">
        <span id="ai-blog" className={styles.anchorAlias} aria-hidden="true" />
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{copy.journalLabel}</p>
            <h2 id="journal-title">{copy.journalTitle}</h2>
            <p className={styles.bodyCopy}>{copy.journalIntro}</p>
          </div>
          <Link href="/ai-blog" className={styles.secondaryLink}>
            {copy.journalAll}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {copy.noteLanguage && <p className={styles.noteLanguage}>{copy.noteLanguage}</p>}
        <div className={styles.notes} lang="en">
          {FIELD_NOTES.slice(0, 3).map((note) => (
            <Link key={note.slug} href={`/ai-blog/${note.slug}`} className={styles.note}>
              <div className={styles.noteMeta}>
                <span>{note.number}</span>
                <time dateTime={note.date}>{note.date}</time>
              </div>
              <h3>{note.title}</h3>
              <ArrowUpRight size={21} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section id="contact" className={styles.contact} aria-labelledby="contact-title">
        <p className={styles.eyebrow}>{copy.contactLabel}</p>
        <h2 id="contact-title">{copy.contactTitle}</h2>
        <p className={styles.bodyCopy}>{copy.contactBody}</p>
        <a href="mailto:xiv@marcelozapata.dev" className={styles.email}>
          xiv@marcelozapata.dev
          <ArrowUpRight aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
