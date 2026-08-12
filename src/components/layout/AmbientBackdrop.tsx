const CITY_MARKERS = [
  { label: 'SYSTEMS', className: 'left-[5%] top-[18%] text-accent/28' },
  { label: 'SHENZHEN', className: 'left-[13%] top-[62%] text-accent/18' },
  { label: 'TOKYO', className: 'right-[8%] top-[21%] text-accent-cool/22' },
  { label: 'SEOUL', className: 'right-[18%] top-[68%] text-accent-warm/18' },
  { label: 'DATA', className: 'left-[44%] top-[13%] text-accent/16' },
  { label: 'SOUND', className: 'right-[34%] top-[46%] text-accent-cool/16' },
];

export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_72%_18%,hsl(var(--accent)/0.18),transparent_64%),radial-gradient(ellipse_42%_34%_at_18%_78%,hsl(var(--accent-warm)/0.11),transparent_68%),radial-gradient(ellipse_54%_46%_at_52%_38%,hsl(var(--accent-cool)/0.12),transparent_72%)] [mix-blend-mode:screen]" />
      <div className="bg-accent/18 absolute -right-[8%] -top-[14%] h-[52vw] w-[52vw] rounded-full blur-[92px] [mix-blend-mode:screen]" />
      <div className="bg-accent-warm/12 absolute -bottom-[16%] -left-[10%] h-[44vw] w-[44vw] rounded-full blur-[92px] [mix-blend-mode:screen]" />
      <div className="bg-accent-cool/12 absolute left-[26%] top-[24%] h-[38vw] w-[38vw] rounded-full blur-[92px] [mix-blend-mode:screen]" />

      <div className="absolute inset-0 opacity-70 blur-[18px] [background:linear-gradient(90deg,transparent_0%,hsl(var(--accent)/0.12)_4%,transparent_8%),linear-gradient(90deg,transparent_19%,hsl(var(--accent-warm)/0.06)_21%,transparent_25%),linear-gradient(90deg,transparent_45%,hsl(var(--accent-cool)/0.1)_49%,transparent_53%),linear-gradient(90deg,transparent_72%,hsl(var(--accent-warm)/0.055)_74%,transparent_77%),linear-gradient(90deg,transparent_88%,hsl(var(--accent)/0.13)_91%,transparent_95%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--accent)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent)/0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_84%_66%_at_50%_46%,#000_12%,transparent_76%)]" />
      <div className="absolute inset-0 opacity-55 [background:linear-gradient(105deg,transparent_0%,transparent_42%,hsl(var(--accent)/0.11)_43%,transparent_45%,transparent_58%,hsl(var(--accent-cool)/0.09)_59%,transparent_61%),linear-gradient(75deg,transparent_0%,transparent_66%,hsl(var(--accent-warm)/0.08)_67%,transparent_69%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_49%,hsl(var(--accent)/0.05)_50%,transparent_51%,transparent_100%)] bg-[size:100%_7px] opacity-35" />
      <div className="absolute bottom-[8%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-70" />
      <div className="absolute left-[8%] top-0 h-full w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      <div className="via-accent-cool/22 absolute right-[11%] top-0 h-full w-px bg-gradient-to-b from-transparent to-transparent" />
      <div className="via-accent-warm/14 absolute left-[58%] top-0 h-full w-px bg-gradient-to-b from-transparent to-transparent" />
      {CITY_MARKERS.map((marker) => (
        <div
          key={marker.label}
          className={`absolute hidden select-none font-mono text-[10px] font-semibold uppercase tracking-[0.46em] [writing-mode:vertical-rl] md:block ${marker.className}`}
        >
          {marker.label}
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_68%_at_50%_46%,transparent_34%,hsl(var(--bg)/0.82)_100%)]" />

      <div
        className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-overlay"
        style={{ backgroundSize: '160px 160px' }}
      />
    </div>
  );
}
