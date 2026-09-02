import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

export const metadata = {
  title: 'Marcelo Zapata en español',
  description:
    'Infraestructura de IA y flujos de agentes para organizaciones, equipos, educadores y creadores.',
};

const WORK_AREAS = [
  {
    title: 'Operaciones de negocio',
    text: 'Agentes para recibir clientes, procesar pedidos, responder preguntas y dar seguimiento.',
  },
  {
    title: 'Software y calidad',
    text: 'Documentación, QA, pruebas, revisión y entrega para equipos de ingeniería.',
  },
  {
    title: 'Enseñanza y conocimiento',
    text: 'Lecciones, ejemplos, práctica y materiales que un equipo realmente puede usar.',
  },
  {
    title: 'Marketing y creación',
    text: 'Contexto de marca, planificación de contenido, dirección creativa y revisión.',
  },
];

const WAYS_TO_WORK = [
  [
    'Llamada de estrategia',
    'Una conversación enfocada para encontrar dónde la IA puede ayudar de verdad.',
  ],
  [
    'Auditoría de flujo',
    'Mapeo del trabajo actual, oportunidades de IA, riesgos y próximos pasos.',
  ],
  ['Prototipo de agente', 'Un flujo útil construido con archivos, herramientas y revisión real.'],
  [
    'Apoyo continuo',
    'Acompañamiento mensual para revisar casos nuevos y mantener el sistema útil.',
  ],
];

export default function SpanishHome() {
  return (
    <div className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <section id="home" className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
            <span className="size-1.5 rounded-full bg-signal-green" />
            <span className="text-accent">Marcelo Zapata</span>
            <span className="text-ink-faint">/</span>
            <span>sistemas de IA / flujos de trabajo</span>
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[0.98] text-ink md:text-8xl">
            Infraestructura de IA para el <span className="text-gradient">trabajo real.</span>
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-muted md:text-2xl">
            Construyo sistemas de IA basados en roles y flujos de agentes para organizaciones,
            equipos, educadores y personas que están creando algo propio.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-muted">
            No son chatbots vacíos ni una herramienta genérica para todos. Diseño alrededor del
            trabajo real: contexto, archivos, herramientas, decisiones, revisión y resultados.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <GlowButton variant="primary" href="#offers">
              Trabajemos juntos
              <ArrowRight className="size-4" />
            </GlowButton>
            <GlowButton variant="outline" href="#experience">
              Ver experiencia
            </GlowButton>
            <GlowButton variant="ghost" href="#ai-blog">
              Blog de IA
            </GlowButton>
          </div>
        </section>

        <section
          id="experience"
          className="mt-32 border-y border-white/[0.08] py-16 md:mt-44 md:py-20"
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Experiencia
              </div>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight text-ink md:text-6xl">
                Aprendí a construir dentro de sistemas grandes. Ahora los hago más útiles.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-ink-muted md:text-lg">
              <p>
                Pasé cuatro años dentro de la organización tecnológica de una empresa Fortune 100,
                antes, durante y después de su adopción de herramientas de desarrollo asistidas por
                IA.
              </p>
              <p>
                Mi trabajo conectó ingeniería de software, automatización de QA, flujos de datos,
                documentación, enseñanza y entrega asistida por IA. También llevo diez años
                enseñando conceptos complejos de una forma que las personas pueden usar.
              </p>
              <p className="text-ink">
                La lección fue simple: la IA solo sirve cuando encaja con el rol, el flujo y las
                personas responsables del resultado.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Dónde construyo
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
              Entender el trabajo. Después, construir el sistema alrededor.
            </h2>
          </div>
          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
            {WORK_AREAS.map((area) => (
              <article key={area.title} className="bg-bg p-6 md:p-8">
                <h3 className="font-display text-2xl text-ink">{area.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-ink-muted">{area.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="offers" className="border-y border-white/[0.08] py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Trabajemos juntos
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
              Empieza con el trabajo. Mantén el apoyo.
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              La mayoría de los proyectos comienzan con un trabajo puntual. El apoyo continuo está
              disponible cuando quieres un compañero para mantener el sistema en movimiento.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {WAYS_TO_WORK.map(([title, text]) => (
              <article key={title} className="border border-line bg-white/[0.02] p-6 md:p-8">
                <h3 className="font-display text-2xl text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{text}</p>
              </article>
            ))}
          </div>
          <a
            href="mailto:xiv@marcelozapata.dev"
            className="mt-10 inline-flex items-center gap-3 border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-ink transition hover:bg-accent/15"
          >
            <Mail className="size-4 text-accent" />
            xiv@marcelozapata.dev
          </a>
        </section>

        <section id="ai-blog" className="py-16 md:py-20">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Blog de IA
              </div>
              <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
                Ideas que todavía estoy probando en público.
              </h2>
              <p className="mt-5 text-lg leading-8 text-ink-muted">
                Escribo sobre IA, trabajo, atención, música y la vida que la tecnología debería
                dejar espacio para vivir.
              </p>
            </div>
            <Link
              href="/es/ai-blog/i-had-a-dream"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-ink"
            >
              Leer la nota más reciente
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
