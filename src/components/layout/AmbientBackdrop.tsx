'use client';

/**
 * Site-wide backdrop: quiet structural grid, editorial vignettes, and a small
 * amount of texture. No mascots, floating icons, or particle effects.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.34] hue-rotate-[8deg] saturate-[0.82]"
        style={{
          backgroundImage: "url('/brand/xiv-interconnected-terrain-wallpaper.png')",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--bg)/0.92)_0%,hsl(var(--bg)/0.72)_18%,hsl(var(--bg)/0.5)_52%,hsl(var(--bg)/0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_76%_28%,hsl(var(--accent)/0.18),transparent_62%),radial-gradient(58%_42%_at_17%_72%,hsl(var(--accent-cool)/0.11),transparent_58%),radial-gradient(48%_36%_at_82%_82%,hsl(var(--accent-warm)/0.075),transparent_60%)]" />
      <div className="grid-bg absolute inset-0 opacity-[0.1]" />
      <svg
        viewBox="0 0 1440 900"
        className="absolute inset-0 size-full opacity-[0.26]"
        preserveAspectRatio="none"
      >
        <path
          d="M-80 650 C150 590 270 700 470 610 C640 535 690 410 880 454 C1040 492 1150 330 1510 392"
          fill="none"
          stroke="hsl(var(--accent) / 0.48)"
          strokeWidth="1"
          strokeDasharray="8 14"
        />
        <path
          d="M-60 370 C120 315 245 355 390 280 C520 212 630 286 760 238 C895 188 1005 250 1160 190 C1265 150 1348 162 1510 104"
          fill="none"
          stroke="hsl(var(--accent-warm) / 0.34)"
          strokeWidth="0.8"
        />
        <path
          d="M120 760 C270 720 365 780 510 725 C640 676 720 700 850 632 C980 565 1130 646 1320 550"
          fill="none"
          stroke="hsl(var(--accent-cool) / 0.42)"
          strokeWidth="0.9"
        />
      </svg>
      <div className="absolute left-0 top-0 h-full w-px bg-white/10" />
      <div className="absolute right-[16%] top-0 h-full w-px bg-white/[0.035]" />
      <div className="absolute inset-x-0 top-[16%] h-px bg-white/[0.045]" />
      <div className="absolute inset-x-0 top-[68%] h-px bg-white/[0.035]" />

      <div
        className="absolute inset-0 bg-noise opacity-[0.1] mix-blend-overlay"
        style={{ backgroundSize: '160px 160px' }}
      />

      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-bg via-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
