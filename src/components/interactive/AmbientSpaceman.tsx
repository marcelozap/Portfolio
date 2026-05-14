'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Spaceman } from '@/components/sections/SpacemanScene';

/**
 * AmbientSpaceman — the back-facing astronaut + mirror reflection rendered
 * as a persistent ambient figure pinned to the right of the viewport.
 *
 * Lives behind all content (z-index 5 — above the AmbientBackdrop, below the
 * scrim that protects text). Decorative only: pointer-events: none, hidden
 * from a11y tree, suppressed under prefers-reduced-motion *or* a very narrow
 * viewport so it never crowds mobile content.
 *
 * The figure breathes, drifts on a slow vertical sine, and gently rolls with
 * page scroll so it feels alive across the entire site.
 */
export function AmbientSpaceman() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  // gate on viewport width — don't render the figure on mobile / tablet
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // pointer parallax — softer than the in-section version so it stays calm
  useEffect(() => {
    if (!enabled || reduce) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({
        x: Math.max(-1, Math.min(1, nx)) * 0.5,
        y: Math.max(-1, Math.min(1, ny)) * 0.5,
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, reduce]);

  // scroll-driven rotation (very subtle — quarter-degree per viewport)
  const { scrollY } = useScroll();
  const rollUntyped = useTransform(scrollY, [0, 4000], [0, -6]);

  // generate dust once
  const dust = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 70,
        y: Math.random() * 100,
        size: Math.random() * 1.4 + 0.4,
        delay: Math.random() * 6,
        duration: 10 + Math.random() * 14,
        opacity: 0.18 + Math.random() * 0.4,
      })),
    [],
  );

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 z-[5] hidden w-[42vw] max-w-[640px] lg:block"
      style={{
        // soft mask so the figure fades into the page on its left edge and at
        // the top/bottom — never a hard rectangle
        WebkitMaskImage: 'radial-gradient(70% 80% at 65% 50%, #000 35%, transparent 80%)',
        maskImage: 'radial-gradient(70% 80% at 65% 50%, #000 35%, transparent 80%)',
      }}
    >
      {/* dust field */}
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-accent/60 shadow-[0_0_6px_hsl(var(--accent-glow))]"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
          }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -16, 0, 12, 0],
                  x: [0, 6, -6, 4, 0],
                  opacity: [d.opacity, d.opacity * 1.4, d.opacity * 0.6, d.opacity],
                }
          }
          transition={{
            duration: d.duration,
            repeat: Infinity,
            delay: d.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* horizon line that the mirror sits on */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

      {/* figure stack — parallax + scroll roll */}
      <motion.div
        className="absolute inset-0"
        style={{ rotate: rollUntyped }}
        animate={{ x: parallax.x * -14, y: parallax.y * 10 }}
        transition={{ type: 'spring', stiffness: 50, damping: 18 }}
      >
        {/* main figure (back-facing, suspended) */}
        <motion.div
          className="absolute left-1/2 top-[18%] -translate-x-1/2 opacity-70 mix-blend-screen"
          style={{ width: '60%' }}
          animate={reduce ? undefined : { y: [-8, 10, -8] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Spaceman reduce={reduce ?? false} />
        </motion.div>

        {/* mirror reflection — dimmed, flipped, drifts opposite */}
        <motion.div
          className="absolute bottom-[8%] left-1/2 -translate-x-1/2"
          style={{
            width: '60%',
            transform: 'translateX(-50%) scaleY(-1)',
            opacity: 0.22,
            filter: 'blur(0.6px)',
            mixBlendMode: 'screen',
          }}
          animate={reduce ? undefined : { y: [8, -10, 8] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Spaceman mirror reduce={reduce ?? false} />
        </motion.div>
      </motion.div>

      {/* subtle vertical scrim on the left edge so text on the page never has
          to fight the figure for contrast */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-bg via-bg/40 to-transparent"
      />
    </div>
  );
}
