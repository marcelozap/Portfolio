'use client';

/**
 * Site-wide backdrop: quiet structural grid, editorial vignettes, and a small
 * amount of texture. No mascots, floating icons, or particle effects.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-[0.22]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--accent)/0.075),transparent_34%,transparent_64%,hsl(var(--accent-warm)/0.045))]" />
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
