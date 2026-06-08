import Link from 'next/link';

const stack = ['SwiftUI', 'SpriteKit', 'SwiftData', 'AVAudioEngine', 'Node.js'];

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
            Tennis app
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">Rally</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl">
            Daily play, courts, progress, and style.
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

        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,hsl(146_28%_10%),hsl(38_32%_12%))] shadow-glow">
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
              d="M9 48 C25 31 38 43 51 26 C65 8 79 20 93 10"
              fill="none"
              stroke="hsl(38 65% 62% / 0.72)"
              strokeDasharray="1.8 1.6"
              strokeWidth="0.42"
            />
          </svg>

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
