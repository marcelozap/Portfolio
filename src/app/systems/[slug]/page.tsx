import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PUBLIC_SYSTEMS, getPublicSystem } from '@/lib/public-systems';

export function generateStaticParams() {
  return PUBLIC_SYSTEMS.map((system) => ({ slug: system.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getPublicSystem(params.slug);
  return {
    title: project?.name ?? 'System',
    description: project?.tagline,
  };
}

export default function SystemPage({ params }: { params: { slug: string } }) {
  const project = getPublicSystem(params.slug);
  if (!project) notFound();

  return (
    <article className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/systems"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          All systems
        </Link>

        <header className="mt-14 max-w-4xl border-b border-white/[0.1] pb-10">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <span className="text-accent">{project.domain}</span>
            <span className="text-ink-faint">/</span>
            <span>{project.status.replace('-', ' ')}</span>
            <span className="text-ink-faint">/</span>
            <span>{project.year}</span>
          </div>
          <h1 className="mt-7 font-display text-6xl leading-[0.95] text-ink md:text-8xl">
            {project.name}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-ink-muted md:text-2xl">
            {project.tagline}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-lg leading-8 text-ink-muted">{project.description}</p>
            <div className="mt-12">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                What it holds
              </div>
              <ul className="mt-5 space-y-4">
                {project.coreIdeas.map((idea) => (
                  <li key={idea} className="flex gap-3 text-base leading-7 text-ink-muted">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-accent" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="border-l border-white/[0.1] pl-6 lg:pl-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              Built with
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li key={item} className="mono-tag normal-case tracking-wider">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-3 gap-3 border-y border-white/[0.1] py-5">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                    {metric.label}
                  </div>
                  <div className="mt-2 font-display text-base text-ink">{metric.value}</div>
                </div>
              ))}
            </div>

            {project.publicUrl && (
              <a
                href={project.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm text-accent hover:text-ink"
              >
                Visit public surface <ArrowUpRight className="size-4" />
              </a>
            )}
          </aside>
        </div>

        <section className="mt-16 border-t border-white/[0.1] pt-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Current shape
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {project.features.map((feature) => (
              <div key={feature.title} className="border border-white/[0.08] bg-white/[0.02] p-5">
                <h2 className="text-base font-medium text-ink">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-14 flex flex-wrap justify-between gap-4 border-t border-white/[0.1] pt-6">
          <Link
            href="/systems"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to systems
          </Link>
          <Link
            href="/ai-blog"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent"
          >
            Read the writing <ArrowUpRight className="size-4" />
          </Link>
        </footer>
      </div>
    </article>
  );
}
