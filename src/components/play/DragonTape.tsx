'use client';

import Link from 'next/link';
import { useEffect, useReducer, useRef } from 'react';
import styles from './DragonTape.module.css';

const TICK_MS = 250;
const SPOT0 = 500;
const C0 = 5.0;
const MULT = 100;
const CASH0 = 10000;
const TARGET = 11400;
const HALF_SPREAD = 0.01;
const KEEP = 360;
const LEV = 12;
const DECAY = 0.00006;
const FAST_SWELL = 1.35;
const QTYS = [1, 5, 10] as const;

const COPY = {
  en: {
    title: 'Dragon Tape',
    simulation: 'Simulation · virtual funds',
    details: 'Position & fills',
    chartLabel: 'Simulated contract price chart',
    contract: 'The contract',
    tape: 'tape',
    calm: 'CALM TAPE',
    fast: 'FAST TAPE',
    paused: 'PAUSED',
    foot1: 'The contract swings about 12× harder than the tape.',
    foot2: 'It slowly loses value while you sit and wait.',
    equity: 'Equity',
    lockedMsg: (left: string) => `Reach $11,400 (+14%) to unlock betting down — ${left} to go`,
    unlockedMsg: 'Unlocked — selling while flat bets the tape down',
    position: 'Position',
    long: 'LONG',
    short: 'SHORT',
    flat: 'FLAT',
    contracts: 'Contracts',
    avg: 'Avg fill',
    openPl: 'Open P&L',
    closedPl: 'Closed P&L',
    cash: 'Cash',
    orders: 'Orders',
    buy: 'BUY',
    sell: 'SELL',
    keyB: 'KEY B',
    keyS: 'KEY S',
    flatten: 'Flatten',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    fills: 'Fills',
    keys: 'buy · sell · flatten · size · pause · reset',
    keysNote: 'Selling while flat bets the tape down — once unlocked.',
    lockedToast: 'Locked — reach $11,400 first',
    cashToast: (q: number) => `Not enough cash for ${q}×`,
    capToast: 'Down-bet capped at 1× equity',
    unlockToast: '$11,400 reached — you can bet the tape down now',
    priorUnlock: 'Down-bets already unlocked from a past run',
    unlockedFill: 'UNLOCKED',
    buyFill: 'BUY',
    coverFill: 'COVER',
    sellFill: 'SELL',
    downFill: 'SELL DOWN',
    journalLink: 'Prefer the slower journal game?',
    journalCta: 'Play it here',
    disclaimer: 'Prices are generated, not market data. Nothing here is advice.',
  },
  es: {
    title: 'Dragon Tape',
    simulation: 'Simulación · fondos virtuales',
    details: 'Posición y ejecuciones',
    chartLabel: 'Gráfico del precio simulado del contrato',
    contract: 'El contrato',
    tape: 'cinta',
    calm: 'CINTA CALMA',
    fast: 'CINTA RÁPIDA',
    paused: 'EN PAUSA',
    foot1: 'El contrato se mueve unas 12× más fuerte que la cinta.',
    foot2: 'Pierde valor lentamente mientras esperas.',
    equity: 'Capital',
    lockedMsg: (left: string) =>
      `Llega a $11,400 (+14%) para desbloquear apostar a la baja — faltan ${left}`,
    unlockedMsg: 'Desbloqueado — vender sin posición apuesta a la baja',
    position: 'Posición',
    long: 'LARGO',
    short: 'CORTO',
    flat: 'SIN POSICIÓN',
    contracts: 'Contratos',
    avg: 'Precio medio',
    openPl: 'P&L abierto',
    closedPl: 'P&L cerrado',
    cash: 'Efectivo',
    orders: 'Órdenes',
    buy: 'COMPRAR',
    sell: 'VENDER',
    keyB: 'TECLA B',
    keyS: 'TECLA S',
    flatten: 'Cerrar',
    pause: 'Pausa',
    resume: 'Seguir',
    reset: 'Reiniciar',
    fills: 'Ejecuciones',
    keys: 'comprar · vender · cerrar · tamaño · pausa · reiniciar',
    keysNote: 'Vender sin posición apuesta a la baja — cuando esté desbloqueado.',
    lockedToast: 'Bloqueado — llega a $11,400 primero',
    cashToast: (q: number) => `No hay efectivo para ${q}×`,
    capToast: 'Apuesta a la baja limitada a 1× el capital',
    unlockToast: '$11,400 alcanzado — ya puedes apostar a la baja',
    priorUnlock: 'Apuestas a la baja ya desbloqueadas de una corrida anterior',
    unlockedFill: 'DESBLOQUEADO',
    buyFill: 'COMPRA',
    coverFill: 'CIERRE',
    sellFill: 'VENTA',
    downFill: 'VENTA BAJA',
    journalLink: '¿Prefieres el juego de diario, más pausado?',
    journalCta: 'Juégalo aquí',
    disclaimer: 'Los precios son generados, no datos de mercado. Nada de esto es un consejo.',
  },
};

type Fill = { at: string; side: string; cls: 'b' | 's' | 'g'; qty: number; px: number };

type Game = {
  spot: number;
  c: number;
  prices: number[];
  elapsed: number;
  paused: boolean;
  drift: number;
  driftLeft: number;
  stressed: boolean;
  swell: number;
  cash: number;
  posQty: number;
  avg: number;
  realized: number;
  qty: number;
  unlocked: boolean;
  best: number;
  fills: Fill[];
  toast: string;
  toastGold: boolean;
  ready: boolean;
};

