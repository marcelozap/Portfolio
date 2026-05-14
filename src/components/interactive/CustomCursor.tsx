'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Two-layer cursor:
 *  - inner "dot" that snaps to the mouse with zero lag
 *  - outer "ring" that follows with spring smoothing
 *  - ring scales/colors when hovering interactive elements
 *
 * Disabled on touch devices and respects prefers-reduced-motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(hasFinePointer && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const setHover = (state: boolean) => {
      ringRef.current?.classList.toggle('is-hover', state);
      dotRef.current?.classList.toggle('is-hover', state);
    };

    const interactiveSelector =
      'a, button, [role="button"], [data-cursor="hover"], input, textarea, select, summary';

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector)) setHover(true);
    };
    const onOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelector)) setHover(false);
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 32,
          height: 32,
          borderRadius: '999px',
          border: '1px solid hsl(var(--accent) / 0.8)',
          transition: 'width 240ms ease, height 240ms ease, opacity 240ms ease',
          mixBlendMode: 'screen',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[101] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 4,
          height: 4,
          borderRadius: '999px',
          background: 'hsl(var(--accent))',
          boxShadow: '0 0 10px hsl(var(--accent-glow) / 0.9)',
        }}
      />
      <style jsx global>{`
        .cursor-ring.is-hover {
          width: 56px !important;
          height: 56px !important;
          border-color: hsl(var(--accent) / 1);
          background: hsl(var(--accent) / 0.06);
        }
        .cursor-dot.is-hover {
          background: hsl(var(--accent-warm));
          box-shadow: 0 0 14px hsl(var(--accent-warm) / 0.9);
        }
      `}</style>
    </>
  );
}
