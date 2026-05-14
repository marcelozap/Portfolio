'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Decorative background silhouettes — tennis · trail · racquet — same
 * low-contrast, screen-blended language as the moon fisher.
 */
export function AmbientMotifs() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[4] hidden overflow-hidden lg:block"
    >
      {/* tennis balls — lower left */}
      <motion.div
        className="absolute bottom-[8%] left-[4%] w-28 opacity-[0.12] mix-blend-screen md:w-36"
        animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TennisBall />
      </motion.div>
      <motion.div
        className="absolute bottom-[14%] left-[12%] w-20 opacity-[0.08] mix-blend-screen"
        animate={reduce ? undefined : { y: [0, 12, 0], x: [0, 6, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <TennisBall />
      </motion.div>

      {/* racquet — mid left */}
      <motion.div
        className="absolute left-[2%] top-[28%] w-40 opacity-[0.1] mix-blend-screen md:w-48"
        animate={reduce ? undefined : { rotate: [-2, 3, -2], y: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Racquet />
      </motion.div>

      {/* mountain trail mark — upper right, away from the fisher */}
      <motion.div
        className="absolute right-[8%] top-[12%] w-44 opacity-[0.11] mix-blend-screen md:w-52"
        animate={reduce ? undefined : { y: [0, -6, 0], opacity: [0.09, 0.13, 0.09] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TrailLogo />
      </motion.div>
    </div>
  );
}

function TennisBall() {
  return (
    <svg viewBox="0 0 64 64" className="block w-full" fill="none">
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="hsl(var(--accent-warm) / 0.15)"
        stroke="hsl(var(--accent-warm) / 0.45)"
        strokeWidth="1.2"
      />
      <path
        d="M10 32 Q 32 18 54 32 M10 32 Q 32 46 54 32"
        stroke="hsl(var(--accent-warm) / 0.45)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function Racquet() {
  return (
    <svg viewBox="0 0 120 200" className="block w-full" fill="none">
      <ellipse
        cx="60"
        cy="56"
        rx="44"
        ry="52"
        stroke="hsl(var(--accent) / 0.35)"
        strokeWidth="1.4"
        fill="hsl(var(--accent) / 0.06)"
      />
      <line
        x1="60"
        y1="108"
        x2="60"
        y2="190"
        stroke="hsl(var(--ink-muted) / 0.5)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={24 + i * 10}
          y1={24}
          x2={24 + i * 10}
          y2={88}
          stroke="hsl(var(--accent) / 0.22)"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

function TrailLogo() {
  return (
    <svg viewBox="0 0 200 120" className="block w-full" fill="none">
      <path
        d="M12 92 Q 40 28 96 44 Q 152 60 188 20"
        stroke="hsl(var(--accent-cool) / 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 100 Q 52 52 100 64 Q 148 76 176 48"
        stroke="hsl(var(--accent) / 0.25)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <polygon
        points="180,16 188,28 170,26"
        fill="hsl(var(--accent-cool) / 0.35)"
        stroke="hsl(var(--accent-cool) / 0.5)"
        strokeWidth="0.6"
      />
    </svg>
  );
}
