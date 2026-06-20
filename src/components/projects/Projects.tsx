'use client';

import { useEffect, useState } from 'react';
import { PROJECTS, getProject, type Project } from '@/lib/projects';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';

/**
 * Projects section — the centerpiece. Cards open into the immersive modal.
 * Listens for a global `xiv:project:open` event so the command palette and
 * terminal can deep-link straight into a project.
 */
export function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const project = getProject(id);
      if (project) setActive(project);
    };
    window.addEventListener('xiv:project:open', handler);
    return () => window.removeEventListener('xiv:project:open', handler);
  }, []);

  return (
    <section id="projects" className="section">
      <SectionHeader
        eyebrow="Projects"
        title={
          <>
            Selected
            <br />
            <span className="text-gradient">work.</span>
          </>
        }
description="musxiv Artist OS. XIV$ Financial Research OS. Rally."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onOpen={() => setActive(p)} />
        ))}
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
