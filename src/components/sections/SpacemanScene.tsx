'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The Spaceman — a back-facing astronaut playing an electric guitar,
 * suspended above a mirror. The whole figure breathes (zero-g idle),
 * the cape + tether drift, and a debris field of dust floats around it.
 *
 * Everything is SVG so it scales perfectly and stays pixel-light.
 */
export function SpacemanScene() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // pointer parallax around the figure — clamped so it stays tasteful
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / rect.width;
      const ny = (e.clientY - cy) / rect.height;
      setParallax({ x: Math.max(-0.6, Math.min(0.6, nx)), y: Math.max(-0.6, Math.min(0.6, ny)) });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce]);

  // dust / debris field — generated once
  const dust = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 14,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-[radial-gradient(80%_60%_at_50%_30%,hsl(268_80%_70%/0.18),transparent_60%),linear-gradient(180deg,hsl(222_30%_8%),hsl(222_24%_4%))]"
    >
      {/* deep-space horizon */}
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-3/5 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(188_95%_62%/0.10),transparent_70%)]" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        {/* mirror tint underneath horizon */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(180deg,hsl(222_30%_6%)_0%,hsl(222_24%_3%)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[radial-gradient(60%_60%_at_50%_30%,hsl(188_95%_62%/0.06),transparent_70%)] mix-blend-screen" />
      </div>

      {/* faint star pattern */}
      <Stars />

      {/* drifting dust */}
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-accent/70 shadow-[0_0_6px_hsl(var(--accent-glow))]"
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
                  y: [0, -14, 0, 10, 0],
                  x: [0, 6, -6, 4, 0],
                  opacity: [d.opacity, d.opacity * 1.4, d.opacity * 0.7, d.opacity],
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

      {/* the figure + its reflection */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ x: parallax.x * 18, y: parallax.y * 12 }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      >
        {/* top half: real figure */}
        <motion.div
          className="absolute left-1/2 top-[8%] -translate-x-1/2"
          animate={reduce ? undefined : { y: [-6, 8, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '52%' }}
        >
          <Spaceman reduce={reduce ?? false} />
        </motion.div>

        {/* bottom half: mirror */}
        <motion.div
          className="absolute bottom-[6%] left-1/2 -translate-x-1/2"
          style={{
            width: '52%',
            transform: 'translateX(-50%) scaleY(-1)',
            opacity: 0.32,
            filter: 'blur(0.4px)',
          }}
          animate={reduce ? undefined : { y: [6, -8, 6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Spaceman mirror reduce={reduce ?? false} />
        </motion.div>

        {/* horizon ripple ring */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30"
            style={{ width: '54%', aspectRatio: '6 / 1' }}
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* HUD overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          xiv_os · scene_03 · the_mirror
        </div>
        <div className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          ◉ live · zero-g
        </div>
        <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          tether · stable
        </div>
        <div className="absolute bottom-5 right-5 font-mono text-[10px] uppercase tabular-nums tracking-[0.22em] text-ink-faint">
          g 0.00 m/s²
        </div>
        {/* corner brackets */}
        {[
          'left-3 top-3 border-l border-t',
          'right-3 top-3 border-r border-t',
          'left-3 bottom-3 border-l border-b',
          'right-3 bottom-3 border-r border-b',
        ].map((c, i) => (
          <span key={i} className={`absolute h-3 w-3 border-accent/40 ${c}`} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   The Spaceman — pure SVG.
   Drawn from behind: oxygen tank, helmet, suit, electric guitar slung across,
   tether cord drifting upward.
   ============================================================================ */

interface SpacemanProps {
  mirror?: boolean;
  reduce?: boolean;
}

function Spaceman({ reduce = false }: SpacemanProps) {
  // shared float for the guitar (subtle counter-bob to the body)
  const guitarAnim = reduce ? undefined : { rotate: [-2, 2, -2], y: [-1, 1, -1] };

  return (
    <svg viewBox="0 0 200 320" className="block w-full" aria-hidden fill="none">
      <defs>
        <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 16% 14%)" />
          <stop offset="1" stopColor="hsl(220 14% 8%)" />
        </linearGradient>
        <linearGradient id="suit-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.7" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="helmet-glow" r="0.6" cx="0.5" cy="0.4">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.55" />
          <stop offset="1" stopColor="hsl(188 95% 62%)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.9" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="guitar-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(28 95% 62%)" />
          <stop offset="1" stopColor="hsl(358 82% 62%)" />
        </linearGradient>
        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* tether cord drifting upward — represents gravity-defying connection */}
      <motion.path
        d="M100 30 C 110 10, 90 -10, 100 -40 C 110 -70, 90 -100, 100 -130"
        stroke="hsl(188 95% 62% / 0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={
          reduce
            ? undefined
            : {
                d: [
                  'M100 30 C 110 10, 90 -10, 100 -40 C 110 -70, 90 -100, 100 -130',
                  'M100 30 C 92 10, 112 -10, 100 -40 C 88 -70, 110 -100, 100 -130',
                  'M100 30 C 110 10, 90 -10, 100 -40 C 110 -70, 90 -100, 100 -130',
                ],
              }
        }
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* faint backlight halo behind the body */}
      <ellipse cx="100" cy="140" rx="78" ry="98" fill="url(#helmet-glow)" opacity="0.55" />

      {/* OXYGEN TANK (visible from behind) */}
      <g filter="url(#soft-glow)">
        <rect
          x="74"
          y="86"
          width="52"
          height="78"
          rx="14"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="1"
        />
        {/* tank ridges */}
        <line x1="84" y1="96" x2="116" y2="96" stroke="hsl(220 12% 30%)" strokeWidth="0.6" />
        <line x1="84" y1="108" x2="116" y2="108" stroke="hsl(220 12% 30%)" strokeWidth="0.6" />
        <line x1="84" y1="120" x2="116" y2="120" stroke="hsl(220 12% 30%)" strokeWidth="0.6" />
        {/* glowing status light */}
        <motion.circle
          cx="100"
          cy="146"
          r="2.4"
          fill="hsl(188 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <text
          x="100"
          y="158"
          fontFamily="ui-monospace, monospace"
          fontSize="6"
          textAnchor="middle"
          fill="hsl(220 12% 60%)"
          letterSpacing="0.5"
        >
          XIV-O₂
        </text>
      </g>

      {/* HELMET — round, back of head, with faint reflection cresent */}
      <g>
        <ellipse
          cx="100"
          cy="60"
          rx="38"
          ry="42"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="1"
        />
        {/* visor reflection (back of helmet glass crescent) */}
        <path
          d="M70 56 Q 100 36 130 56"
          stroke="url(#visor)"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
          filter="url(#soft-glow)"
        />
        {/* tiny rim glow */}
        <ellipse
          cx="100"
          cy="60"
          rx="38"
          ry="42"
          stroke="hsl(188 95% 62% / 0.6)"
          strokeWidth="0.6"
          fill="none"
        />
        {/* helmet antenna */}
        <line x1="100" y1="18" x2="100" y2="6" stroke="hsl(220 12% 50%)" strokeWidth="1" />
        <motion.circle
          cx="100"
          cy="4"
          r="2"
          fill="hsl(28 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>

      {/* SHOULDERS + TORSO (visible flanking the tank) */}
      <g>
        {/* left shoulder */}
        <path
          d="M58 100 Q 50 116 56 140 L 70 158 L 78 142 L 76 110 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.8"
        />
        {/* right shoulder */}
        <path
          d="M142 100 Q 150 116 144 140 L 130 158 L 122 142 L 124 110 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.8"
        />
        {/* mid-back armor seam */}
        <line
          x1="100"
          y1="86"
          x2="100"
          y2="164"
          stroke="hsl(188 95% 62% / 0.25)"
          strokeWidth="0.6"
        />
      </g>

      {/* LOWER BODY — legs hinted, drifting */}
      <motion.g
        animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 170px' }}
      >
        <path
          d="M76 168 Q 70 220 80 268 L 96 270 L 98 200 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.8"
        />
        <path
          d="M124 168 Q 130 220 120 268 L 104 270 L 102 200 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.8"
        />
        {/* boots */}
        <rect
          x="76"
          y="268"
          width="22"
          height="10"
          rx="2"
          fill="hsl(220 12% 16%)"
          stroke="url(#suit-edge)"
          strokeWidth="0.6"
        />
        <rect
          x="102"
          y="268"
          width="22"
          height="10"
          rx="2"
          fill="hsl(220 12% 16%)"
          stroke="url(#suit-edge)"
          strokeWidth="0.6"
        />
      </motion.g>

      {/* ELECTRIC GUITAR — slung across the back, body protrudes to the right */}
      <motion.g
        animate={guitarAnim}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '110px 180px' }}
      >
        {/* strap, looping over right shoulder and under left hip */}
        <path
          d="M138 102 Q 168 140 150 200 Q 138 240 96 240"
          stroke="hsl(28 95% 62% / 0.6)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* guitar neck — goes up and to the left, peeks behind helmet */}
        <g transform="translate(0,0)">
          <rect
            x="40"
            y="92"
            width="76"
            height="6"
            rx="2"
            fill="hsl(220 14% 14%)"
            stroke="url(#suit-edge)"
            strokeWidth="0.5"
            transform="rotate(-22 78 95)"
          />
          {/* frets */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line
              key={i}
              x1={48 + i * 8}
              y1={88}
              x2={48 + i * 8}
              y2={94}
              stroke="hsl(220 12% 50%)"
              strokeWidth="0.4"
              transform="rotate(-22 78 95)"
            />
          ))}
          {/* headstock */}
          <path
            d="M28 76 L 48 84 L 46 92 L 24 84 Z"
            fill="hsl(220 14% 18%)"
            stroke="url(#suit-edge)"
            strokeWidth="0.5"
            transform="rotate(-22 36 84)"
          />
        </g>

        {/* guitar body — offset to the lower right behind the figure */}
        <g transform="translate(112,184) rotate(28)">
          <path
            d="M0 0 C 28 -8 50 6 46 30 C 42 56 14 60 -6 50 C -24 40 -22 8 0 0 Z"
            fill="url(#guitar-body)"
            stroke="hsl(28 95% 62%)"
            strokeWidth="0.6"
            filter="url(#soft-glow)"
          />
          {/* pickups */}
          <rect x="6" y="14" width="22" height="3" fill="hsl(220 14% 10%)" />
          <rect x="6" y="26" width="22" height="3" fill="hsl(220 14% 10%)" />
          {/* bridge */}
          <rect x="6" y="36" width="22" height="2" fill="hsl(220 14% 10%)" />
          {/* knobs */}
          <circle cx="36" cy="22" r="1.6" fill="hsl(220 14% 10%)" />
          <circle cx="36" cy="30" r="1.6" fill="hsl(220 14% 10%)" />
          <circle cx="36" cy="38" r="1.6" fill="hsl(220 14% 10%)" />
          {/* string-glow strip */}
          <line
            x1="-10"
            y1="22"
            x2="42"
            y2="20"
            stroke="hsl(188 95% 62%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          <line
            x1="-10"
            y1="26"
            x2="42"
            y2="24"
            stroke="hsl(188 95% 62%)"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </g>
      </motion.g>
    </svg>
  );
}

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 50, // only top half (sky)
        size: Math.random() * 1.4 + 0.2,
        opacity: 0.2 + Math.random() * 0.6,
        delay: Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          animate={{ opacity: [s.opacity * 0.4, s.opacity, s.opacity * 0.4] }}
          transition={{
            duration: 3 + s.delay,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
