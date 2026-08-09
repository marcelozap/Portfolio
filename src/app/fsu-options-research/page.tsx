import Link from 'next/link';

const researchAreas = [
  {
    title: 'Market data',
    text: 'Market context, historical datasets, labels, and repeatable review flows.',
  },
  {
    title: 'Backtesting',
    text: 'Test notes, assumptions, limits, and follow-up questions for software-driven review.',
  },
  {
    title: 'Risk analysis',
    text: 'Risk notes, uncertainty checks, and AI-assisted summaries for missed context.',
  },
];

const stack = ['Python', 'FastAPI', 'React', 'SQL', 'pytest', 'backtesting', 'labels', 'AI notes'];

const whatItIs = [
  'market research system',
  'market data analysis',
  'backtesting notes',
  'risk review',
];

const whatItIsNot = ['recommendations', 'managed accounts', 'execution tools', 'copy systems'];

function TerrainMap() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,hsl(150_16%_15%),hsl(156_22%_7%))] shadow-glow">
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_12%,hsl(150_20%_84%/0.16),transparent_66%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(150_12%_86%/0.035)_1px,transparent_1px),linear-gradient(0deg,hsl(150_12%_86%/0.03)_1px,transparent_1px)] bg-[size:58px_58px]" />

      <svg viewBox="0 0 100 72" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="case-mist" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(150 24% 86%)" stopOpacity="0.18" />
            <stop offset="1" stopColor="hsl(150 26% 10%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="case-forest" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="hsl(142 34% 42%)" stopOpacity="0.26" />
            <stop offset="1" stopColor="hsl(150 28% 7%)" stopOpacity="0.74" />
          </linearGradient>
        </defs>
        <polygon
          points="0,72 0,24 8,20 17,27 27,18 36,30 47,22 58,26 68,16 78,24 89,18 100,26 100,72"
          fill="url(#case-mist)"
        />
        <polygon
          points="0,72 0,40 7,35 15,42 25,31 35,39 44,30 54,36 64,28 75,37 84,31 93,38 100,34 100,72"
          fill="hsl(150 22% 18% / 0.78)"
        />
        <polygon
          points="0,72 0,53 8,49 16,54 26,48 35,55 45,50 55,54 65,47 76,55 86,51 95,56 100,52 100,72"
          fill="url(#case-forest)"
        />
        <polyline
          points="0,40 7,35 15,42 25,31 35,39 44,30 54,36 64,28 75,37 84,31 93,38 100,34"
          fill="none"
          stroke="hsl(150 48% 66% / 0.68)"
          strokeWidth="0.38"
        />
        <path
          d="M5 58 C18 51 29 52 41 44 C53 36 63 38 76 29 C85 23 93 23 100 20"
          fill="none"
          stroke="hsl(150 52% 72% / 0.7)"
          strokeDasharray="1.8 1.6"
          strokeWidth="0.34"
        />
      </svg>

      <div className="absolute left-6 top-6 text-xs font-medium text-ink-faint">
        market data / review
      </div>
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/[0.08] bg-bg/55 p-4 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Boundary
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          Research software project. No recommendations, no managed accounts, no order execution.
        </p>
      </div>
    </div>
  );
}

export default function FsuOptionsResearchPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Link href="/" className="text-sm font-medium text-ink-faint transition hover:text-ink">
          Marcelo Zapata / Portfolio
        </Link>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-signal-green">
              Software engineering case study
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">
              Green Machine
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Market data, evidence review, backtesting notes, and risk context.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              A software engineering case study for turning market history, structured data,
              assumptions, and human-reviewed risk questions into a cleaner research workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#concept"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-signal-green hover:text-bg"
              >
                View notes
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-signal-green/40 hover:text-ink"
              >
                Back home
              </Link>
            </div>
          </div>

          <TerrainMap />
        </div>
      </section>

      <section id="concept" className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold text-signal-green">Concept</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Study first.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              Market history is treated as something to test and review. The project keeps data,
              notes, assumptions, risks, and questions in one software workflow.
            </p>
          </div>

          <div className="grid gap-3">
            {researchAreas.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5"
              >
                <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3">
        <div>
          <h2 className="font-display text-3xl leading-tight text-ink">Stack</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {stack.map((item) => (
              <li key={item} className="mono-tag normal-case tracking-wider">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="text-base font-semibold text-ink">What it is</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
            {whatItIs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="text-base font-semibold text-ink">What it is not</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
            {whatItIsNot.map((item) => (
              <li key={item}>not {item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