function loadSaved(): { unlocked: boolean; best: number } {
  try {
    const raw = window.localStorage.getItem('xiv-dragon-tape-v1');
    if (raw) {
      const parsed = JSON.parse(raw) as { unlocked?: boolean; best?: number };
      return { unlocked: !!parsed.unlocked, best: parsed.best ?? CASH0 };
    }
  } catch {
    /* fresh run */
  }
  return { unlocked: false, best: CASH0 };
}

function persist(game: Game) {
  try {
    window.localStorage.setItem(
      'xiv-dragon-tape-v1',
      JSON.stringify({ unlocked: game.unlocked, best: game.best }),
    );
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
    unlocked: false,
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

  const equity = (g: Game) => g.cash + g.posQty * g.c * MULT;

  const record = (g: Game, side: string, cls: Fill['cls'], qty: number, px: number) => {
    g.fills.unshift({ at: clock(g), side, cls, qty, px });
    if (g.fills.length > 60) g.fills.pop();
  };

  const buy = (g: Game) => {
    const fill = g.c + HALF_SPREAD;
    const q = g.qty;
    if (g.posQty < 0) {
      const cover = Math.min(q, -g.posQty);
      g.realized += (g.avg - fill) * cover * MULT;
      g.cash -= fill * cover * MULT;
      g.posQty += cover;
      if (g.posQty === 0) g.avg = 0;
      record(g, t.coverFill, 'b', cover, fill);
      return;
    }
    const cost = fill * q * MULT;
    if (cost > g.cash) {
      g.toast = t.cashToast(q);
      g.toastGold = false;
      return;
    }
    g.avg = g.posQty === 0 ? fill : (g.avg * g.posQty + fill * q) / (g.posQty + q);
    g.cash -= cost;
    g.posQty += q;
    record(g, t.buyFill, 'b', q, fill);
  };

  const sell = (g: Game) => {
    const fill = g.c - HALF_SPREAD;
    const q = g.qty;
    if (g.posQty > 0) {
      const close = Math.min(q, g.posQty);
      g.realized += (fill - g.avg) * close * MULT;
      g.cash += fill * close * MULT;
      g.posQty -= close;
      if (g.posQty === 0) g.avg = 0;
      record(g, t.sellFill, 's', close, fill);
      return;
    }
    if (!g.unlocked) {
      g.toast = t.lockedToast;
      g.toastGold = false;
      return;
    }
    const newQty = -g.posQty + q;
    if (newQty * g.c * MULT > equity(g)) {
      g.toast = t.capToast;
      g.toastGold = false;
      return;
    }
    g.avg = g.posQty === 0 ? fill : (g.avg * -g.posQty + fill * q) / newQty;
    g.cash += fill * q * MULT;
    g.posQty -= q;
    record(g, t.downFill, 's', q, fill);
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
    const eq = equity(g);
    if (eq > g.best) {
      g.best = eq;
      persist(g);
    }
    if (!g.unlocked && eq >= TARGET) {
      g.unlocked = true;
      persist(g);
      record(g, t.unlockedFill, 'g', 14, g.c);
      g.toast = t.unlockToast;
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
    g.unlocked = saved.unlocked;
    g.best = saved.best;
    for (let i = 0; i < KEEP / 2; i++) step(g);
    g.elapsed = 0;
    g.toast = g.unlocked ? t.priorUnlock : '';
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
      const g = gameRef.current;
      const k = e.key.toLowerCase();
      if (k === 'b') buy(g);
      else if (k === 's') sell(g);
      else if (k === 'f') flatten(g);
      else if (k === 'p') g.paused = !g.paused;
      else if (k === 'r') {
        restart();
        return;
      } else if (k === '1') g.qty = QTYS[0];
      else if (k === '2') g.qty = QTYS[1];
      else if (k === '3') g.qty = QTYS[2];
      else return;
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
  const eq = equity(g);
  const chg = g.c - C0;
  const upl =
    g.posQty > 0
      ? (g.c - g.avg) * g.posQty * MULT
      : g.posQty < 0
        ? (g.avg - g.c) * -g.posQty * MULT
        : 0;
  const pct = Math.min(100, Math.max(0, ((eq - CASH0) / (TARGET - CASH0)) * 100));
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
            {QTYS.map((q) => (
              <button
                key={q}
                type="button"
                className={`${styles.qty} ${g.qty === q ? styles.qtySel : ''}`}
                aria-pressed={g.qty === q}
                onClick={act((game) => {
                  game.qty = q;
                })}
              >
                {q}×
              </button>
            ))}
          </div>
          <div className={styles.btnrow}>
            <button type="button" className={`${styles.act} ${styles.buy}`} onClick={act(buy)}>
              {t.buy}
              <small>{t.keyB}</small>
            </button>
            <button type="button" className={`${styles.act} ${styles.sellB}`} onClick={act(sell)}>
              {t.sell}
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
              <div className={styles.fillbar} style={{ width: `${g.unlocked ? 100 : pct}%` }} />
            </div>
            <p className={`${styles.unlockmsg} ${g.unlocked ? styles.unlockedOn : ''}`}>
              {g.unlocked ? t.unlockedMsg : t.lockedMsg(fmt$(Math.max(0, TARGET - eq)))}
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
            <b>B</b> / <b>S</b> / <b>F</b> / <b>1 2 3</b> / <b>P</b> / <b>R</b> — {t.keys}
          </p>
          <p>{t.keysNote}</p>
          <p className={styles.journalLine}>
            {t.journalLink}{' '}
            <Link href={locale === 'es' ? '/es/play/journal' : '/play/journal'}>
              {t.journalCta}
            </Link>
          </p>
        </div>
      </details>
      <p className={styles.disclaimer}>{t.disclaimer}</p>
    </div>
  );
}
