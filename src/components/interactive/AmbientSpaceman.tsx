'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { MoonFisherman } from '@/components/figures/MoonFisherman';

/**
 * AmbientSpaceman — the moon-fishing astronaut pinned to the bottom-right of
 * the viewport as a peaceful, persistent background presence.
 *
 * Lives at z-5 (above AmbientBackdrop, below main content). Decorative only:
 * pointer-events: none, hidden from a11y tree, suppressed under reduced-motion
 * or on viewports < lg.
 *
 * The whole scene drifts on a slow vertical sine and parallaxes very gently
 * with the pointer, but it never demands attention — it's the operator
 * fishing at the edge of every page.
 */
export function AmbientSpaceman() {
  const reduce = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  // gate on viewport width
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // pointer parallax
  useEffect(() => {
    if (!enabled || reduce) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({
        x: Math.max(-1, Math.min(1, nx)) * 0.4,
        y: Math.max(-1, Math.min(1, ny)) * 0.4,
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, reduce]);

  // tiny scroll-driven sway so the scene "exhales" as the page scrolls
  const { scrollY } = useScroll();
  const sway = useTransform(scrollY, [0, 4000], [0, -3]);

  const dust = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        x: 25 + Math.random() * 65,
        y: 50 + Math.random() * 40,
        size: Math.random() * 1.2 + 0.4,
        delay: Math.random() * 6,
        duration: 14 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-0 right-0 z-[5] hidden h-[72vh] w-[34vw] max-w-[480px] lg:block"
      style={{
        WebkitMaskImage: 'radial-gradient(60% 70% at 70% 75%, #000 30%, transparent 85%)',
        maskImage: 'radial-gradient(60% 70% at 70% 75%, #000 30%, transparent 85%)',
      }}
    >
      {/* slow drifting dust above the moon ridge */}
      {dust.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-accent/50 shadow-[0_0_5px_hsl(var(--accent-glow))]"
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
                  y: [0, -20, 0, 14, 0],
                  x: [0, 6, -6, 4, 0],
                  opacity: [d.opacity, d.opacity * 1.3, d.opacity * 0.6, d.opacity],
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

      {/* the figure */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex items-end justify-center opacity-65 mix-blend-screen"
        style={{ rotate: sway }}
        animate={{ x: parallax.x * -10, y: parallax.y * 6 }}
        transition={{ type: 'spring', stiffness: 40, damping: 18 }}
      >
        <div className="w-[90%]">
          <MoonFisherman reduce={reduce ?? false} />
        </div>
      </motion.div>

      {/* left-edge scrim — keep content contrast safe */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-bg via-bg/30 to-transparent"
      />
      {/* top scrim — same idea, for content that flows behind the upper edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-bg/70 to-transparent"
      />
    </div>
  );
}
