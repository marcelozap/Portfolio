'use client';

import { motion } from 'framer-motion';

export interface MoonFishermanProps {
  reduce?: boolean;
}

export function MoonFisherman({ reduce = false }: MoonFishermanProps) {
  return (
    <svg viewBox="0 0 260 320" className="block w-full" aria-hidden fill="none">
      <defs>
        <linearGradient id="mf-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(220 16% 16%)" />
          <stop offset="1" stopColor="hsl(220 14% 7%)" />
        </linearGradient>
        <linearGradient id="mf-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(188 95% 62%)" stopOpacity="0.72" />
          <stop offset="1" stopColor="hsl(268 80% 70%)" stopOpacity="0.42" />
        </linearGradient>
        <radialGradient id="mf-visor" cx="0.6" cy="0.35" r="0.75">
          <stop offset="0" stopColor="hsl(188 95% 78%)" stopOpacity="0.82" />
          <stop offset="0.45" stopColor="hsl(210 80% 48%)" stopOpacity="0.34" />
          <stop offset="1" stopColor="hsl(220 18% 8%)" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="mf-moon" cx="0.48" cy="0.35" r="0.85">
          <stop offset="0" stopColor="hsl(220 18% 72%)" stopOpacity="0.8" />
          <stop offset="1" stopColor="hsl(220 14% 18%)" stopOpacity="0.96" />
        </radialGradient>
        <filter id="mf-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {[18, 42, 74, 204, 232, 245, 154, 118].map((cx, i) => (
        <motion.circle
          key={`star-${i}`}
          cx={cx}
          cy={18 + ((i * 31) % 84)}
          r={0.45 + (i % 3) * 0.25}
          fill="hsl(220 22% 72%)"
          animate={reduce ? undefined : { opacity: [0.18, 0.75, 0.18] }}
          transition={{
            duration: 3 + i * 0.45,
            repeat: Infinity,
            delay: i * 0.28,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.g
        animate={reduce ? undefined : { y: [-2, 2.5, -2] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="154" cy="283" rx="108" ry="28" fill="url(#mf-moon)" />
        <path
          d="M50 282 C 86 259, 126 255, 164 263 C 194 269, 222 264, 250 252"
          stroke="hsl(188 95% 62% / 0.18)"
          strokeWidth="1"
        />
        <circle cx="104" cy="274" r="7" fill="hsl(220 12% 10% / 0.55)" />
        <circle cx="190" cy="276" r="11" fill="hsl(220 12% 10% / 0.45)" />
        <circle cx="226" cy="263" r="5" fill="hsl(220 12% 10% / 0.42)" />

        <motion.g
          animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '132px 185px' }}
        >
          <path
            d="M104 178 C 108 154, 122 139, 144 140 C 166 142, 178 159, 176 183 L 172 230 C 171 245, 160 254, 144 254 L 122 254 C 106 254, 96 244, 97 228 Z"
            fill="url(#mf-suit)"
            stroke="url(#mf-edge)"
            strokeWidth="0.8"
          />
          <path
            d="M118 203 C 131 210, 146 210, 160 203"
            stroke="hsl(188 95% 62% / 0.18)"
            strokeWidth="0.8"
          />
          <rect
            x="119"
            y="217"
            width="38"
            height="18"
            rx="5"
            fill="hsl(220 14% 8%)"
            stroke="url(#mf-edge)"
            strokeWidth="0.55"
          />
          <motion.circle
            cx="149"
            cy="226"
            r="2.4"
            fill="hsl(188 95% 62%)"
            animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <circle
            cx="142"
            cy="121"
            r="37"
            fill="url(#mf-suit)"
            stroke="url(#mf-edge)"
            strokeWidth="0.9"
          />
          <ellipse
            cx="148"
            cy="119"
            rx="24"
            ry="19"
            fill="url(#mf-visor)"
            stroke="hsl(188 95% 62% / 0.45)"
            strokeWidth="0.7"
          />
          <path
            d="M134 111 C 142 104, 155 104, 164 111"
            stroke="hsl(0 0% 100% / 0.46)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="158" cy="113" r="1.3" fill="white" opacity="0.7" />

          <path
            d="M103 190 C 82 192, 68 204, 60 224"
            stroke="url(#mf-edge)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M174 187 C 194 179, 213 166, 229 146"
            stroke="url(#mf-edge)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="224"
            r="6"
            fill="url(#mf-suit)"
            stroke="url(#mf-edge)"
            strokeWidth="0.6"
          />
          <circle
            cx="229"
            cy="146"
            r="5"
            fill="url(#mf-suit)"
            stroke="url(#mf-edge)"
            strokeWidth="0.6"
          />

          <path
            d="M124 253 L 116 288"
            stroke="url(#mf-edge)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M154 253 L 168 286"
            stroke="url(#mf-edge)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <rect x="105" y="286" width="23" height="6" rx="2" fill="hsl(220 10% 28%)" />
          <rect x="159" y="284" width="25" height="6" rx="2" fill="hsl(220 10% 28%)" />
        </motion.g>

        <motion.path
          d="M228 144 C 235 182, 228 218, 209 247"
          stroke="hsl(188 95% 62% / 0.42)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
          fill="none"
          animate={
            reduce
              ? undefined
              : {
                  d: [
                    'M228 144 C 235 182, 228 218, 209 247',
                    'M228 144 C 240 178, 231 217, 211 247',
                    'M228 144 C 235 182, 228 218, 209 247',
                  ],
                }
          }
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="209"
          cy="247"
          r="3"
          fill="hsl(188 95% 62%)"
          filter="url(#mf-glow)"
          animate={reduce ? undefined : { opacity: [0.28, 0.85, 0.28], y: [0, 3, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>
    </svg>
  );
}

export default MoonFisherman;
