import { Mail } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function Contact() {
  return (
    <section id="contact" className="section border-t border-white/[0.08]">
      <SectionHeader
        eyebrow="Contact"
        title={
          <>
            Say hello to XIV.
            <br />
            <span className="text-gradient">Keep it human.</span>
          </>
        }
        description="For thoughtful conversations about markets, research, technology, music, movement, and ideas worth building."
      />

      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-y border-line py-6">
        <p className="max-w-xl text-sm leading-7 text-ink-muted">
          XIV is independent. The work is public where it can be, private where it should be, and
          always grounded in the thing being studied.
        </p>
        <a
          href="mailto:xiv@marcelozapata.dev"
          className="inline-flex items-center gap-3 text-sm font-medium text-accent transition hover:text-ink"
        >
          <Mail className="size-4" />
          xiv@marcelozapata.dev
        </a>
      </div>
    </section>
  );
}
