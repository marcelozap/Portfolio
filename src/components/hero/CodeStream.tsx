'use client';

import { motion } from 'framer-motion';

/**
 * Floating fragments of code/console output that drift in the hero space.
 * Pure DOM (no canvas) — small enough to be cheap, big enough to feel alive.
 */
const FRAGMENTS = [
  { x: '8%', y: '20%', text: 'await iterate();', delay: 0 },
  { x: '78%', y: '14%', text: 'systems.compose()', delay: 0.4 },
  { x: '14%', y: '74%', text: '// late · focused · calm', delay: 0.8 },
  { x: '82%', y: '70%', text: 'while (curious) { build() }', delay: 1.2 },
  { x: '46%', y: '88%', text: 'discipline.compound++', delay: 1.6 },
  { x: '64%', y: '36%', text: 'render(idea)', delay: 2.0 },
];

export function CodeStream() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {FRAGMENTS.map((f, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-[11px] tracking-wide text-ink-faint"
          style={{ left: f.x, top: f.y }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 0.65, 0.4, 0.65], y: [6, -2, 2, -2] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            delay: f.delay,
            ease: 'easeInOut',
          }}
        >
          {f.text}
        </motion.span>
      ))}
    </div>
  );
}
