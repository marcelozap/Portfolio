import styles from '@/app/ai-blog/Writing.module.css';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FIELD_NOTES } from '@/lib/field-notes';

export const metadata = {
  title: 'Engineering Notes',
  description:
    'Engineering notes by Marcelo Zapata. Implementation notes on software, data validation, AI workflows, and creative computing.',
};

export default function FieldNotesPage() {
  return (
    <div className={`${styles.page} section pt-32 md:pt-40`}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          <BookOpen className="size-4 text-accent" />
          <span className="text-accent">Engineering notes</span>
          <span className="text-ink-faint">/</span>
          <span>Marcelo Zapata</span>
        </div>

        <div className="mt-8 max-w-3xl">
          <h1 className="font-display text-5xl leading-[0.98] text-ink md:text-7xl">
            Engineering <span className="text-ink">notes.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-ink-muted md:text-xl">
            Implementation notes on software, data validation, AI workflows, and creative computing.
          </p>
        </div>

        <div className="mt-14 border-t border-white/[0.08]">
          {FIELD_NOTES.map((note) => (
            <article
              key={note.slug}
              className="grid gap-5 border-b border-white/[0.08] py-8 md:grid-cols-[8rem_1fr_auto] md:items-start md:gap-8"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent/80">
                <div>{note.number}</div>
                <time className="mt-2 block text-ink-faint" dateTime={note.date}>
                  {note.date}
                </time>
              </div>
              <div>
                <h2 className="font-display text-3xl text-ink md:text-4xl">{note.title}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-ink-muted">{note.summary}</p>
                {note.source && (
                  <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    {note.source}
                  </div>
                )}
              </div>
              <Link
                href={`/ai-blog/${note.slug}`}
                className="inline-flex items-center gap-2 text-sm text-accent transition hover:text-ink md:pt-1"
              >
                Read note
                <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-ink-muted">
          <Link href="/#contact" className="inline-flex items-center gap-2 hover:text-accent">
            Contact Marcelo <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
