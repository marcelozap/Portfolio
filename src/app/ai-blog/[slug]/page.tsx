import type { Metadata } from 'next';
import Image from 'next/image';
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
    ...(note?.image && {
      alternates: {
        canonical: `https://www.marcelozapata.dev/ai-blog/${note.slug}`,
      },
      openGraph: {
        type: 'article',
        title: note.title,
        description: note.summary,
        url: `https://www.marcelozapata.dev/ai-blog/${note.slug}`,
        siteName: 'Marcelo Zapata',
        publishedTime: note.date,
        authors: ['Marcelo Zapata'],
        images: [
          {
            url: `https://www.marcelozapata.dev${note.image.src}`,
            width: note.image.width,
            height: note.image.height,
            alt: note.image.alt,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: note.title,
        description: note.summary,
        images: [
          {
            url: `https://www.marcelozapata.dev${note.image.src}`,
            alt: note.image.alt,
          },
        ],
      },
    }),
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
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
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

        {note.image && (
          <figure className="mx-auto mt-12 max-w-2xl">
            <a href={note.image.src} aria-label={`Open the full-size image for ${note.title}`}>
              <Image
                src={note.image.src}
                alt={note.image.alt}
                width={note.image.width}
                height={note.image.height}
                sizes="(max-width: 768px) 100vw, 672px"
                className="h-auto w-full rounded-sm"
              />
            </a>
          </figure>
        )}

        <div className="field-note-body mt-12">
          {note.body.map((paragraph, index) => (
            <p key={`${note.slug}-${index}`}>{paragraph}</p>
          ))}
          {note.closing && <p className="field-note-closing">{note.closing}</p>}
        </div>

        {note.references && (
          <aside className="mt-10 text-sm leading-7 text-ink-muted" aria-label="Article sources">
            <h2 className="font-medium text-ink">Sources</h2>
            <ul className="mt-2 list-inside list-disc">
              {note.references.map((reference) => (
                <li key={reference.url}>
                  <a
                    href={reference.url}
                    className="text-accent underline underline-offset-4 hover:text-ink"
                  >
                    {reference.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

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
