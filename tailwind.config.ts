import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'hsl(var(--bg) / <alpha-value>)',
          subtle: 'hsl(var(--bg-subtle) / <alpha-value>)',
          elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink) / <alpha-value>)',
          muted: 'hsl(var(--ink-muted) / <alpha-value>)',
          faint: 'hsl(var(--ink-faint) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          glow: 'hsl(var(--accent-glow) / <alpha-value>)',
          warm: 'hsl(var(--accent-warm) / <alpha-value>)',
          cool: 'hsl(var(--accent-cool) / <alpha-value>)',
        },
        line: 'hsl(var(--line) / <alpha-value>)',
        signal: {
          green: 'hsl(var(--signal-green) / <alpha-value>)',
          red: 'hsl(var(--signal-red) / <alpha-value>)',
          amber: 'hsl(var(--signal-amber) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, hsl(var(--bg)) 0%, transparent 30%, transparent 70%, hsl(var(--bg)) 100%)',
        'radial-spot':
          'radial-gradient(circle at 50% 0%, hsl(var(--accent-glow) / 0.18), transparent 60%)',
        noise:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      boxShadow: {
        glow: '0 0 40px -10px hsl(var(--accent-glow) / 0.45)',
        'glow-lg': '0 0 80px -20px hsl(var(--accent-glow) / 0.5)',
        inset: 'inset 0 1px 0 0 hsl(0 0% 100% / 0.04)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-glow': 'pulseGlow 3.2s ease-in-out infinite',
        scan: 'scan 5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
