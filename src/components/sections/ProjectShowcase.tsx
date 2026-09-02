import { Activity, Compass, Music2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_SYSTEMS } from '@/lib/public-systems';
import { SectionHeader } from '@/components/ui/SectionHeader';

const PROJECT_ICONS = {
  xiv: Sparkles,
  malosound: Music2,
  'green-machine': Compass,
  rally: Activity,
} as const;

export function ProjectShowcase() {
  return (
    <section id="projects" className="section">
      <SectionHeader
        eyebrow="Projects"
        title={
          <>
            One independent field.
            <br />
            <span className="text-gradient">Four ways of looking.</span>
          </>
        }
        description="Trading, research, technology, music, movement, and writing kept close enough to inform one another."
      />

      <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-2">
        {PUBLIC_SYSTEMS.map((project) => {
          const Icon = PROJECT_ICONS[project.slug as keyof typeof PROJECT_ICONS] ?? Sparkles;

          return (
            <Link
              key={project.slug}
              href={`/systems/${project.slug}`}
              className="group bg-bg p-6 transition hover:bg-white/[0.035] md:p-8"
            >
              <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                <span className="flex items-center gap-2 text-accent">
                  <Icon className="size-3.5" />
                  {project.domain}
                </span>
                <span>{project.status.replace('-', ' ')}</span>
              </div>
              <h3 className="mt-9 font-display text-3xl text-ink md:text-4xl">{project.name}</h3>
              <p className="mt-3 max-w-xl text-base leading-7 text-ink-muted">{project.tagline}</p>
              <p className="mt-5 max-w-xl text-sm leading-6 text-ink-faint">{project.laneNote}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent transition group-hover:translate-x-1">
                Open project
                <span aria-hidden>→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
