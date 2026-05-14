'use client';

import { motion } from 'framer-motion';

export interface MoonFishermanProps {
  /** disables internal animations when prefers-reduced-motion is set */
  reduce?: boolean;
}

/**
 * An astronaut sitting cross-legged on a moon ridge, fishing into a small
 * luminous pool. Side profile, peaceful idle:
 *   - figure breathes on a slow vertical sine
 *   - fishing rod tip bobs
 *   - line sways
 *   - the pool ripples and exhales bubbles
 *   - distant Earth hangs in the upper-left corner
 *
 * Pure SVG so it scales perfectly, gradients react to theme tokens.
 */
export function MoonFisherman({ reduce = false }: MoonFishermanProps) {
  return (
    <svg viewBox="0 0 240 320" className="block w-full" aria-hidden fill="none">
      <defs>
        <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 16% 14%)" />
          <stop offset="1" stopColor="hsl(220 14% 8%)" />
        </linearGradient>
        <linearGradient id="suit-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.7" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="visor" r="0.6" cx="0.6" cy="0.4">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.85" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="moon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 14% 14%)" />
          <stop offset="1" stopColor="hsl(220 12% 6%)" />
        </linearGradient>
        <radialGradient id="earth" r="0.5" cx="0.4" cy="0.4">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="hsl(218 80% 50%)" stopOpacity="0.5" />
          <stop offset="1" stopColor="hsl(218 80% 50%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pool" r="0.5" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.85" />
          <stop offset="1" stopColor="hsl(188 95% 62%)" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* distant Earth — small, top-left */}
      <g opacity="0.7">
        <circle cx="38" cy="44" r="16" fill="url(#earth)" />
        <circle cx="38" cy="44" r="9" fill="hsl(218 80% 30% / 0.35)" />
        <path
          d="M30 42 Q 36 38 44 42 M32 48 Q 40 46 46 48"
          stroke="hsl(152 78% 52% / 0.55)"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {/* moon horizon — jagged silhouette with subtle craters */}
      <g>
        <path
          d="M0 268 L 18 262 L 32 270 L 52 264 L 74 274 L 96 270 L 122 280 L 152 274 L 176 282 L 198 276 L 220 286 L 240 280 L 240 320 L 0 320 Z"
          fill="url(#moon)"
          stroke="hsl(188 95% 62% / 0.28)"
          strokeWidth="0.6"
        />
        {/* small craters */}
        <ellipse cx="40" cy="298" rx="5" ry="1.2" fill="hsl(220 12% 4%)" />
        <ellipse cx="156" cy="304" rx="7" ry="1.4" fill="hsl(220 12% 4%)" />
        <ellipse cx="100" cy="312" rx="9" ry="1.6" fill="hsl(220 12% 4%)" />
      </g>

      {/* the pool — a small luminous puddle */}
      <motion.ellipse
        cx="200"
        cy="296"
        rx="16"
        ry="3"
        fill="url(#pool)"
        animate={reduce ? undefined : { rx: [14, 18, 14], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* expanding ripple ring */}
      {!reduce && (
        <motion.ellipse
          cx="200"
          cy="296"
          rx="3"
          ry="0.6"
          fill="none"
          stroke="hsl(188 95% 62% / 0.7)"
          strokeWidth="0.4"
          animate={{ rx: [3, 22, 3], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* the astronaut — sitting cross-legged in profile */}
      <motion.g
        animate={reduce ? undefined : { y: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '110px 220px' }}
      >
        {/* crossed legs — single flowing shape */}
        <path
          d="M68 264 Q 70 250 86 248 L 138 248 Q 156 250 156 264 L 150 270 Q 110 274 74 270 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.6"
        />

        {/* oxygen tank — peeking from behind the back */}
        <rect
          x="78"
          y="196"
          width="14"
          height="50"
          rx="3"
          fill="hsl(220 14% 8%)"
          stroke="url(#suit-edge)"
          strokeWidth="0.5"
        />
        <line x1="80" y1="206" x2="90" y2="206" stroke="hsl(220 12% 30%)" strokeWidth="0.4" />
        <line x1="80" y1="218" x2="90" y2="218" stroke="hsl(220 12% 30%)" strokeWidth="0.4" />
        <line x1="80" y1="230" x2="90" y2="230" stroke="hsl(220 12% 30%)" strokeWidth="0.4" />
        <motion.circle
          cx="85"
          cy="240"
          r="1.8"
          fill="hsl(188 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* torso — slightly hunched, peaceful posture */}
        <path
          d="M86 212 Q 80 240 90 250 L 134 250 Q 142 240 140 214 Q 138 198 116 196 Q 92 198 86 212 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.6"
        />

        {/* shoulder seam highlight */}
        <path
          d="M92 204 Q 116 196 138 208"
          stroke="hsl(188 95% 62% / 0.35)"
          strokeWidth="0.6"
          fill="none"
        />

        {/* helmet — side-profile (taller than wide), looking right */}
        <ellipse
          cx="115"
          cy="178"
          rx="22"
          ry="26"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.6"
        />
        {/* visor — large crescent facing the pool */}
        <path
          d="M124 158 Q 142 178 124 200 Q 120 200 122 196 Q 135 178 122 162 Q 120 158 124 158 Z"
          fill="url(#visor)"
          filter="url(#soft)"
        />
        {/* tiny reflection point on the visor */}
        <circle cx="131" cy="172" r="1.4" fill="hsl(0 0% 100%)" opacity="0.65" />

        {/* helmet rim glow */}
        <ellipse
          cx="115"
          cy="178"
          rx="22"
          ry="26"
          stroke="hsl(188 95% 62% / 0.45)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* antenna + light */}
        <line x1="113" y1="152" x2="113" y2="140" stroke="hsl(220 12% 50%)" strokeWidth="0.8" />
        <motion.circle
          cx="113"
          cy="138"
          r="1.8"
          fill="hsl(28 95% 62%)"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* arm extended forward, holding the rod */}
        <path
          d="M132 218 Q 150 220 162 222 L 168 220 L 168 214 L 152 210 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.5"
        />
        {/* tucked arm visible at hip */}
        <path
          d="M86 230 Q 78 242 84 252 L 96 252 Q 98 240 96 232 Z"
          fill="url(#suit)"
          stroke="url(#suit-edge)"
          strokeWidth="0.5"
        />
      </motion.g>

      {/* fishing rod — gentle bob */}
      <motion.path
        d="M162 220 Q 188 208 218 196"
        stroke="hsl(220 14% 18%)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        animate={
          reduce
            ? undefined
            : {
                d: [
                  'M162 220 Q 188 208 218 196',
                  'M162 220 Q 188 212 218 200',
                  'M162 220 Q 188 208 218 196',
                ],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* rod tip glow */}
      <circle cx="218" cy="196" r="1.4" fill="hsl(28 95% 62%)" opacity="0.9" />

      {/* fishing line — sways slowly */}
      <motion.path
        d="M218 196 Q 212 246 200 296"
        stroke="hsl(188 95% 62% / 0.7)"
        strokeWidth="0.5"
        fill="none"
        animate={
          reduce
            ? undefined
            : {
                d: [
                  'M218 196 Q 212 246 200 296',
                  'M218 198 Q 216 246 200 296',
                  'M218 196 Q 208 246 200 296',
                  'M218 196 Q 212 246 200 296',
                ],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* line tip — sits on the pool */}
      <circle cx="200" cy="295" r="0.9" fill="hsl(188 95% 62%)" />

      {/* slow bubbles rising from the pool */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="0.8"
            fill="hsl(188 95% 62%)"
            cx={198 + i * 2}
            cy={296}
            animate={{
              cy: [296, 252, 230],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 6 + i * 1.4,
              repeat: Infinity,
              delay: i * 1.8,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* tether — drifts gently upward from oxygen tank */}
      <motion.path
        d="M85 200 C 90 180, 78 160, 88 140"
        stroke="hsl(188 95% 62% / 0.28)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        animate={
          reduce
            ? undefined
            : {
                d: [
                  'M85 200 C 90 180, 78 160, 88 140',
                  'M85 200 C 80 180, 90 160, 86 140',
                  'M85 200 C 90 180, 78 160, 88 140',
                ],
              }
        }
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}
