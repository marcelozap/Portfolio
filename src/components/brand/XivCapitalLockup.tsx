/** Segmented XIV mark plus CAPITAL lockup. Cream strokes on dark surfaces. */
export function XivCapitalLockup({
  width = 168,
  showCapital = true,
  title,
}: {
  width?: number;
  showCapital?: boolean;
  title?: string;
}) {
  const label = title ?? (showCapital ? 'XIV CAPITAL' : 'XIV');
  const viewBox = showCapital ? '0 0 150 92' : '0 0 150 60';
  const height = showCapital ? width * (92 / 150) : width * (60 / 150);

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <g stroke="currentColor" strokeWidth="3.6" strokeLinecap="square" fill="none">
        <path d="M5 5 L23 25" />
        <path d="M45 5 L27 25" />
        <path d="M23 35 L5 55" />
        <path d="M27 35 L45 55" />
        <path d="M75 5 L75 25" />
        <path d="M75 35 L75 55" />
        <path d="M110 5 L110 25" />
        <path d="M110 35 L110 55" />
        <path d="M119 53 L144 29" />
      </g>
      {showCapital ? (
        <text
          x="75"
          y="84"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="Georgia, 'Times New Roman', Times, serif"
          fontSize="10"
          letterSpacing="5.2"
        >
          CAPITAL
        </text>
      ) : null}
    </svg>
  );
}
