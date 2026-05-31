import Link from 'next/link';

const terrainIdeas = [
  {
    title: 'Chart Lines as Terrain',
    text: 'The visual language connects market history with navigation: ridges, elevation paths, tree lines, risk, and long-term context.',
  },
  {
    title: 'Research Organization',
    text: 'Structured notes, local datasets, historical context, and research outputs stay together so prior work can become easier to revisit.',
  },
  {
    title: 'Private Research Copilot',
    text: 'LLM-assisted workflows help summarize assumptions, review notes, and turn scattered context into durable research memory.',
  },
];

const stack = [
  'Python',
  'FastAPI',
  'React',
  'SQLite',
  'pytest',
  'local data storage',
  'tested API routes',
  'LLM-assisted workflows',
];

const whatItIs = [
  'research organization',
  'historical market context',
  'structured datasets',
  'private research copilot',
];

const whatItIsNot = [
  'automated trading',
  'financial advice',
  'signal service',
  'broker order routing',
];

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
          points="0,24 8,20 17,27 27,18 36,30 47,22 58,26 68,16 78,24 89,18 100,26"
          fill="none"
          stroke="hsl(150 20% 84% / 0.28)"
          strokeWidth="0.25"
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
        <path
          d="M0 64 C17 59 30 61 43 56 C55 52 64 49 76 50 C88 51 94 45 100 43"
          fill="none"
          stroke="hsl(150 20% 86% / 0.24)"
          strokeDasharray="1 2"
          strokeWidth="0.22"
        />

        {Array.from({ length: 28 }, (_, i) => {
          const x = 3 + i * 3.6;
          const h = 2.4 + (i % 5) * 0.75;
          const y = 54 + (i % 4) * 1.3;
          return (
            <g key={i} opacity="0.7">
              <path
                d={`M${x} ${y - h} L${x - h * 0.45} ${y} L${x + h * 0.45} ${y} Z`}
                fill="hsl(145 34% 35% / 0.7)"
              />
              <line
                x1={x}
                x2={x}
                y1={y - h * 0.12}
                y2={y + 1.6}
                stroke="hsl(150 18% 14% / 0.7)"
                strokeWidth="0.16"
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
        terrain / context / review
      </div>
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/[0.08] bg-bg/55 p-4 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Research Boundary
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          Private research memory for market history and review. No live broker order routing, no
          signal service, and no financial advice.
        </p>
      </div>
    </div>
  );
}

export default function GreenMachineCaseStudyPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint transition hover:text-ink"
        >
          Marcelo Zapata / Portfolio
        </Link>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-signal-green">
              Financial research as terrain
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">
              Green Machine
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Researching financial markets through data, context, and structured review.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Green Machine is a Python/FastAPI, React, and LLM-assisted research project for
              organizing financial research, historical market context, local datasets, and durable
              research outputs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#concept"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-signal-green hover:text-bg"
              >
                View concept
              </Link>
              <Link
                href="/#projects"
                className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-signal-green/40 hover:text-ink"
              >
                Back to projects
              </Link>
            </div>
          </div>

          <TerrainMap />
        </div>
      </section>

      <section id="concept" className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-signal-green">
              Concept
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Chart Lines as Terrain
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              Market history is presented as a landscape to study rather than a screen of commands
              to act on. The design connects pattern review with navigation through terrain,
              elevation, uncertainty, and long-term context.
            </p>
          </div>

          <div className="grid gap-3">
            {terrainIdeas.map((item) => (
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
          <h2 className="font-display text-3xl leading-tight text-ink">Technical Stack</h2>
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
