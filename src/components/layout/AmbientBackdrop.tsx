export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      <div className="absolute -right-[8%] -top-[14%] h-[52vw] w-[52vw] rounded-full bg-accent/15 blur-[90px] [mix-blend-mode:screen]" />
      <div className="absolute -bottom-[16%] -left-[10%] h-[44vw] w-[44vw] rounded-full bg-accent-warm/10 blur-[90px] [mix-blend-mode:screen]" />
      <div className="absolute left-[26%] top-[24%] h-[38vw] w-[38vw] rounded-full bg-accent/10 blur-[90px] [mix-blend-mode:screen]" />
      <div className="absolute bottom-[14%] right-[16%] h-[26vw] w-[26vw] rounded-full bg-accent-warm/10 blur-[90px] [mix-blend-mode:screen]" />
      <div className="absolute left-[6%] top-[56%] h-[20vw] w-[20vw] rounded-full bg-accent-cool/5 blur-[90px] [mix-blend-mode:screen]" />

      <div className="absolute inset-0 opacity-50 blur-[22px] [background:linear-gradient(90deg,transparent_0%,hsl(var(--accent)/0.08)_4%,transparent_8%),linear-gradient(90deg,transparent_22%,hsl(var(--accent-warm)/0.05)_24%,transparent_27%),linear-gradient(90deg,transparent_48%,hsl(var(--accent-cool)/0.05)_51%,transparent_54%),linear-gradient(90deg,transparent_72%,hsl(var(--accent-warm)/0.04)_74%,transparent_77%),linear-gradient(90deg,transparent_88%,hsl(var(--accent)/0.08)_91%,transparent_95%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--accent)/0.035)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent)/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_84%_66%_at_50%_46%,#000_12%,transparent_76%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_68%_at_50%_46%,transparent_34%,hsl(var(--bg)/0.82)_100%)]" />

      <div
        className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-overlay"
        style={{ backgroundSize: '160px 160px' }}
      />
    </div>
  );
}
