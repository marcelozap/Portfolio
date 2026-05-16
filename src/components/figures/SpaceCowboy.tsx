'use client';

import { motion } from 'framer-motion';

export interface SpaceCowboyProps {
  /** disables internal animations when prefers-reduced-motion is set */
  reduce?: boolean;
}

/**
 * Minimal side-profile silhouette: a lone rider on a geometric mech-horse,
 * guitar strapped to his back, dust-particle trail behind.
 * Same philosophy as MoonFisherman — mood over detail, clean shapes, subtle motion.
 *
 *   - whole scene drifts on a slow vertical sine (floating in space)
 *   - mech-horse legs have a gentle trot cycle
 *   - dust particles trail behind and fade
 *   - guitar strings catch light with a slow shimmer
 *   - single eye-slit on the horse pulses cyan
 *
 * Pure SVG — scales perfectly.
 */
export function SpaceCowboy({ reduce = false }: SpaceCowboyProps) {
  return (
    <svg viewBox="0 0 260 320" className="block w-full" aria-hidden fill="none">
      <defs>
        <linearGradient id="sr-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 16% 14%)" />
          <stop offset="1" stopColor="hsl(220 14% 8%)" />
        </linearGradient>
        <linearGradient id="sr-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.7" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="sr-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(220 8% 40%)" />
          <stop offset="0.5" stopColor="hsl(220 6% 58%)" />
          <stop offset="1" stopColor="hsl(220 8% 30%)" />
        </linearGradient>
        <linearGradient id="sr-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 16% 16%)" />
          <stop offset="1" stopColor="hsl(220 14% 10%)" />
        </linearGradient>
        <radialGradient id="sr-eye" r="0.5" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.95" />
          <stop offset="1" stopColor="hsl(188 95% 62%)" stopOpacity="0" />
        </radialGradient>
        <filter id="sr-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="sr-dust" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* === DISTANT STARS === */}
      {[
        [18, 22], [52, 12], [88, 38], [198, 18], [232, 42],
        [14, 90], [245, 78], [170, 8], [130, 30],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={`s-${i}`}
          cx={cx}
          cy={cy}
          r={0.5 + (i % 3) * 0.25}
          fill="hsl(220 20% 65%)"
          animate={reduce ? undefined : { opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: 3.5 + i * 0.6,
            repeat: Infinity,
            delay: i * 0.45,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* === GROUND LINE — subtle horizon === */}
      <line
        x1="0" y1="268" x2="260" y2="268"
        stroke="hsl(188 95% 62% / 0.15)"
        strokeWidth="0.5"
      />

      {/* === DUST TRAIL — particles drifting left behind the horse === */}
      {!reduce &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.circle
            key={`dust-${i}`}
            r={1.5 + i * 0.8}
            fill="hsl(188 95% 62%)"
            filter="url(#sr-dust)"
            animate={{
              cx: [90 - i * 6, 30 - i * 8, 90 - i * 6],
              cy: [260 + i * 2, 254 + i * 3, 260 + i * 2],
              opacity: [0, 0.25 - i * 0.03, 0],
            }}
            transition={{
              duration: 4 + i * 0.6,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* === MAIN SCENE — floats gently === */}
      <motion.g
        animate={reduce ? undefined : { y: [-2, 2.5, -2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* ---- MECH-HORSE ---- */}
        {/* body — angular geometric block */}
        <path
          d="M88 222 L 100 210 L 178 210 L 186 222 L 184 248 L 174 258 L 104 258 L 94 248 Z"
          fill="url(#sr-dark)"
          stroke="url(#sr-edge)"
          strokeWidth="0.6"
        />
        {/* armor plate lines */}
        <line x1="110" y1="214" x2="110" y2="254" stroke="hsl(188 95% 62% / 0.12)" strokeWidth="0.5" />
        <line x1="140" y1="212" x2="140" y2="256" stroke="hsl(188 95% 62% / 0.12)" strokeWidth="0.5" />
        <line x1="168" y1="214" x2="168" y2="254" stroke="hsl(188 95% 62% / 0.12)" strokeWidth="0.5" />

        {/* chest badge — glowing core */}
        <circle cx="125" cy="236" r="4" fill="hsl(220 12% 6%)" stroke="url(#sr-edge)" strokeWidth="0.5" />
        <motion.circle
          cx="125"
          cy="236"
          r="2.2"
          fill="hsl(188 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* neck — angular, reaching forward */}
        <path
          d="M178 218 L 196 190 L 204 192 L 188 224 Z"
          fill="url(#sr-dark)"
          stroke="url(#sr-edge)"
          strokeWidth="0.6"
        />

        {/* head — angular wedge shape facing right */}
        <path
          d="M196 178 L 228 172 L 230 182 L 204 196 L 196 192 Z"
          fill="url(#sr-dark)"
          stroke="url(#sr-edge)"
          strokeWidth="0.6"
        />
        {/* eye slit — pulsing cyan */}
        <rect x="210" y="178" width="14" height="3" rx="1" fill="url(#sr-eye)" />
        <motion.rect
          x="212"
          y="179"
          width="10"
          height="1.5"
          rx="0.75"
          fill="hsl(188 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* ear/antenna */}
        <line x1="202" y1="178" x2="206" y2="164" stroke="hsl(220 12% 40%)" strokeWidth="0.8" />
        <motion.circle
          cx="206"
          cy="162"
          r="1.4"
          fill="hsl(188 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* front legs */}
        <motion.g
          animate={reduce ? undefined : {
            rotate: [-3, 3, -3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '172px 258px' }}
        >
          <path
            d="M168 258 L 166 280 L 172 282 L 178 280 L 176 258"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.5"
          />
          {/* knee joint */}
          <circle cx="171" cy="270" r="2" fill="url(#sr-chrome)" stroke="hsl(188 95% 62% / 0.3)" strokeWidth="0.4" />
          {/* hoof */}
          <rect x="164" y="280" width="16" height="4" rx="1" fill="url(#sr-chrome)" stroke="url(#sr-edge)" strokeWidth="0.4" />
        </motion.g>

        {/* back legs */}
        <motion.g
          animate={reduce ? undefined : {
            rotate: [3, -3, 3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '108px 258px' }}
        >
          <path
            d="M104 258 L 102 280 L 108 282 L 114 280 L 112 258"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.5"
          />
          {/* knee joint */}
          <circle cx="107" cy="270" r="2" fill="url(#sr-chrome)" stroke="hsl(188 95% 62% / 0.3)" strokeWidth="0.4" />
          {/* hoof */}
          <rect x="100" y="280" width="16" height="4" rx="1" fill="url(#sr-chrome)" stroke="url(#sr-edge)" strokeWidth="0.4" />
        </motion.g>

        {/* tail — angular, flowing back */}
        <motion.path
          d="M94 224 Q 78 218 62 226"
          stroke="hsl(188 95% 62% / 0.4)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          animate={
            reduce
              ? undefined
              : {
                  d: [
                    'M94 224 Q 78 218 62 226',
                    'M94 224 Q 76 214 58 220',
                    'M94 224 Q 78 218 62 226',
                  ],
                }
          }
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ---- RIDER (cowboy silhouette) ---- */}
        <motion.g
          animate={reduce ? undefined : { y: [-0.8, 1.2, -0.8] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* legs — straddling the horse body */}
          <path
            d="M118 210 L 114 198 L 122 196 L 124 210 Z"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.4"
          />
          <path
            d="M156 210 L 158 198 L 164 196 L 162 210 Z"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.4"
          />
          {/* boots */}
          <rect x="112" y="194" width="12" height="4" rx="1" fill="url(#sr-dark)" stroke="url(#sr-edge)" strokeWidth="0.3" />
          <rect x="156" y="194" width="12" height="4" rx="1" fill="url(#sr-dark)" stroke="url(#sr-edge)" strokeWidth="0.3" />

          {/* torso — upright, profile */}
          <path
            d="M122 156 Q 118 176 122 196 L 156 196 Q 160 176 156 156 Q 150 146 140 144 Q 130 146 122 156 Z"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.6"
          />

          {/* arm — one hand forward, holding reins */}
          <path
            d="M154 162 Q 168 164 178 168"
            stroke="url(#sr-edge)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* rein line — to horse neck */}
          <path
            d="M178 168 Q 186 178 192 188"
            stroke="hsl(188 95% 62% / 0.25)"
            strokeWidth="0.6"
            fill="none"
          />

          {/* neck */}
          <rect x="134" y="138" width="10" height="8" rx="2" fill="url(#sr-dark)" />

          {/* head — simple oval, profile facing right */}
          <ellipse
            cx="140"
            cy="126"
            rx="13"
            ry="15"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.5"
          />
          {/* visor line — minimal, like MoonFisherman */}
          <path
            d="M148 120 Q 156 126 148 134"
            fill="hsl(188 95% 62% / 0.2)"
            stroke="hsl(188 95% 62% / 0.5)"
            strokeWidth="0.4"
          />
          {/* visor reflection */}
          <circle cx="152" cy="124" r="0.9" fill="hsl(0 0% 100%)" opacity="0.5" />

          {/* === COWBOY HAT — the signature === */}
          {/* brim — wide, flat, iconic */}
          <ellipse cx="140" cy="114" rx="24" ry="4" fill="url(#sr-hat)" stroke="url(#sr-edge)" strokeWidth="0.5" />
          {/* crown — tall, slight pinch */}
          <path
            d="M128 114 Q 126 98 132 92 L 148 92 Q 154 98 152 114 Z"
            fill="url(#sr-hat)"
            stroke="url(#sr-edge)"
            strokeWidth="0.5"
          />
          {/* hat band */}
          <rect x="128" y="110" width="24" height="2.5" rx="0.8" fill="hsl(188 95% 62% / 0.35)" />

          {/* === GUITAR — strapped across back === */}
          {/* strap — diagonal across torso */}
          <path
            d="M130 152 L 148 186"
            stroke="hsl(220 14% 22%)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* guitar body — peeking out behind the rider's back, simple shape */}
          <ellipse
            cx="112"
            cy="168"
            rx="14"
            ry="10"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.6"
            transform="rotate(-15 112 168)"
          />
          {/* sound hole */}
          <circle cx="112" cy="168" r="3.5" fill="hsl(220 14% 6%)" stroke="hsl(188 95% 62% / 0.2)" strokeWidth="0.4" />

          {/* guitar neck — angled up behind the hat */}
          <rect
            x="104"
            y="122"
            width="4"
            height="40"
            rx="1"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.4"
            transform="rotate(-15 106 142)"
          />
          {/* headstock */}
          <rect
            x="98"
            y="114"
            width="8"
            height="6"
            rx="1.5"
            fill="url(#sr-dark)"
            stroke="url(#sr-edge)"
            strokeWidth="0.4"
            transform="rotate(-15 102 117)"
          />
          {/* tuning pegs */}
          <circle cx="98" cy="114" r="1" fill="hsl(188 95% 62% / 0.5)" />
          <circle cx="98" cy="118" r="1" fill="hsl(188 95% 62% / 0.5)" />

          {/* strings shimmer */}
          {!reduce && (
            <motion.line
              x1="102"
              y1="118"
              x2="112"
              y2="164"
              stroke="hsl(188 95% 62%)"
              strokeWidth="0.3"
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.g>
      </motion.g>

      {/* === SUBTLE GROUND GLOW — beneath hooves === */}
      <motion.ellipse
        cx="140"
        cy="286"
        rx="50"
        ry="3"
        fill="hsl(188 95% 62%)"
        filter="url(#sr-glow)"
        animate={reduce ? undefined : { opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}
