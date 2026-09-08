/**
 * Practice-game simulation engine.
 *
 * Everything here is fictional: instruments, prices, quotes, and funds. The
 * engine is deterministic for a given seed, runs entirely in the browser, and
 * never touches a market API. It exists so a decision can be written down,
 * gated, sealed, and reviewed — not so anyone can trade.
 */

export type Regime = 'calm' | 'normal' | 'elevated' | 'extreme';
export type Direction = 'long_call' | 'long_put';
export type GateId = 'stale' | 'spread' | 'concentration' | 'drawdown' | 'body';
export type ExitReason = 'target' | 'invalidation' | 'expiry' | 'manual' | 'stand_down';

export interface Bar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface Quote {
  bid: number;
  ask: number;
  mark: number;
  /** Seconds since the (fictional) quote was refreshed. */
  ageSeconds: number;
}

export interface Scenario {
  seed: number;
  ticker: string;
  name: string;
  regime: Regime;
  /** Annualised volatility used by the pricer. */
  vol: number;
  /** Drift per bar hidden from the player. */
  drift: number;
  history: Bar[];
  quote: Quote;
  /** Bars until the practice contract expires. */
  barsToExpiry: number;
  /** Rotating grounding question shown at the evidence step. */
  question: string;
}

export interface Assumption {
  direction: Direction;
  reason: string;
  /** Price at which the thesis is wrong. */
  invalidation: number;
  /** Price threshold the scenario is written against. Not a prediction. */
  scenarioLevel: number;
  /** Maximum bars the position may be held. */
  holdBars: number;
  contracts: number;
  sealedAt: number;
}

export interface GateResult {
  id: GateId;
  pass: boolean;
  detail: string;
}

export interface RiskVerdict {
  gates: GateResult[];
  riskUsd: number;
  riskPct: number;
  riskCapPct: number;
  allowed: boolean;
}

export interface Receipt {
  id: string;
  seed: number;
  ticker: string;
  regime: Regime;
  direction: Direction;
  reason: string;
  invalidation: number;
  scenarioLevel: number;
  holdBars: number;
  contracts: number;
  entryUnderlying: number;
  entryPremium: number;
  riskUsd: number;
  gates: GateResult[];
  /** Hash of the BEFORE card, sealed at entry. */
  beforeHash: string;
  sealedAt: number;
  // AFTER
  exitUnderlying: number;
  exitPremium: number;
  exitReason: ExitReason;
  barsHeld: number;
  pnlUsd: number;
  realizedR: number;
  /** Did the player respect their own invalidation when it hit? */
  ruleFollowed: boolean;
  invalidationHit: boolean;
  lesson: string;
  afterHash: string;
  closedAt: number;
}

export interface Account {
  startingCash: number;
  cash: number;
  peak: number;
}

export const STARTING_CASH = 25_000;
export const RISK_CAP_PCT = 2;
export const MAX_CONCURRENT = 1;
export const DRAWDOWN_FLOOR_PCT = 10;
export const HISTORY_BARS = 60;
export const CONTRACT_MULTIPLIER = 100;
export const MAX_QUOTE_AGE_SECONDS = 30;
export const MAX_SPREAD_PCT = 12;

const FICTIONAL_INSTRUMENTS: Array<{ ticker: string; name: string; base: number }> = [
  { ticker: 'NORD', name: 'Nordwind Logistics (fictional)', base: 142 },
  { ticker: 'KELP', name: 'Kelp Biomaterials (fictional)', base: 38 },
  { ticker: 'ARCA', name: 'Arcadia Semis (fictional)', base: 264 },
  { ticker: 'TIDE', name: 'Tidewater Energy (fictional)', base: 71 },
  { ticker: 'VELA', name: 'Vela Cloud Systems (fictional)', base: 189 },
  { ticker: 'MOSS', name: 'Moss Consumer Group (fictional)', base: 54 },
];

const REGIMES: Array<{ regime: Regime; vol: number; weight: number }> = [
  { regime: 'calm', vol: 0.14, weight: 3 },
  { regime: 'normal', vol: 0.24, weight: 4 },
  { regime: 'elevated', vol: 0.38, weight: 2 },
  { regime: 'extreme', vol: 0.62, weight: 1 },
];

