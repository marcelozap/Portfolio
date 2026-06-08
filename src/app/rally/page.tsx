import Link from 'next/link';

const stack = ['SwiftUI', 'SwiftData', 'Activity data', 'Garmin API', 'Node.js'];

export default function RallyPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-24 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint transition hover:text-ink"
          >
            Marcelo Zapata / Portfolio
          </Link>

          <p className="mt-16 font-mono text-xs font-black uppercase tracking-[0.24em] text-accent-warm">
            Practice system
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">Rally</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl">
            Training logs, activity data, progress, and review.
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Coming soon.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-accent-warm hover:text-bg"
            >
              Back home
            </Link>
            <Link
              href="/#projects"
              className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-accent-warm/40 hover:text-ink"
            >
              View work
            </Link>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,hsl(146_28%_10%),hsl(38_32%_12%))] shadow-glow">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_74%_22%,hsl(38_70%_62%/0.2),transparent_62%),radial-gradient(60%_55%_at_20%_78%,hsl(153_80%_58%/0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(42_38%_76%/0.045)_1px,transparent_1px),linear-gradient(0deg,hsl(42_38%_76%/0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <svg
            viewBox="0 0 100 64"
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
          >
            <path
              d="M10 8 H90 L99 58 H1 Z"
              fill="hsl(150 32% 11% / 0.72)"
              stroke="hsl(42 48% 72% / 0.34)"
              strokeWidth="0.35"
            />
            <path
              d="M50 8 L50 58 M5 38 H95 M25 8 L18 58 M75 8 L82 58"
              stroke="hsl(42 42% 82% / 0.32)"
              strokeWidth="0.25"
            />
            <path
              d="M10 48 C27 22 42 22 56 36 C69 50 82 46 92 18"
              fill="none"
              stroke="hsl(38 65% 62% / 0.72)"
              strokeDasharray="1.8 1.6"
              strokeWidth="0.42"
            />
            <path
              d="M14 50 C34 16 50 20 64 32 C79 45 88 38 92 18"
              fill="none"
              stroke="hsl(153 72% 66% / 0.42)"
              strokeDasharray="1 1.4"
              strokeWidth="0.28"
            />
            <g fill="hsl(42 38% 82% / 0.8)" stroke="hsl(38 65% 62% / 0.45)" strokeWidth="0.18">
              <circle cx="14" cy="50" r="1.2" />
              <path d="M14 51.5 L14 56 M11.8 53.2 H16.2 M14 56 L11.7 59 M14 56 L16.3 59" />
              <circle cx="92" cy="18" r="1.2" />
              <path d="M92 19.5 L92 24 M89.8 21.2 H94.2 M92 24 L89.7 27 M92 24 L94.3 27" />
            </g>
            <circle r="1.1" fill="hsl(38 95% 68%)">
              <animateMotion
                dur="3.6s"
                repeatCount="indefinite"
                path="M14 50 C34 16 50 20 64 32 C79 45 88 38 92 18 C72 34 54 38 14 50"
              />
            </circle>
          </svg>

          <div className="absolute left-6 top-6 grid grid-cols-2 gap-2">
            {['session', 'heart', 'pace', 'review'].map((label) => (
              <span key={label} className="mono-tag border-white/[0.08] bg-bg/35 text-[9px]">
                {label}
              </span>
            ))}
          </div>

          <div className="absolute right-6 top-6 rounded-2xl border border-white/[0.08] bg-bg/45 p-4 backdrop-blur">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              activity loop
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                ['8', 'sessions'],
                ['42m', 'avg'],
                ['+3', 'notes'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-xl text-ink">{value}</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/[0.08] bg-bg/55 p-4 backdrop-blur">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Stack
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {stack.map((item) => (
                <li key={item} className="mono-tag normal-case tracking-wider">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
