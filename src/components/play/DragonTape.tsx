'use client';

import Link from 'next/link';
import { useEffect, useReducer, useRef } from 'react';
import {
  INITIAL_CASH as CASH0,
  CONTRACT_MULTIPLIER as MULT,
  ORDER_QUANTITIES as QTYS,
  SIZE_TIERS,
  accountEquity,
  canSelectQuantity,
  executeOrder,
  maxPositionSize,
  nextSizeTier,
  quantityForHotkey,
  readProgress,
  writeProgress,
  type TapeAccount,
} from '@/lib/play/dragon-tape-rules';
import styles from './DragonTape.module.css';

const TICK_MS = 250;
const SPOT0 = 500;
const C0 = 5.0;
const KEEP = 360;
const LEV = 12;
const DECAY = 0.00006;
const FAST_SWELL = 1.35;

const COPY = {
  en: {
    title: 'Dragon Tape',
    simulation: 'Simulation · virtual funds',
    details: 'Review this session',
    chartLabel: 'Simulated contract price chart',
    contract: 'Contract price',
    tape: 'underlying',
    calm: 'STEADY',
    fast: 'FAST',
    paused: 'PAUSED',
    foot1: 'Fictional prices. Contract moves are amplified about 12×.',
    foot2: 'Time decay reduces its value while the clock runs.',
    equity: 'Practice equity',
    nextSize: (q: number, target: string) => `${q}× at ${target} best equity`,
    maxSize: 'All sizes open · 14× max',
    sizeLimit: (q: number) => `${q}× max open`,
    closingSize: (q: number) => `${q}× · close only`,
    position: 'Position',
    long: 'LONG',
    short: 'SHORT',
    flat: 'FLAT',
    contracts: 'Contracts',
    avg: 'Average entry',
    openPl: 'Open P&L',
    closedPl: 'Realized P&L',
    cash: 'Cash',
    orders: 'Orders',
    buy: 'BUY',
    sell: 'SELL',
    shortAction: 'SHORT',
    coverAction: 'COVER',
    keyB: 'KEY B',
    keyS: 'KEY S',
    flatten: 'Close all',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'New run',
    fills: 'Practice fills',
    keys: 'buy / cover · sell / short · close · size · pause · new run',
    keysNote: 'Both directions are open. Opposite orders close contracts; they never reverse.',
    sizeToast: (q: number) => `${q}× max open. Close or unlock more size.`,
    cashToast: (q: number) => `Not enough cash for ${q}×`,
    capToast: 'Short exposure capped at 1× equity',
    unlockToast: (q: number) => `${q}× sizing unlocked`,
    priorUnlock: (q: number) => `${q}× sizing saved · both directions open`,
    unlockedFill: 'SIZE UP',
    buyFill: 'BUY',
    coverFill: 'COVER',
    sellFill: 'SELL',
    downFill: 'SHORT',
    journalLink: 'Practice the plan, too.',
    journalCta: 'Open the journal game',
    routine: 'One song. One session. Plan. Practice. Review.',
    saved: 'A fresh tape each run. Only your best equity is saved in this browser.',
    history: 'My real trades & journal on MaloSound.ai',
    disclaimer: 'Simulation. Fictional prices and virtual funds.',
  },
  es: {
    title: 'Dragon Tape',
    simulation: 'Simulación · fondos virtuales',
    details: 'Revisar esta sesión',
    chartLabel: 'Gráfico del precio simulado del contrato',
    contract: 'Precio del contrato',
    tape: 'subyacente',
    calm: 'TRANQUILO',
    fast: 'RÁPIDO',
    paused: 'EN PAUSA',
    foot1: 'Precios ficticios. El contrato amplifica el movimiento unas 12×.',
    foot2: 'El paso del tiempo reduce su valor mientras corre el reloj.',
    equity: 'Capital virtual',
    nextSize: (q: number, target: string) => `${q}× con ${target} de capital máximo`,
    maxSize: 'Todos los tamaños · máximo 14×',
    sizeLimit: (q: number) => `Máximo abierto: ${q}×`,
    closingSize: (q: number) => `${q}× · solo cierre`,
    position: 'Posición',
    long: 'LARGO',
    short: 'CORTO',
    flat: 'SIN POSICIÓN',
    contracts: 'Contratos',
    avg: 'Entrada media',
    openPl: 'P&L abierto',
    closedPl: 'P&L realizado',
    cash: 'Efectivo',
    orders: 'Órdenes',
    buy: 'COMPRAR',
    sell: 'VENDER',
    shortAction: 'CORTO',
    coverAction: 'CUBRIR',
    keyB: 'TECLA B',
    keyS: 'TECLA S',
    flatten: 'Cerrar todo',
    pause: 'Pausa',
    resume: 'Seguir',
    reset: 'Otra partida',
    fills: 'Ejecuciones simuladas',
    keys: 'comprar / cubrir · vender / corto · cerrar · tamaño · pausa · otra partida',
    keysNote:
      'Ambas direcciones están abiertas. Las órdenes opuestas cierran contratos; no invierten la posición.',
    sizeToast: (q: number) => `Máximo abierto: ${q}×. Cierra o desbloquea más tamaño.`,
    cashToast: (q: number) => `No hay efectivo para ${q}×`,
    capToast: 'Exposición corta limitada a 1× el capital',
    unlockToast: (q: number) => `Tamaño de ${q}× desbloqueado`,
    priorUnlock: (q: number) => `${q}× guardado · ambas direcciones abiertas`,
    unlockedFill: 'MÁS TAMAÑO',
    buyFill: 'COMPRA',
    coverFill: 'CIERRE',
    sellFill: 'VENTA',
    downFill: 'CORTO',
    journalLink: 'Practica el plan también.',
    journalCta: 'Abrir el juego de diario',
    routine: 'Una canción. Una sesión. Planifica. Practica. Revisa.',
    saved: 'Cada partida es nueva. Solo tu capital máximo se guarda en este navegador.',
    history: 'Mis operaciones reales y mi diario en MaloSound.ai',
    disclaimer: 'Simulación. Precios ficticios y fondos virtuales.',
  },
};

