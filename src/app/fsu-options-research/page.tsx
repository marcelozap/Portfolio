import Link from 'next/link';

const researchAreas = [
  {
    title: 'Market weather',
    text: 'Prices, volatility, rates, headlines, and the wider conditions surrounding a decision.',
  },
  {
    title: 'Paper practice',
    text: 'Exercises for learning the map and observing behavior without pretending certainty.',
  },
  {
    title: 'Evidence review',
    text: 'Research notes, historical context, assumptions, and questions that keep intuition honest.',
  },
  {
    title: 'AI-assisted study',
    text: 'Tools that organize inputs, expose missing context, and make the next question easier to see.',
  },
];

const stack = ['Python', 'FastAPI', 'React', 'SQL', 'pytest', 'backtesting', 'AI notes'];

function TerrainMap() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,hsl(150_16%_15%),hsl(156_22%_7%))] shadow-glow">
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_12%,hsl(150_20%_84%/0.16),transparent_66%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(150_12%_86%/0.035)_1px,transparent_1px),linear-gradient(0deg,hsl(150_12%_86%/0.03)_1px,transparent_1px)] bg-[size:58px_58px]" />

      <svg viewBox="0 0 100 72" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path
          d="M0 72 V30 L12 25 L23 33 L35 20 L48 31 L61 22 L76 30 L88 18 L100 25 V72 Z"
          fill="hsl(150 28% 18% / 0.7)"
        />
        <path
          d="M0 52 L12 47 L23 53 L35 42 L48 50 L61 43 L76 51 L88 39 L100 46 V72 H0 Z"
          fill="hsl(142 34% 42% / 0.26)"
        />
        <path
          d="M5 58 C18 51 29 52 41 44 C53 36 63 38 76 29 C85 23 93 23 100 20"
          fill="none"
          stroke="hsl(150 52% 72% / 0.72)"
          strokeDasharray="1.8 1.6"
          strokeWidth="0.34"
        />
        <circle cx="41" cy="44" r="1.2" fill="hsl(150 68% 68%)" />
        <circle cx="76" cy="29" r="1.2" fill="hsl(150 68% 68%)" />
      </svg>

      <div className="absolute left-6 top-6 text-xs font-medium text-ink-faint">
        market as art / research in motion
      </div>
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/[0.08] bg-bg/60 p-4 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Boundary
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          A research and education surface. No recommendations, managed accounts, order execution,
          or copy-trading.
        </p>
      </div>
    </div>
  );
}

export default function GreenMachinePage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Link href="/" className="text-sm font-medium text-ink-faint transition hover:text-ink">
          Marcelo Zapata / XIV
        </Link>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-signal-green">Markets / research / practice</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">
              Green Machine
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">
              I view the market as an art form: unpredictable movement shaped by data, attention,
              and every person inside it.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Green Machine is the research lane inside XIV. It is where I keep market history,
              structured data, risk questions, and the daily practice of looking closely in one
              place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#research"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-signal-green hover:text-bg"
              >
                Enter the research
              </Link>
              <Link
                href="/systems/green-machine"
                className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-signal-green/40 hover:text-ink"
              >
                XIV project page
              </Link>
              <Link
                href="https://github.com/marcelozap/Green-Machine"
                className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-signal-green/40 hover:text-ink"
              >
                GitHub
              </Link>
            </div>
          </div>

          <TerrainMap />
        </div>
      </section>

      <section id="research" className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold text-signal-green">The practice</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Less prediction. More perception.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              The point is not to flatten an uncertain world into a clean answer. The point is to
              build a better relationship with the evidence before acting.
            </p>
          </div>

          <div className="grid gap-3">
            {researchAreas.map((area) => (
              <article key={area.title} className="border border-white/[0.06] bg-white/[0.03] p-5">
                <h3 className="text-base font-semibold text-ink">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Built with
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {stack.map((item) => (
              <li key={item} className="mono-tag normal-case tracking-wider">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-l border-white/[0.1] pl-6 lg:pl-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Why it exists
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
            A market is not only a chart. It is a living record of incentives, fear, attention,
            timing, and human choice. Green Machine is my attempt to study that record with enough
            structure to learn from it and enough humility to leave room for what I do not know.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap gap-5 border-t border-white/[0.08] px-6 py-8 text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">
          Back to XIV
        </Link>
        <Link href="/ai-blog" className="hover:text-ink">
          Read the AI Blog
        </Link>
      </footer>
    </main>
  );
}
