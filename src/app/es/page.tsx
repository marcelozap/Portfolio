import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { GlowButton } from '@/components/ui/GlowButton';

export const metadata = {
  title: 'Marcelo Zapata | Fundador de XIV',
  description:
    'XIV es la compañía independiente de Marcelo Zapata para trading, investigación, tecnología y proyectos creativos.',
};

const PROJECTS = [
  {
    name: 'XIV',
    type: 'orquestación',
    text: 'Un sistema personal para conectar investigación, creatividad, movimiento y ejecución.',
    href: '/systems/xiv',
  },
  {
    name: 'Green Machine',
    type: 'mercados / investigación',
    text: 'Una forma de estudiar el mercado como arte: datos, movimiento, riesgo y atención.',
    href: '/systems/green-machine',
  },
  {
    name: 'MaloSound',
    type: 'música / señal',
    text: 'Una práctica de una canción al día convertida en análisis de audio y experimentos visuales.',
    href: '/systems/malosound',
  },
  {
    name: 'Rally',
    type: 'movimiento / práctica',
    text: 'Tecnología para observar el movimiento, recordar la práctica y aprender del cuerpo.',
    href: '/systems/rally',
  },
];

export default function SpanishHome() {
  return (
    <div className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <section id="home" className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
            <span className="size-1.5 rounded-full bg-signal-green" />
            <span className="text-accent">XIV</span>
            <span className="text-ink-faint">/</span>
            <span>compañía independiente / mercados / investigación / creatividad</span>
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[0.98] text-ink md:text-8xl">
            Fundador de XIV.
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-muted md:text-2xl">
            XIV es mi compañía independiente para trading, investigación, tecnología y proyectos
            creativos.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-accent/90 md:text-lg">
            Veo el mercado como una forma de arte: un sistema vivo e impredecible formado por datos,
            atención y cada persona que participa. La música es otro de mis lenguajes.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <GlowButton variant="primary" href="#projects">
              Explorar proyectos
              <ArrowRight className="size-4" />
            </GlowButton>
            <GlowButton variant="outline" href="#about">
              Acerca de XIV
            </GlowButton>
            <GlowButton variant="ghost" href="#contact">
              Contacto
              <Mail className="size-4" />
            </GlowButton>
            <GlowButton variant="ghost" href="#ai-blog">
              Blog de IA
            </GlowButton>
          </div>
        </section>

        <section
          id="projects"
          className="mt-32 border-y border-white/[0.08] py-16 md:mt-44 md:py-20"
        >
          <div className="max-w-4xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Proyectos
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
              Un campo. Cuatro formas de mirar.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
              Mercados, investigación, tecnología, música, movimiento y escritura, lo bastante cerca
              para informarse entre sí.
            </p>
          </div>

          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
            {PROJECTS.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="group bg-bg p-6 transition hover:bg-white/[0.035] md:p-8"
              >
                <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  <span className="text-accent">{project.type}</span>
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
                <h3 className="mt-9 font-display text-3xl text-ink md:text-4xl">{project.name}</h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-ink-muted">{project.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="about" className="border-b border-white/[0.08] py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Acerca de XIV
              </div>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight text-ink md:text-6xl">
                La tecnología debe dejar más espacio para vivir.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-ink-muted md:text-lg">
              <p>
                Mi experiencia une ingeniería de software, automatización de QA, flujos de datos,
                investigación de mercados, música y trabajo creativo.
              </p>
              <p>
                Construyo con estructura y evidencia, pero no separo esas disciplinas de la vida que
                les da sentido: nadar, caminar, escuchar, pensar, crear y volver a empezar.
              </p>
              <p className="text-ink">
                XIV es el lugar donde esas prácticas permanecen conectadas mientras se convierten en
                algo real.
              </p>
            </div>
          </div>
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

        <section id="contact" className="border-t border-white/[0.08] py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Contacto
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
              Hablemos de lo que estás construyendo.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-muted">
              XIV es independiente. El trabajo es público cuando puede serlo y privado cuando debe
              serlo.
            </p>
            <a
              href="mailto:xiv@marcelozapata.dev"
              className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-accent transition hover:text-ink"
            >
              <Mail className="size-4" />
              xiv@marcelozapata.dev
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
