'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Site-wide cinematic backdrop:
 *  - faint grid that fades into the void
 *  - two slow-drifting radial "lamps" tinted with theme accents
 *  - a film-grain layer for texture
 *
 * Rendered behind everything via fixed positioning + z-index 0.
 */
export function AmbientBackdrop() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* grid */}
      <div className="grid-bg absolute inset-0 opacity-[0.35]" />

      {/* drifting lamps */}
      {mounted && !reduce && (
        <>
          <motion.div
            className="absolute -left-40 top-10 size-[640px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent-glow) / 0.18), transparent 60%)',
            }}
            animate={{ x: [0, 60, -20, 0], y: [0, 30, -10, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-40 top-80 size-[560px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent-cool) / 0.16), transparent 60%)',
            }}
            animate={{ x: [0, -50, 30, 0], y: [0, -40, 20, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 size-[420px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent-warm) / 0.10), transparent 60%)',
            }}
            animate={{ x: [0, 30, -30, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* film grain */}
      <div
        className="absolute inset-0 bg-noise opacity-[0.18] mix-blend-overlay"
        style={{ backgroundSize: '160px 160px' }}
      />

      {/* top + bottom vignettes */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
