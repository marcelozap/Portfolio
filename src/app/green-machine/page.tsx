import Link from 'next/link';

const proof = [
  ['127', 'local tests passing across Engine, research, and API-adjacent surfaces'],
  [
    '7+',
    'research memos covering momentum, regime overlays, risk, validation, and execution data honesty',
  ],
  ['0', 'live broker order routes exposed by design'],
  ['C#', 'Windows launcher for the local OS shell'],
];

const bullets = [
  {
    title: 'Execution analytics',
    text: 'Built TCA-style analytics for arrival price, fill price, slippage bps, implementation shortfall, model parity, and daily execution review.',
  },
  {
    title: 'Local-first research Engine',
    text: 'Implemented a Python/FastAPI platform with SQLite-backed data spine, regime analysis, research APIs, paper workflows, and portfolio-safe public endpoints.',
  },
  {
    title: 'Schwab boundary',
    text: 'Integrated Schwab API readiness in read-only and paper-workflow mode while keeping live broker order routing disabled by design.',
  },
  {
    title: 'Desktop OS layer',
    text: 'Created a C# Windows launcher to start the local Engine and open the private cockpit, public proof page, API docs, and execution coach surfaces.',
  },
];

const stack = [
  'Python',
  'FastAPI',
  'SQLite',
  'pytest',
  'pandas',
  'C#/.NET',
  'Schwab API',
  'OAuth 2.0',
  'transaction cost analysis',
  'risk gates',
  'paper execution',
  'LLM review',
];

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

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-signal-green">
              Execution-focused quant trading project
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">
              Green Machine Quant OS
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">
              A local-first quantitative trading research system for execution analytics, market
              regime work, risk gates, paper fill review, and desk-style research communication.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#resume-section"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-signal-green hover:text-bg"
              >
                Resume section
              </Link>
              <Link
                href="/#projects"
                className="rounded-full border border-white/[0.1] px-5 py-3 text-sm font-semibold text-ink-muted transition hover:border-signal-green/40 hover:text-ink"
              >
                Back to projects
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 shadow-glow">
            <div className="rounded-[1.5rem] border border-signal-green/25 bg-signal-green/10 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-green">
                System boundary
              </div>
              <p className="mt-3 text-2xl font-semibold leading-tight text-ink">
                Research, paper execution, and review. No live broker order routing.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {proof.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/[0.06] bg-bg/40 p-4">
                  <div className="font-display text-3xl text-ink">{value}</div>
                  <div className="mt-2 text-sm leading-relaxed text-ink-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="resume-section" className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-signal-green">
              Resume section
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Trading + execution + data automation.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              This project is positioned for execution-focused quant trading, trading analytics,
              execution analyst, and desk-adjacent Python/data automation roles. It is intentionally
              not branded as an AI trading bot.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {stack.map((item) => (
                <li key={item} className="mono-tag normal-case tracking-wider">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3">
            {bullets.map((item) => (
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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">Why it matters</h2>
        <p className="mt-5 max-w-4xl text-lg leading-relaxed text-ink-muted">
          Green Machine is built around the part of trading where money meets the market: fills,
          liquidity, slippage, timing, risk, and the review loop that makes a trader more useful to
          a desk. The public page shows architecture and safe proof; the real OS stays local for
          private data and broker credentials.
        </p>
      </section>
    </main>
  );
}
