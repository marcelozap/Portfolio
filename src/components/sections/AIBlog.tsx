import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FIELD_NOTES } from '@/lib/field-notes';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function AIBlog() {
  return (
    <section id="ai-blog" className="section">
      <SectionHeader
        eyebrow="AI Blog"
        title={
          <>
            Ideas I am still
            <br />
            <span className="text-gradient">testing in public.</span>
          </>
        }
        description="Writing about AI, work, attention, music, and the identities we build around what we know how to do."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {FIELD_NOTES.slice(0, 3).map((note) => (
          <Link
            key={note.slug}
            href={`/ai-blog/${note.slug}`}
            className="group border border-line bg-white/[0.02] p-6 transition hover:border-accent/45 hover:bg-accent/[0.04]"
          >
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <span className="flex items-center gap-2 text-accent">
                <BookOpen className="size-3.5" />
                {note.number}
              </span>
              <time dateTime={note.date}>{note.date}</time>
            </div>
            <h3 className="mt-8 font-display text-2xl text-ink">{note.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-muted">{note.summary}</p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm text-accent transition group-hover:text-ink">
              Read post <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
