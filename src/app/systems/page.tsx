import Link from 'next/link';
import { ArrowRight, ExternalLink, Network } from 'lucide-react';
import { PUBLIC_SYSTEMS } from '@/lib/public-systems';

export const metadata = {
  title: 'Systems',
  description:
    'The systems Marcelo Zapata is building across AI, music, movement, data, and sport.',
};

const LANE_NOTES: Record<string, string> = {
  xiv: 'Orchestration, shared state, and multimodal experiments.',
  malosound: 'Music, audio analysis, performance visuals, and release work.',
  'green-machine': 'Data, evidence, research, and risk review.',
  rally: 'Movement, tennis, training, and computer vision.',
};

export default function SystemsPage() {
  return (
    <div className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          <Network className="size-4 text-accent" />
          <span className="text-accent">Work map</span>
          <span className="text-ink-faint">/</span>
          <span>Systems</span>
        </div>

        <div className="mt-8 max-w-4xl">
          <h1 className="font-display text-5xl leading-[0.98] text-ink md:text-7xl">
            Four lanes.
            <span className="text-gradient block">One way of working.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-muted md:text-xl">
            I build systems that turn messy inputs into something people can use: a decision, a
            creative output, a training signal, or a repeatable workflow.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {PUBLIC_SYSTEMS.map((project) => (
            <Link
              key={project.slug}
              href={`/systems/${project.slug}`}
              className="group border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-accent/40 hover:bg-white/[0.04] md:p-8"
            >
              <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                <span className="text-accent/80">{project.domain}</span>
                <span>{project.status.replace('-', ' ')}</span>
              </div>
              <h2 className="mt-8 font-display text-3xl text-ink md:text-4xl">{project.name}</h2>
              <p className="mt-3 text-base leading-7 text-ink-muted">{project.tagline}</p>
              <p className="mt-5 text-sm leading-6 text-ink-faint">{LANE_NOTES[project.slug]}</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-4 text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {project.stack.slice(0, 3).join(' · ')}
                </span>
                <span className="inline-flex items-center gap-2 text-accent transition group-hover:translate-x-1">
                  Open lane <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-5 text-sm text-ink-muted">
          <Link href="/field-notes" className="inline-flex items-center gap-2 hover:text-accent">
            Read the field notes <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com/marcelozap"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-accent"
          >
            Inspect the code <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
