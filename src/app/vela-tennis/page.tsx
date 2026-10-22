import Link from 'next/link';

export default function VelaTennisPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-24 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Link href="/" className="text-sm font-medium text-ink-faint transition hover:text-ink">
            Marcelo Zapata / Portfolio
          </Link>
          <p className="mt-16 text-sm font-semibold text-accent-warm">iOS application</p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-ink md:text-7xl">
            Vela Tennis
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl">
            A custom tennis app for practice, review, and building a clearer feedback loop around the game.
          </p>
          <p className="mt-4 text-sm font-medium text-accent-warm">Currently under App Store review.</p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:bg-accent-warm"
          >
            Back home
          </Link>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-black shadow-glow">
          <video
            className="block aspect-[9/16] max-h-[760px] w-full object-contain"
            controls
            playsInline
            preload="metadata"
            src="/video/valetennis-gameplay.mov"
          >
            Your browser does not support video playback.
          </video>
        </div>
      </section>
    </main>
  );
}
