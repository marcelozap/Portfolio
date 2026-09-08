'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { generateScenario } from '@/lib/practice-engine';
import { PriceChart } from './PriceChart';
import styles from './PlayTeaser.module.css';

const COPY = {
  en: {
    label: 'Practice game · free · in your browser',
    title: 'One song. One session.',
    body: 'One thesis. A risk plan. Practice the move. Review the session.',
    cta: 'Play the tape',
    fresh: 'Virtual funds. Long or short from the start. Progress unlocks more size.',
    chart: 'Fictional practice chart · prices in USD',
    history: 'My real trades & journal on MaloSound.ai',
  },
  es: {
    label: 'Juego de práctica · gratis · en tu navegador',
    title: 'Una canción. Una sesión.',
    body: 'Una tesis. Un plan de riesgo. Practica el movimiento. Revisa la sesión.',
    cta: 'Practicar',
    fresh: 'Fondos virtuales. Al alza o a la baja desde el inicio. El progreso abre más tamaño.',
    chart: 'Gráfico ficticio de práctica · precios en USD',
    history: 'Mis operaciones reales y mi diario en MaloSound.ai',
  },
};

function daySeed() {
  const d = new Date();
  return (d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate()) >>> 0;
}

export function PlayTeaser({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const t = COPY[locale];
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    setSeed(daySeed());
  }, []);

  const scenario = useMemo(() => (seed === null ? null : generateScenario(seed)), [seed]);
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
        {scenario && <p className={styles.chartCaption}>{t.chart}</p>}
      </div>
      <div className={styles.copy}>
        <p className={styles.label}>{t.label}</p>
        <h3>{t.title}</h3>
        <p>{t.body}</p>
        <p className={styles.fresh}>{t.fresh}</p>
        <Link href={href} className={styles.cta}>
          {t.cta}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <a
          href="https://malosound.ai/"
          className={styles.history}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.history} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
