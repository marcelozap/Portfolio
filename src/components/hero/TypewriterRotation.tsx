'use client';

import { useEffect, useState } from 'react';

const PHRASES = [
  'Operational systems. Product instinct.',
  'Automation, analytics, and platform delivery.',
  'Building Rally, GATEKPT, and Green Machine.',
  'Ready for broader engineering ownership.',
];

/**
 * Rotates through the hero subtitle phrases with a typing + erasing rhythm.
 * Pure CSS-driven cursor blink keeps it cheap.
 */
export function TypewriterRotation() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause' | 'erasing'>('typing');

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (shown.length < phrase.length) {
        timer = setTimeout(() => setShown(phrase.slice(0, shown.length + 1)), 38);
      } else {
        timer = setTimeout(() => setPhase('pause'), 1600);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('erasing'), 600);
    } else {
      if (shown.length > 0) {
        timer = setTimeout(() => setShown(phrase.slice(0, shown.length - 1)), 18);
      } else {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [shown, phase, phraseIdx]);

  return (
    <span className="inline-flex items-baseline gap-[2px] font-mono text-sm tracking-wide text-ink-muted md:text-base">
      <span aria-live="polite">{shown}</span>
      <span
        aria-hidden
        className="inline-block h-[1.05em] w-[8px] -translate-y-[1px] bg-accent/80"
        style={{ animation: 'blink 1s steps(2) infinite' }}
      />
      <style jsx>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