const QUESTIONS = [
  'What would have to be true for this idea to be wrong?',
  'If the price were hidden, would the evidence still hold?',
  'Is this a setup, or is this a feeling about the last three bars?',
  'What did the last comparable receipt teach, and does it apply here?',
  'How many bars are you willing to be wrong for?',
  'If you stood down today, what would you lose?',
];

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller standard normal from a uniform source. */
function gaussian(rng: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** FNV-1a 32-bit, hex. Enough to make a sealed card tamper-evident in a journal. */
export function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function newSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/* ------------------------------------------------------------------ */
/* Price paths                                                          */
/* ------------------------------------------------------------------ */

const BARS_PER_YEAR = 252;

function nextBar(prev: Bar, vol: number, drift: number, rng: () => number, t: number): Bar {
  const dt = 1 / BARS_PER_YEAR;
  const sigma = vol * Math.sqrt(dt);
  const jump = rng() < 0.03 ? gaussian(rng) * sigma * 3 : 0;
  const ret = drift * dt - 0.5 * sigma * sigma + sigma * gaussian(rng) + jump;
  const o = prev.c;
  const c = round2(o * Math.exp(ret));
  const wick = Math.abs(gaussian(rng)) * sigma * 0.6 * o;
  const h = round2(Math.max(o, c) + wick * rng());
  const l = round2(Math.max(0.5, Math.min(o, c) - wick * rng()));
  return { t, o, h, l, c };
}

export function generateScenario(seed: number): Scenario {
  const rng = mulberry32(seed);
  const inst = pick(rng, FICTIONAL_INSTRUMENTS);
  const totalWeight = REGIMES.reduce((s, r) => s + r.weight, 0);
  let roll = rng() * totalWeight;
  let chosen = REGIMES[1];
  for (const r of REGIMES) {
    roll -= r.weight;
    if (roll <= 0) {
      chosen = r;
      break;
    }
  }
  const drift = (rng() - 0.5) * 0.6; // −30%..+30% annualised, hidden
  const start = round2(inst.base * (0.85 + rng() * 0.3));
  const history: Bar[] = [{ t: 0, o: start, h: start, l: start, c: start }];
  for (let i = 1; i < HISTORY_BARS; i++) {
    history.push(nextBar(history[i - 1], chosen.vol, drift, rng, i));
  }
  const last = history[history.length - 1].c;
  const spreadPct = chosen.regime === 'extreme' ? 6 + rng() * 12 : 1 + rng() * 6;
  const ageSeconds = rng() < 0.15 ? 45 + Math.floor(rng() * 300) : Math.floor(rng() * 20);
  const quote: Quote = {
    bid: round2(last * (1 - spreadPct / 200)),
    ask: round2(last * (1 + spreadPct / 200)),
    mark: last,
    ageSeconds,
  };
  return {
    seed,
    ticker: inst.ticker,
    name: inst.name,
    regime: chosen.regime,
    vol: chosen.vol,
    drift,
    history,
    quote,
    barsToExpiry: 20 + Math.floor(rng() * 25),
    question: pick(rng, QUESTIONS),
  };
}

/** Continue a scenario's path by one bar. Deterministic per (seed, bar index). */
export function advanceBar(scenario: Scenario, bars: Bar[]): Bar {
  const index = bars.length;
  const rng = mulberry32((scenario.seed + index * 7919) >>> 0);
  return nextBar(bars[index - 1], scenario.vol, scenario.drift, rng, index);
}

/* ------------------------------------------------------------------ */
/* Option pricing (simplified Black–Scholes on fictional inputs)        */
/* ------------------------------------------------------------------ */

function normCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

export function optionPremium(
  direction: Direction,
  spot: number,
  strike: number,
  barsToExpiry: number,
  vol: number,
): number {
  const T = Math.max(barsToExpiry, 0) / BARS_PER_YEAR;
  const intrinsic =
    direction === 'long_call' ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
  if (T <= 0) return round2(intrinsic);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(spot / strike) + 0.5 * vol * vol * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  const value =
    direction === 'long_call'
      ? spot * normCdf(d1) - strike * normCdf(d2)
      : strike * normCdf(-d2) - spot * normCdf(-d1);
  return round2(Math.max(value, 0.05));
}

/** At-the-money strike rounded to a sensible increment. */
export function atmStrike(spot: number): number {
  const step = spot >= 200 ? 5 : spot >= 50 ? 2.5 : 1;
  return Math.round(spot / step) * step;
}

/* ------------------------------------------------------------------ */
/* Gates                                                                */
/* ------------------------------------------------------------------ */

export function evaluateGates(input: {
  scenario: Scenario;
  assumption: Pick<Assumption, 'direction' | 'contracts' | 'invalidation'>;
  account: Account;
  openPositions: number;
  rested: boolean;
  premium: number;
}): RiskVerdict {
  const { scenario, assumption, account, openPositions, rested, premium } = input;
  const spreadPct = ((scenario.quote.ask - scenario.quote.bid) / scenario.quote.mark) * 100;
  const drawdownPct = account.peak > 0 ? ((account.peak - account.cash) / account.peak) * 100 : 0;
  const riskUsd = round2(premium * CONTRACT_MULTIPLIER * assumption.contracts);
  const riskPct = account.cash > 0 ? (riskUsd / account.cash) * 100 : 100;

  const gates: GateResult[] = [
    {
      id: 'stale',
      pass: scenario.quote.ageSeconds <= MAX_QUOTE_AGE_SECONDS,
      detail: `quote age ${scenario.quote.ageSeconds}s (limit ${MAX_QUOTE_AGE_SECONDS}s)`,
    },
    {
      id: 'spread',
      pass: spreadPct <= MAX_SPREAD_PCT,
      detail: `spread ${spreadPct.toFixed(1)}% of mark (limit ${MAX_SPREAD_PCT}%)`,
    },
    {
      id: 'concentration',
      pass: openPositions < MAX_CONCURRENT && riskPct <= RISK_CAP_PCT,
      detail: `${openPositions}/${MAX_CONCURRENT} open · risk ${riskPct.toFixed(2)}% of funds (cap ${RISK_CAP_PCT}%)`,
    },
    {
      id: 'drawdown',
      pass: drawdownPct < DRAWDOWN_FLOOR_PCT,
      detail: `drawdown ${drawdownPct.toFixed(1)}% from peak (floor ${DRAWDOWN_FLOOR_PCT}%)`,
    },
    {
      id: 'body',
      pass: rested,
      detail: rested
        ? 'rested and focused (self-reported)'
        : 'not rested — stand down (self-reported)',
    },
  ];
  return {
    gates,
    riskUsd,
    riskPct,
    riskCapPct: RISK_CAP_PCT,
    allowed: gates.every((g) => g.pass),
  };
}

/* ------------------------------------------------------------------ */
/* Receipts and stats                                                   */
/* ------------------------------------------------------------------ */

export function sealBefore(
  fields: Omit<
    Receipt,
    | 'beforeHash'
    | 'exitUnderlying'
    | 'exitPremium'
    | 'exitReason'
    | 'barsHeld'
    | 'pnlUsd'
    | 'realizedR'
    | 'ruleFollowed'
    | 'invalidationHit'
    | 'lesson'
    | 'afterHash'
    | 'closedAt'
  >,
): string {
  return fnv1a(
    JSON.stringify([
      fields.id,
      fields.seed,
      fields.ticker,
      fields.direction,
      fields.reason,
      fields.invalidation,
      fields.scenarioLevel,
      fields.holdBars,
      fields.contracts,
      fields.entryUnderlying,
      fields.entryPremium,
      fields.riskUsd,
      fields.sealedAt,
    ]),
  );
}

export function sealAfter(r: Receipt): string {
  return fnv1a(
    JSON.stringify([
      r.beforeHash,
      r.exitUnderlying,
      r.exitPremium,
      r.exitReason,
      r.barsHeld,
      r.pnlUsd,
      r.realizedR,
      r.ruleFollowed,
      r.invalidationHit,
      r.lesson,
      r.closedAt,
    ]),
  );
}

export function invalidationHit(direction: Direction, invalidation: number, bar: Bar): boolean {
  return direction === 'long_call' ? bar.l <= invalidation : bar.h >= invalidation;
}

export function scenarioLevelHit(direction: Direction, level: number, bar: Bar): boolean {
  return direction === 'long_call' ? bar.h >= level : bar.l <= level;
}

export interface Stats {
  count: number;
  wins: number;
  winRate: number | null;
  expectancyR: number | null;
  ruleFollowRate: number | null;
  standDowns: number;
  worstDrawdownR: number | null;
  netUsd: number;
}

export function computeStats(receipts: Receipt[]): Stats {
  const traded = receipts.filter((r) => r.exitReason !== 'stand_down');
  const standDowns = receipts.length - traded.length;
  const n = traded.length;
  if (n === 0) {
    return {
      count: 0,
      wins: 0,
      winRate: null,
      expectancyR: null,
      ruleFollowRate: null,
      standDowns,
      worstDrawdownR: null,
      netUsd: 0,
    };
  }
  const rs = traded.map((r) => r.realizedR);
  const wins = rs.filter((r) => r > 0).length;
  let peak = 0;
  let cum = 0;
  let worst = 0;
  for (const r of rs) {
    cum += r;
    peak = Math.max(peak, cum);
    worst = Math.min(worst, cum - peak);
  }
  return {
    count: n,
    wins,
    winRate: wins / n,
    expectancyR: rs.reduce((s, r) => s + r, 0) / n,
    ruleFollowRate: traded.filter((r) => r.ruleFollowed).length / n,
    standDowns,
    worstDrawdownR: worst,
    netUsd: traded.reduce((s, r) => s + r.pnlUsd, 0),
  };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
