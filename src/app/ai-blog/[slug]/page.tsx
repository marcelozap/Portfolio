import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FIELD_NOTES, getFieldNote } from '@/lib/field-notes';

export function generateStaticParams() {
  return FIELD_NOTES.map((note) => ({ slug: note.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const note = getFieldNote(params.slug);
  return {
    title: note?.title ?? 'Field Note',
    description: note?.summary,
  };
}

export default function FieldNotePage({ params }: { params: { slug: string } }) {
  const note = getFieldNote(params.slug);
  if (!note) notFound();

  return (
    <article className="section pt-32 md:pt-40">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em]">
          <Link
            href="/ai-blog"
            className="inline-flex items-center gap-2 text-accent hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            All AI Blog posts
          </Link>
          <span className="text-ink-faint">{note.number}</span>
        </div>

        <header className="mt-14 border-b border-white/[0.1] pb-10">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
            <BookOpen className="size-4 text-accent" />
            <time dateTime={note.date}>{note.date}</time>
            {note.source && <span className="text-ink-faint">/ {note.source}</span>}
          </div>
          <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[0.98] text-ink md:text-7xl">
            {note.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-muted md:text-xl">
            {note.summary}
          </p>
        </header>

        <div className="field-note-body mt-12">
          {note.body.map((paragraph, index) => (
            <p key={`${note.slug}-${index}`}>{paragraph}</p>
          ))}
          {note.closing && <p className="field-note-closing">{note.closing}</p>}
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.1] pt-6">
          <Link
            href="/ai-blog"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to AI Blog
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent"
          >
            Contact XIV <ArrowRight className="size-4" />
          </Link>
        </footer>
      </div>
    </article>
  );
}
