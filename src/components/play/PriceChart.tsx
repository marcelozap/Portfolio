import type { Bar } from '@/lib/practice-engine';
import styles from './PracticeGame.module.css';

interface Level {
  price: number;
  label: string;
  tone: 'invalidation' | 'scenario' | 'entry';
}

/**
 * Inline SVG price chart. Closes as a line, highs/lows as a faint band,
 * horizontal levels for the card. Fictional data, no axes ticks beyond
 * first/last price so it reads as a sketch, not a terminal.
 */
export function PriceChart({
  bars,
  historyLength,
  levels,
  height = 260,
}: {
  bars: Bar[];
  historyLength: number;
  levels: Level[];
  height?: number;
}) {
  const width = 760;
  const padX = 14;
  const padY = 18;
  const prices = bars.flatMap((b) => [b.h, b.l]).concat(levels.map((l) => l.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(max - min, 0.01);
  const x = (i: number) => padX + (i / Math.max(bars.length - 1, 1)) * (width - padX * 2);
  const y = (p: number) => padY + (1 - (p - min) / span) * (height - padY * 2);

  const closeLine = bars.map((b, i) => `${x(i).toFixed(1)},${y(b.c).toFixed(1)}`).join(' ');
  const band =
    bars.map((b, i) => `${x(i).toFixed(1)},${y(b.h).toFixed(1)}`).join(' ') +
    ' ' +
    [...bars]
      .reverse()
      .map((b, i) => `${x(bars.length - 1 - i).toFixed(1)},${y(b.l).toFixed(1)}`)
      .join(' ');
  const last = bars[bars.length - 1];
  const nowX = x(historyLength - 1);

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Fictional price path"
      preserveAspectRatio="none"
    >
      <polygon points={band} className={styles.chartBand} />
      {bars.length > historyLength && (
        <line x1={nowX} x2={nowX} y1={padY} y2={height - padY} className={styles.chartNow} />
      )}
      {levels.map((l) => (
        <g key={l.label} className={styles[`level_${l.tone}`]}>
          <line x1={padX} x2={width - padX} y1={y(l.price)} y2={y(l.price)} />
          <text x={width - padX} y={y(l.price) - 4} textAnchor="end">
            {l.label} {l.price.toFixed(2)}
          </text>
        </g>
      ))}
      <polyline points={closeLine} className={styles.chartLine} />
      <circle cx={x(bars.length - 1)} cy={y(last.c)} r={3.5} className={styles.chartDot} />
      <text x={padX} y={height - 4} className={styles.chartAxis}>
        {min.toFixed(2)}
      </text>
      <text x={padX} y={padY - 5} className={styles.chartAxis}>
        {max.toFixed(2)}
      </text>
    </svg>
  );
}
