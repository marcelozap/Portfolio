import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tuve un sueño',
  description:
    'Un experimento sobre agentes de IA, visión humana y el trabajo que merece seguir siendo nuestro.',
};

const AGENT_STEPS = [
  'Leer el dream file.',
  'Revisar el repositorio actual.',
  'Elegir una tarea acotada.',
  'Escribir el código.',
  'Correr las pruebas.',
  'Revisar los cambios.',
  'Documentar lo que pasó.',
  'Dejar un registro y reportar bloqueos.',
];

const PARAGRAPHS = [
  'Anoche yo dormí. Mi código no.',
  'El Día 2 no se trata realmente de "agentes de IA trabajaron mientras yo dormía".',
  'Eso es solo el titular.',
  'El cambio profundo es que la IA cambia el lugar del humano en el trabajo.',
  'El trabajo del humano no es desgastarse junto a la máquina para siempre. Es sostener el sueño con suficiente claridad para que el sistema construya hacia él.',
  'La mayoría ya tiene la parte difícil en la cabeza: cómo toma decisiones, qué le importa, cómo se ve el buen trabajo, qué no debería pasar nunca, qué información importa antes de actuar, cómo revisa los errores y cómo sabe que algo está terminado.',
  'Solo que está regado entre la memoria, los chats, los documentos, las carpetas y los hábitos.',
  'La idea técnica es simple.',
  'El dream file es la fuente de verdad del estado final. No es solo un prompt. Es el contrato operativo del proyecto. Les dice a los agentes en qué se debe convertir el sistema, qué importa, qué límites no se pueden cruzar y cómo se debe sentir lo "terminado".',
  'Los agentes corren los ciclos alrededor de ese contrato:',
  'Un horario corre esos ciclos durante la noche.',
  'Ninguno ha pedido un aumento. Todavía.',
  'No es magia. El sistema comete errores. Reviso cada par de horas, encuentro problemas, redirijo y vuelvo a mi vida.',
  'Antes pasaba dieciséis horas al día frente a una pantalla. Vi mi salud deteriorarse y lo llamé ética de trabajo.',
  'Dieciséis horas frente a una pantalla no es humano. Cortar papas sí.',
  'El cambio profundo es que la IA cambia el lugar del humano en el trabajo.',
  'Mi trabajo no es desgastarme junto a la máquina para siempre. Mi trabajo es sostener la visión con suficiente claridad para que el sistema construya hacia ella, y después decidir si el resultado vale la pena.',
  'Para este proyecto, el dream file guarda más que ingeniería. Guarda el mundo, a Rosco, la mañana después de nadar, la música, la razón por la que el proyecto existe y los límites que nunca se deben cruzar.',
  'Los agentes pueden ejecutar. No pueden decidir qué es significativo.',
  'No saben por qué importa la caminata. No saben por qué la música tiene que sentirse como volver a mi cuerpo. No saben por qué quiero volver a casa y pararme en una cocina tranquila cortando papas antes de que abra el mercado.',
  'Esa parte sigue siendo mía.',
  'La parte del sueño también es real. El mío se estaba disolviendo cuando desperté, así que abrí ChatGPT y lo conté. Un detalle jalaba al siguiente. Al final, algo que habría desaparecido antes del almuerzo se convirtió en una entrada estructurada que puedo buscar.',
  'Eso me dio la próxima construcción pequeña: un diario de sueños con IA.',
  'Sueño → Conversación → Entrada estructurada → Memoria buscable',
  'Ayer escribí: elige un problema real, construye algo pequeño, documenta lo que aprendes.',
  'Esto es hacerlo.',
  'El repositorio me dice qué existe.',
  'El dream file me dice qué debería existir.',
  'Los registros me dicen qué cambió.',
  'Mi trabajo es la visión y el veredicto. La IA hace el trabajo entre esas dos decisiones.',
  'Día 2 documentando lo que aprendo construyendo con IA. Mañana: el diario de sueños, paso a paso.',
  '¿Cuál es la parte de tu trabajo que solo tú puedes hacer?',
  'Hay papas que cortar y un documental de Alejandro Magno que ver.',
  'Él también delegaba.',
];

export default function SpanishDreamNote() {
  return (
    <article className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em]">
          <Link
            href="/es#ai-blog"
            className="inline-flex items-center gap-2 text-accent hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Blog de IA
          </Link>
          <span className="text-ink-faint">NOTE 008</span>
        </div>

        <header className="mt-14 border-b border-white/[0.1] pb-10">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
            <BookOpen className="size-4 text-accent" />
            <time dateTime="2026-09-02">2026-09-02</time>
            <span className="text-ink-faint">/ BLOG DE IA</span>
          </div>
          <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[0.98] text-ink md:text-7xl">
            Tuve un sueño
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-muted md:text-xl">
            Un experimento tranquilo: dejar que los agentes de IA lleven la ejecución repetible
            mientras una persona sostiene la visión, el criterio y la vida alrededor del trabajo.
          </p>
        </header>

        <div className="field-note-body mt-12">
          {PARAGRAPHS.slice(0, 10).map((paragraph, index) => (
            <p key={`dream-intro-${index}`}>{paragraph}</p>
          ))}

          <ol className="my-8 list-decimal space-y-2 pl-6">
            {AGENT_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          {PARAGRAPHS.slice(10).map((paragraph, index) => (
            <p key={`dream-outro-${index}`}>{paragraph}</p>
          ))}

          <p className="field-note-closing">
            MI TRABAJO ES LA VISIÓN. LA IA HACE EL TRABAJO ENTRE DECISIONES.
          </p>
          <p className="mt-8 border-t border-white/[0.08] pt-8 text-sm text-ink-muted">
            Ven a construir conmigo:{' '}
            <a className="text-accent hover:text-ink" href="mailto:xiv@marcelozapata.dev">
              xiv@marcelozapata.dev
            </a>
          </p>
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.1] pt-6">
          <Link
            href="/es"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
          <Link
            href="/ai-blog/i-had-a-dream"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent"
          >
            Leer en inglés <ArrowRight className="size-4" />
          </Link>
        </footer>
      </div>
    </article>
  );
}
