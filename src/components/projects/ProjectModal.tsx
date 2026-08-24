'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Project } from '@/lib/projects';
import { ProjectVisual } from './ProjectVisual';
import { cn } from '@/lib/utils';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const ACCENT_TEXT: Record<Project['accent'], string> = {
  cyan: 'text-accent',
  amber: 'text-ink',
  violet: 'text-ink',
  green: 'text-ink',
};

const DOMAIN_LABEL: Record<Project['domain'], string> = {
  markets: 'research systems',
  game: 'practice system',
  systems: 'systems',
  infra: 'infrastructure',
};

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-development': 'active build',
  prototype: 'working prototype',
  research: 'research',
  'computer-vision': 'computer vision',
};

/**
 * Immersive project modal. Locks body scroll, traps escape to close, and
 * renders the project visual at the top with content below.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pb-4 pt-20 md:px-8 md:pb-8 md:pt-24"
        >
          <button
            aria-label="Close project"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-bg/80 backdrop-blur-xl"
          />

          <motion.div
            role="dialog"
            aria-label={`${project.name} details`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="glass-strong relative z-10 flex max-h-[calc(100dvh-6rem)] w-full max-w-5xl flex-col overflow-hidden md:max-h-[calc(100dvh-8rem)]"
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-[2px] border border-line bg-bg/60 text-ink-muted backdrop-blur-md transition hover:border-accent/40 hover:text-ink"
            >
              <X className="size-4" />
            </button>

            <ProjectVisual project={project} />

            <div className="grid gap-8 overflow-y-auto p-6 md:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="mono-tag tracking-[0.22em]">
                    {DOMAIN_LABEL[project.domain]} / {STATUS_LABEL[project.status]}
                  </span>
                  <span className="font-mono text-[10px] text-ink-faint">
                    {project.id === 'gatekpt' ? 'GATEKPT.AI' : `/portfolio/projects/${project.id}`}{' '}
                    / {project.year}
                  </span>
                </div>

                <h2
                  className={cn(
                    'mt-3 font-display text-3xl md:text-5xl',
                    ACCENT_TEXT[project.accent],
                  )}
                >
                  {project.name}
                </h2>
                <p className="mt-2 text-base text-ink-muted md:text-lg">{project.tagline}</p>

                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-base">
                  {project.description}
                </p>

                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-[2px] border border-line bg-white/[0.03] px-3 py-2 text-sm font-medium text-ink-muted transition hover:border-accent/40 hover:text-ink"
                  >
                    Open page
                    <ExternalLink className="size-3.5" />
                  </a>
                )}

                <div className="mt-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                    core ideas
                  </div>
                  <ul className="mt-3 space-y-2">
                    {project.coreIdeas.map((idea) => (
                      <li key={idea} className="flex gap-3 text-sm text-ink-muted">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                    features
                  </div>
                  <div className="mt-3 space-y-3">
                    {project.features.map((f) => (
                      <div
                        key={f.title}
                        className="rounded-[2px] border border-line bg-white/[0.02] p-4"
                      >
                        <div className="text-sm font-medium text-ink">{f.title}</div>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                          {f.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                    stack
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <li key={s} className="mono-tag normal-case tracking-wider">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-[2px] border border-line bg-white/[0.02] p-4">
                  {project.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                        {m.label}
                      </div>
                      <div className="mt-1 font-display text-lg tabular-nums text-ink">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
