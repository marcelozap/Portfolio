/** Nine independent strokes matching Marcelo's segmented time tattoo. */
export function XivWordmark({ width = 76 }: { width?: number }) {
  return (
    <svg
      width={width}
      height={width * 0.4}
      viewBox="0 0 150 60"
      role="img"
      aria-label="XIV"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="square" fill="none">
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
    </svg>
  );
}
