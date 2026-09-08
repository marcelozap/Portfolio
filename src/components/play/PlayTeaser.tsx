'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { computeStats, generateScenario, type Receipt } from '@/lib/practice-engine';
import { PriceChart } from './PriceChart';
import styles from './PlayTeaser.module.css';

const COPY = {
  en: {
    label: 'Practice game · free · in your browser',
    title: 'Buy. Sell. Ride the tape.',
    body: 'A live fictional tape, big buttons, hotkeys. Reach +14% and betting down unlocks.',
    cta: 'Play',
    resume: 'Continue',
    receipts: 'receipts',
    rule: 'rule-follow',
    expect: 'expectancy',
    fresh: 'A new fictional scenario every day. This is today’s.',
  },
  es: {
    label: 'Juego de práctica · gratis · en tu navegador',
    title: 'Compra. Vende. Sigue la cinta.',
    body: 'Una cinta ficticia en vivo, botones grandes y atajos de teclado. Llega a +14% y se desbloquea apostar a la baja.',
    cta: 'Jugar',
    resume: 'Continuar',
    receipts: 'recibos',
    rule: 'cumplimiento',
    expect: 'expectativa',
    fresh: 'Un escenario ficticio nuevo cada día. Este es el de hoy.',
  },
};

function daySeed() {
  const d = new Date();
  return (d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate()) >>> 0;
}

export function PlayTeaser({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const t = COPY[locale];
  const [seed, setSeed] = useState<number | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    setSeed(daySeed());
    try {
      const raw = window.localStorage.getItem('xiv-practice-game-v1');
      if (raw) setReceipts((JSON.parse(raw).receipts as Receipt[]) ?? []);
    } catch {
      /* no stored journal */
    }
  }, []);

  const scenario = useMemo(() => (seed === null ? null : generateScenario(seed)), [seed]);
  const stats = computeStats(receipts);
  const href = locale === 'es' ? '/es/play' : '/play';

  return (
    <div className={styles.teaser}>
      <div className={styles.chartWrap}>
        {scenario ? (
          <PriceChart
            bars={scenario.history}
            historyLength={scenario.history.length}
            levels={[]}
            height={200}
          />
        ) : (
          <div className={styles.chartGhost} aria-hidden="true" />
        )}
        {scenario && (
          <p className={styles.chartCaption}>
            <span>{scenario.ticker}</span> {scenario.name} · {scenario.regime}
          </p>
        )}
      </div>
      <div className={styles.copy}>
        <p className={styles.label}>{t.label}</p>
        <h3>{t.title}</h3>
        <p>{t.body}</p>
        {receipts.length > 0 ? (
          <dl className={styles.stats}>
            <div>
              <dt>{t.receipts}</dt>
              <dd>{receipts.length}</dd>
            </div>
            <div>
              <dt>{t.rule}</dt>
              <dd>
                {stats.ruleFollowRate === null ? '—' : `${Math.round(stats.ruleFollowRate * 100)}%`}
              </dd>
            </div>
            <div>
              <dt>{t.expect}</dt>
              <dd>
                {stats.expectancyR === null
                  ? '—'
                  : `${stats.expectancyR >= 0 ? '+' : ''}${stats.expectancyR.toFixed(2)}R`}
              </dd>
            </div>
          </dl>
        ) : (
          <p className={styles.fresh}>{t.fresh}</p>
        )}
        <Link href={href} className={styles.cta}>
          {receipts.length > 0 ? t.resume : t.cta}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