type Fill = { at: string; side: string; cls: 'b' | 's' | 'g'; qty: number; px: number };

type Game = TapeAccount & {
  spot: number;
  prices: number[];
  elapsed: number;
  paused: boolean;
  drift: number;
  driftLeft: number;
  stressed: boolean;
  swell: number;
  qty: number;
  fills: Fill[];
  toast: string;
  toastGold: boolean;
  ready: boolean;
};

function loadSaved(): { best: number } {
  try {
    return readProgress(window.localStorage.getItem('xiv-dragon-tape-v1'));
  } catch {
    /* fresh run */
  }
  return { best: CASH0 };
}

function persist(game: Game) {
  try {
    window.localStorage.setItem('xiv-dragon-tape-v1', writeProgress(game.best));
  } catch {
    /* storage unavailable */
  }
}

function freshGame(): Game {
  return {
    spot: SPOT0,
    c: C0,
    prices: [],
    elapsed: 0,
    paused: false,
    drift: 0,
    driftLeft: 0,
    stressed: false,
    swell: 1,
    cash: CASH0,
    posQty: 0,
    avg: 0,
    realized: 0,
    qty: 1,
    best: CASH0,
    fills: [],
    toast: '',
    toastGold: false,
    ready: false,
  };
}

function step(g: Game) {
  if (g.driftLeft <= 0) {
    const r = Math.random();
    g.drift = (r < 0.34 ? -1 : r < 0.68 ? 0 : 1) * 0.00028;
    g.driftLeft = 80 + Math.floor(Math.random() * 240);
  }
  g.driftLeft--;
  if (!g.stressed && Math.random() < 0.004) g.stressed = true;
  else if (g.stressed && Math.random() < 0.012) g.stressed = false;
  const vol = g.stressed ? 0.0019 : 0.0005;
  const gauss = (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;
  const prevSpot = g.spot;
  g.spot = Math.max(5, g.spot * (1 + g.drift + vol * gauss));
  const dPct = g.spot / prevSpot - 1;
  const targetSwell = g.stressed ? FAST_SWELL : 1;
  g.swell += (targetSwell - g.swell) * 0.02;
  const swellDrift = targetSwell - g.swell > 0 ? 0.0006 : g.swell > 1.001 ? -0.0002 : 0;
  g.c = Math.max(0.05, g.c * (1 + LEV * dPct - DECAY + swellDrift));
  g.prices.push(g.c);
  if (g.prices.length > KEEP) g.prices.shift();
  g.elapsed += TICK_MS;
}

function clock(g: Game) {
  const mm = Math.floor(g.elapsed / 60000);
  const ss = Math.floor(g.elapsed / 1000) % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const fmt$ = (v: number) =>
  `${v < 0 ? '-$' : '$'}${Math.abs(v).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function DragonTape({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const t = COPY[locale];
  const gameRef = useRef<Game>(freshGame());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);

  const record = (g: Game, side: string, cls: Fill['cls'], qty: number, px: number) => {
    g.fills.unshift({ at: clock(g), side, cls, qty, px });
    if (g.fills.length > 60) g.fills.pop();
  };

  const trade = (g: Game, side: 'buy' | 'sell') => {
    const result = executeOrder(g, side, g.qty);
    if (result.error) {
      g.toast =
        result.error === 'cash'
          ? t.cashToast(g.qty)
          : result.error === 'cap'
            ? t.capToast
            : t.sizeToast(maxPositionSize(g.best));
      g.toastGold = false;
      return;
    }
    Object.assign(g, result.account);
    const fill = result.fill;
    const labels = { buy: t.buyFill, cover: t.coverFill, sell: t.sellFill, short: t.downFill };
    record(g, labels[fill.kind], side === 'buy' ? 'b' : 's', fill.qty, fill.px);
    g.toast = '';
    g.toastGold = false;
    afterTick(g);
  };

  const buy = (g: Game) => trade(g, 'buy');
  const sell = (g: Game) => trade(g, 'sell');

  const selectQuantity = (g: Game, quantity: number) => {
    if (canSelectQuantity(g, quantity)) {
      g.qty = quantity;
      g.toast = '';
    } else {
      g.toast = t.sizeToast(maxPositionSize(g.best));
    }
    g.toastGold = false;
  };

  const flatten = (g: Game) => {
    if (g.posQty > 0) {
      const keep = g.qty;
      g.qty = g.posQty;
      sell(g);
      g.qty = keep;
    } else if (g.posQty < 0) {
      const keep = g.qty;
      g.qty = -g.posQty;
      buy(g);
      g.qty = keep;
    }
  };

  const afterTick = (g: Game) => {
    const eq = accountEquity(g);
    const previousSize = maxPositionSize(g.best);
    if (eq > g.best) {
      g.best = eq;
      persist(g);
    }
    const newSize = maxPositionSize(g.best);
    if (newSize > previousSize) {
      record(g, t.unlockedFill, 'g', newSize, g.c);
      g.toast = t.unlockToast(newSize);
      g.toastGold = true;
    }
  };

  const draw = (g: Game) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (!W || !H) return;
    cx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    const p = g.prices;
    cx.clearRect(0, 0, W, H);
    if (p.length < 2) return;
    let lo = Math.min(...p);
    let hi = Math.max(...p);
    const pad = (hi - lo) * 0.12 + 0.02;
    lo -= pad;
    hi += pad;
    const X = (i: number) => (i / (KEEP - 1)) * (W - 52);
    const Y = (v: number) => H - 8 - ((v - lo) / (hi - lo)) * (H - 16);
    cx.strokeStyle = 'rgba(233, 221, 236, 0.16)';
    cx.fillStyle = 'rgba(233, 221, 236, 0.55)';
    cx.font = '11px monospace';
    cx.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      const v = lo + ((hi - lo) * (k + 0.5)) / 4;
      const y = Y(v);
      cx.globalAlpha = 0.5;
      cx.beginPath();
      cx.moveTo(0, y);
      cx.lineTo(W - 52, y);
      cx.stroke();
      cx.globalAlpha = 1;
      cx.fillText(v.toFixed(2), W - 46, y + 4);
    }
    if (g.posQty !== 0) {
      cx.strokeStyle = g.posQty > 0 ? 'hsl(142 69% 58%)' : 'hsl(0 100% 71%)';
      cx.setLineDash([6, 6]);
      cx.beginPath();
      cx.moveTo(0, Y(g.avg));
      cx.lineTo(W - 52, Y(g.avg));
      cx.stroke();
      cx.setLineDash([]);
    }
    cx.strokeStyle = 'hsl(38 100% 56%)';
    cx.lineWidth = 1.75;
    cx.beginPath();
    const off = KEEP - p.length;
    for (let i = 0; i < p.length; i++) {
      const x = X(off + i);
      const y = Y(p[i]);
      if (i) cx.lineTo(x, y);
      else cx.moveTo(x, y);
    }
    cx.stroke();
    cx.fillStyle = 'hsl(38 100% 56%)';
    cx.beginPath();
    cx.arc(X(KEEP - 1), Y(p[p.length - 1]), 3, 0, 7);
    cx.fill();
  };

  const restart = () => {
    const saved = loadSaved();
    const g = freshGame();
    g.best = saved.best;
    for (let i = 0; i < KEEP / 2; i++) step(g);
    g.elapsed = 0;
    const savedSize = maxPositionSize(g.best);
    g.toast = savedSize > 1 ? t.priorUnlock(savedSize) : '';
    g.toastGold = false;
    g.ready = true;
    gameRef.current = g;
    draw(g);
    force();
  };

  useEffect(() => {
    restart();
    const canvas = canvasRef.current;
    const resize = new ResizeObserver(() => {
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      draw(gameRef.current);
    });
    if (canvas) resize.observe(canvas);
    const timer = window.setInterval(() => {
      const g = gameRef.current;
      if (!g.paused) {
        step(g);
        afterTick(g);
        draw(g);
        force();
      }
    }, TICK_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      )
        return;
      const g = gameRef.current;
      const k = e.key.toLowerCase();
      if (k === 'b') buy(g);
      else if (k === 's') sell(g);
      else if (k === 'f') flatten(g);
      else if (k === 'p') g.paused = !g.paused;
      else if (k === 'r') {
        restart();
        return;
      } else if (['1', '2', '3', '4'].includes(k)) {
        const quantity = quantityForHotkey(g, k);
        if (quantity === null) {
          g.toast = t.sizeToast(maxPositionSize(g.best));
          g.toastGold = false;
        } else selectQuantity(g, quantity);
      } else return;
      e.preventDefault();
      draw(g);
      force();
    };
    const onVis = () => {
      if (document.hidden) {
        gameRef.current.paused = true;
        force();
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(timer);
      resize.disconnect();
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const g = gameRef.current;
  const eq = accountEquity(g);
  const chg = g.c - C0;
  const upl =
    g.posQty > 0
      ? (g.c - g.avg) * g.posQty * MULT
      : g.posQty < 0
        ? (g.avg - g.c) * -g.posQty * MULT
        : 0;
  const sizeMax = maxPositionSize(g.best);
  const nextTier = nextSizeTier(g.best);
  const previousTarget = SIZE_TIERS.find((tier) => tier.max === sizeMax)?.equity ?? CASH0;
  const pct = nextTier
    ? Math.min(
        100,
        Math.max(0, ((g.best - previousTarget) / (nextTier.equity - previousTarget)) * 100),
      )
    : 100;
  const act = (fn: (game: Game) => void) => () => {
    fn(gameRef.current);
    draw(gameRef.current);
    force();
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>{t.title}</h1>
          <p className={styles.label}>{t.simulation}</p>
        </div>
        <div className={styles.account}>
          <p className={styles.lbl}>{t.equity}</p>
          <p className={styles.equity}>{fmt$(eq)}</p>
          <p className={styles.cash}>
            {t.cash} {fmt$(g.cash)}
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.chartPanel}`} aria-label={t.chartLabel}>
          <div className={styles.pricebar}>
            <span className={styles.sym}>{t.contract}</span>
            <span className={styles.px}>{g.ready ? g.c.toFixed(2) : '—'}</span>
            <span className={chg >= 0 ? styles.pos : styles.neg}>
              {g.ready ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}` : ''}
            </span>
            <span className={`${styles.regime} ${g.stressed ? styles.hot : ''}`}>
              {g.stressed ? t.fast : t.calm}
            </span>
          </div>
          <canvas
            ref={canvasRef}
            className={styles.chart}
            width={1320}
            height={600}
            role="img"
            aria-label={t.chartLabel}
          />
          <div className={styles.chartfoot}>
            <span>
              {t.tape} {g.ready ? g.spot.toFixed(2) : '—'}
            </span>
            <span>{g.ready ? clock(g) : '00:00'}</span>
            {g.paused && <span className={styles.pausedTag}>{t.paused}</span>}
          </div>
        </section>

        <section className={styles.panel} aria-label={t.orders}>
          <div className={styles.positionStrip}>
            <div>
              <p className={styles.lbl}>{t.position}</p>
              <span
                className={`${styles.side} ${
                  g.posQty > 0 ? styles.sideLong : g.posQty < 0 ? styles.sideShort : styles.sideFlat
                }`}
              >
                {g.posQty > 0 ? t.long : g.posQty < 0 ? t.short : t.flat}
                {g.posQty !== 0 && ` · ${Math.abs(g.posQty)}×`}
              </span>
            </div>
            <div className={styles.openPl}>
              <p className={styles.lbl}>{t.openPl}</p>
              <span className={upl >= 0 ? styles.pos : styles.neg}>{fmt$(upl)}</span>
            </div>
          </div>
          <div className={styles.qtyrow} role="group" aria-label={t.contracts}>
            {QTYS.map((q) => {
              const allowed = canSelectQuantity(g, q);
              const tier = SIZE_TIERS.find((candidate) => candidate.max === q)!;
              const label = !allowed
                ? t.nextSize(q, fmt$(tier.equity))
                : q > sizeMax
                  ? t.closingSize(q)
                  : `${q}× · ${t.sizeLimit(sizeMax)}`;
              return (
                <button
                  key={q}
                  type="button"
                  className={`${styles.qty} ${g.qty === q ? styles.qtySel : ''}`}
                  aria-pressed={g.qty === q}
                  aria-label={label}
                  title={label}
                  disabled={!allowed}
                  onClick={act((game) => selectQuantity(game, q))}
                >
                  {q}×{!allowed && <small>+{Math.round((tier.equity / CASH0 - 1) * 100)}%</small>}
                </button>
              );
            })}
          </div>
          <div className={styles.btnrow}>
            <button type="button" className={`${styles.act} ${styles.buy}`} onClick={act(buy)}>
              {g.posQty < 0 ? t.coverAction : t.buy}
              <small>{t.keyB}</small>
            </button>
            <button type="button" className={`${styles.act} ${styles.sellB}`} onClick={act(sell)}>
              {g.posQty > 0 ? t.sell : t.shortAction}
              <small>{t.keyS}</small>
            </button>
          </div>
          <div className={styles.ghostrow}>
            <button type="button" className={styles.ghost} onClick={act(flatten)}>
              {t.flatten}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={act((game) => {
                game.paused = !game.paused;
              })}
            >
              {g.paused ? t.resume : t.pause}
            </button>
            <button type="button" className={styles.ghost} onClick={() => restart()}>
              {t.reset}
            </button>
          </div>
          <p role="status" className={`${styles.toast} ${g.toastGold ? styles.toastGold : ''}`}>
            {g.toast}
          </p>
        </section>
      </div>

      <details className={`${styles.panel} ${styles.details}`}>
        <summary>{t.details}</summary>
        <div className={styles.detailsGrid}>
          <section>
            <div className={styles.rowline}>
              <span>{t.contracts}</span>
              <span>{Math.abs(g.posQty)}</span>
            </div>
            <div className={styles.rowline}>
              <span>{t.avg}</span>
              <span>{g.posQty !== 0 ? g.avg.toFixed(2) : '—'}</span>
            </div>
            <div className={styles.rowline}>
              <span>{t.closedPl}</span>
              <span className={g.realized >= 0 ? styles.pos : styles.neg}>{fmt$(g.realized)}</span>
            </div>
            <div className={styles.track}>
              <div className={styles.fillbar} style={{ width: `${pct}%` }} />
            </div>
            <p className={`${styles.unlockmsg} ${!nextTier ? styles.unlockedOn : ''}`}>
              {t.sizeLimit(sizeMax)}.{' '}
              {nextTier ? t.nextSize(nextTier.max, fmt$(nextTier.equity)) : t.maxSize}
            </p>
          </section>
          <section>
            <p className={styles.lbl}>{t.fills}</p>
            <ul className={styles.journal}>
              {g.fills.map((fill, i) => (
                <li key={`${fill.at}-${i}`}>
                  <span className={styles.fillTime}>{fill.at}</span>
                  <span
                    className={
                      fill.cls === 'b'
                        ? styles.fillBuy
                        : fill.cls === 's'
                          ? styles.fillSell
                          : styles.fillGold
                    }
                  >
                    {fill.side}
                  </span>
                  <span>{fill.qty}×</span>
                  <span>{fill.px.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className={styles.keysPanel}>
          <p>
            {t.foot1} {t.foot2}
          </p>
          <p>
            <b>B</b> / <b>S</b> / <b>F</b> / <b>1 2 3 4</b> / <b>P</b> / <b>R</b> — {t.keys}
          </p>
          <p>{t.keysNote}</p>
          <p>{t.saved}</p>
          <p className={styles.journalLine}>
            {t.journalLink}{' '}
            <Link href={locale === 'es' ? '/es/play/journal' : '/play/journal'}>
              {t.journalCta}
            </Link>
          </p>
        </div>
      </details>
      <footer className={styles.practiceFooter}>
        <p>{t.routine}</p>
        <p className={styles.disclaimer}>{t.disclaimer}</p>
        <a
          href="https://malosound.ai/"
          className={styles.historyLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.history} <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
