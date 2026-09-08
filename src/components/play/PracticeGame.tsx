'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw, X } from 'lucide-react';
import {
  advanceBar,
  atmStrike,
  computeStats,
  evaluateGates,
  generateScenario,
  invalidationHit,
  newSeed,
  optionPremium,
  round2,
  scenarioLevelHit,
  sealAfter,
  sealBefore,
  STARTING_CASH,
  type Account,
  type Assumption,
  type Bar,
  type Direction,
  type ExitReason,
  type GateResult,
  type Receipt,
} from '@/lib/practice-engine';
import { PLAY_COPY, type Locale } from './copy';
import { PriceChart } from './PriceChart';
import styles from './PracticeGame.module.css';

type Phase = 'gate' | 'evidence' | 'risk' | 'live' | 'after';

interface Entry {
  id: string;
  strike: number;
  premium: number;
  underlying: number;
  barIndex: number;
  riskUsd: number;
  gates: GateResult[];
  beforeHash: string;
  sealedAt: number;
}

interface Session {
  seed: number;
  phase: Phase;
  rested: boolean;
  assumption?: Assumption;
  extraBars: Bar[];
  entry?: Entry;
  ignoredInvalidationBars: number;
  exit?: {
    underlying: number;
    premium: number;
    reason: ExitReason;
    barsHeld: number;
    pnlUsd: number;
    realizedR: number;
    invalidationHit: boolean;
    ruleFollowed: boolean;
  };
}

interface SavedState {
  version: 1;
  account: Account;
  receipts: Receipt[];
  session: Session;
}

const STORAGE_KEY = 'xiv-practice-game-v1';

function freshSession(seed = newSeed()): Session {
  return { seed, phase: 'gate', rested: true, extraBars: [], ignoredInvalidationBars: 0 };
}

function freshState(): SavedState {
  return {
    version: 1,
    account: { startingCash: STARTING_CASH, cash: STARTING_CASH, peak: STARTING_CASH },
    receipts: [],
    session: freshSession(),
  };
}

function load(): SavedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed.version !== 1 || !parsed.session || !parsed.account) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

function persist(state: SavedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the game still runs in memory */
  }
}

const money = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const signed = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}`;

export function PracticeGame({ locale = 'en' }: { locale?: Locale }) {
  const t = PLAY_COPY[locale];
  const [state, setState] = useState<SavedState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (state) persist(state);
  }, [state]);

  const session = state?.session;
  const seed = session?.seed;
  const extraBars = session?.extraBars;
  const scenario = useMemo(() => (seed === undefined ? null : generateScenario(seed)), [seed]);
  const bars = useMemo(
    () => (scenario && extraBars ? scenario.history.concat(extraBars) : []),
    [scenario, extraBars],
  );

  if (!state || !session || !scenario) {
    return <div className={styles.page} aria-busy="true" />;
  }

  const update = (fn: (s: SavedState) => SavedState) =>
    setState((prev) => (prev ? fn(prev) : prev));
  const setSession = (fn: (s: Session) => Session) =>
    update((s) => ({ ...s, session: fn(s.session) }));

  const last = bars[bars.length - 1];
  const stats = computeStats(state.receipts);
  const phaseIndex: Record<Phase, number> = { gate: 0, evidence: 1, risk: 2, live: 3, after: 4 };
  const spreadPct = ((scenario.quote.ask - scenario.quote.bid) / scenario.quote.mark) * 100;

  /* ---------------------------------------------------------------- */
  /* Stand down: a receipt with no position                            */
  /* ---------------------------------------------------------------- */
  const standDown = () => {
    const now = Date.now();
    const a = session.assumption;
    const base = {
      id: `${session.seed.toString(16)}-${now.toString(36)}`,
      seed: session.seed,
      ticker: scenario.ticker,
      regime: scenario.regime,
      direction: a?.direction ?? ('long_call' as Direction),
      reason: a?.reason ?? '',
      invalidation: a?.invalidation ?? 0,
      scenarioLevel: a?.scenarioLevel ?? 0,
      holdBars: a?.holdBars ?? 0,
      contracts: 0,
      entryUnderlying: last.c,
      entryPremium: 0,
      riskUsd: 0,
      gates: [] as GateResult[],
      sealedAt: now,
    };
    const partial: Receipt = {
      ...base,
      beforeHash: sealBefore(base),
      exitUnderlying: last.c,
      exitPremium: 0,
      exitReason: 'stand_down',
      barsHeld: 0,
      pnlUsd: 0,
      realizedR: 0,
      ruleFollowed: true,
      invalidationHit: false,
      lesson: '',
      afterHash: '',
      closedAt: now,
    };
    partial.afterHash = sealAfter(partial);
    update((s) => ({ ...s, receipts: [partial, ...s.receipts], session: freshSession() }));
  };

  /* ---------------------------------------------------------------- */
  /* Live session mechanics                                            */
  /* ---------------------------------------------------------------- */
  const barsToExpiry = scenario.barsToExpiry - session.extraBars.length;
  const currentPremium =
    session.entry && session.assumption
      ? optionPremium(
          session.assumption.direction,
          last.c,
          session.entry.strike,
          barsToExpiry,
          scenario.vol,
        )
      : 0;
  const unrealized =
    session.entry && session.assumption
      ? round2((currentPremium - session.entry.premium) * 100 * session.assumption.contracts)
      : 0;
  const invalidatedNow =
    session.assumption && session.entry
      ? invalidationHit(session.assumption.direction, session.assumption.invalidation, last)
      : false;
  const levelNow =
    session.assumption && session.entry
      ? scenarioLevelHit(session.assumption.direction, session.assumption.scenarioLevel, last)
      : false;
  const invalidatedEver =
    session.assumption && session.entry
      ? bars
          .slice(session.entry.barIndex + 1)
          .some((b) =>
            invalidationHit(session.assumption!.direction, session.assumption!.invalidation, b),
          )
      : false;

  const closePosition = (reason: ExitReason, premiumOverride?: number) => {
    const a = session.assumption!;
    const e = session.entry!;
    const premium = premiumOverride ?? currentPremium;
    const pnl = round2((premium - e.premium) * 100 * a.contracts);
    const barsHeld = bars.length - 1 - e.barIndex;
    const hit = invalidatedEver;
    const ruleFollowed = !hit || session.ignoredInvalidationBars === 0;
    const finalReason: ExitReason =
      reason === 'expiry'
        ? 'expiry'
        : levelNow
          ? 'target'
          : hit && ruleFollowed
            ? 'invalidation'
            : 'manual';
    setSession((s) => ({
      ...s,
      phase: 'after',
      exit: {
        underlying: last.c,
        premium,
        reason: finalReason,
        barsHeld,
        pnlUsd: pnl,
        realizedR: e.riskUsd > 0 ? round2(pnl / e.riskUsd) : 0,
        invalidationHit: hit,
        ruleFollowed,
      },
    }));
  };

  const advance = () => {
    const a = session.assumption!;
    const e = session.entry!;
    const next = advanceBar(scenario, bars);
    const nextBars = bars.concat(next);
    const nextExtra = session.extraBars.concat(next);
    const ignored = invalidatedNow
      ? session.ignoredInvalidationBars + 1
      : session.ignoredInvalidationBars;
    const left = scenario.barsToExpiry - nextExtra.length;
    const held = nextBars.length - 1 - e.barIndex;
    if (left <= 0 || held >= a.holdBars) {
      const premium = optionPremium(a.direction, next.c, e.strike, Math.max(left, 0), scenario.vol);
      const pnl = round2((premium - e.premium) * 100 * a.contracts);
      const hit = invalidatedEver || invalidationHit(a.direction, a.invalidation, next);
      const ruleFollowed = !hit || ignored === 0;
      setSession((s) => ({
        ...s,
        extraBars: nextExtra,
        ignoredInvalidationBars: ignored,
        phase: 'after',
        exit: {
          underlying: next.c,
          premium,
          reason: left <= 0 ? 'expiry' : 'manual',
          barsHeld: held,
          pnlUsd: pnl,
          realizedR: e.riskUsd > 0 ? round2(pnl / e.riskUsd) : 0,
          invalidationHit: hit,
          ruleFollowed,
        },
      }));
      return;
    }
    setSession((s) => ({ ...s, extraBars: nextExtra, ignoredInvalidationBars: ignored }));
  };

  /* ---------------------------------------------------------------- */
  /* Reset / export                                                     */
  /* ---------------------------------------------------------------- */
  const copyJournal = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state.receipts, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.spark} />
            {t.eyebrow}
          </p>
          <h1 className={styles.title}>
            {t.title.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className={styles.intro}>{t.intro}</p>
        </div>
        <dl className={styles.ledger}>
          <div>
            <dt>{t.funds}</dt>
            <dd>{money(state.account.cash, locale)}</dd>
          </div>
          <div>
            <dt>{t.peak}</dt>
            <dd>{money(state.account.peak, locale)}</dd>
          </div>
          <div>
            <dt>{t.sessions}</dt>
            <dd>{state.receipts.length}</dd>
          </div>
          <div>
            <dt>{t.seed}</dt>
            <dd className={styles.mono}>{session.seed.toString(16)}</dd>
          </div>
        </dl>
      </header>

      <ol className={styles.steps} aria-label="Steps">
        {t.steps.map((step, i) => (
          <li
            key={step}
            data-state={
              i < phaseIndex[session.phase]
                ? 'done'
                : i === phaseIndex[session.phase]
                  ? 'now'
                  : 'next'
            }
          >
            <span>0{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <section className={styles.board}>
        <div className={styles.chartCard}>
          <div className={styles.chartHead}>
            <div>
              <p className={styles.ticker}>
                {scenario.ticker} <span>{scenario.name}</span>
              </p>
              <p className={styles.price}>
                {last.c.toFixed(2)}
                <span data-tone={scenario.regime}>{t.regime[scenario.regime]}</span>
              </p>
            </div>
            <div className={styles.quote}>
              <span>
                {t.quoteAge} <b>{scenario.quote.ageSeconds}s</b>
              </span>
              <span>
                {t.spread} <b>{spreadPct.toFixed(1)}%</b>
              </span>
              <span>
                {t.barsLeft} <b>{Math.max(barsToExpiry, 0)}</b>
              </span>
            </div>
          </div>
          <PriceChart
            bars={bars}
            historyLength={scenario.history.length}
            levels={[
              ...(session.assumption && session.phase !== 'gate' && session.phase !== 'evidence'
                ? [
                    {
                      price: session.assumption.invalidation,
                      label: 'INV',
                      tone: 'invalidation' as const,
                    },
                    {
                      price: session.assumption.scenarioLevel,
                      label: 'LVL',
                      tone: 'scenario' as const,
                    },
                  ]
                : []),
              ...(session.entry
                ? [{ price: session.entry.underlying, label: 'IN', tone: 'entry' as const }]
                : []),
            ]}
          />
        </div>

        <div className={styles.panel}>
          {session.phase === 'gate' && (
            <GatePanel
              t={t}
              regime={scenario.regime}
              onEnter={() => setSession((s) => ({ ...s, phase: 'evidence' }))}
              onStandDown={standDown}
              onNewSeed={() => update((s) => ({ ...s, session: freshSession() }))}
            />
          )}
          {session.phase === 'evidence' && (
            <EvidencePanel
              t={t}
              spot={last.c}
              vol={scenario.vol}
              barsToExpiry={barsToExpiry}
              question={scenario.question}
              onSeal={(a) => setSession((s) => ({ ...s, assumption: a, phase: 'risk' }))}
              onBack={() => setSession((s) => ({ ...s, phase: 'gate' }))}
            />
          )}
          {session.phase === 'risk' && session.assumption && (
            <RiskPanel
              t={t}
              locale={locale}
              verdict={evaluateGates({
                scenario,
                assumption: session.assumption,
                account: state.account,
                openPositions: 0,
                rested: session.rested,
                premium: optionPremium(
                  session.assumption.direction,
                  last.c,
                  atmStrike(last.c),
                  barsToExpiry,
                  scenario.vol,
                ),
              })}
              rested={session.rested}
              onRested={(rested) => setSession((s) => ({ ...s, rested }))}
              onStandDown={standDown}
              onOpen={(verdict) => {
                const a = session.assumption!;
                const strike = atmStrike(last.c);
                const premium = optionPremium(
                  a.direction,
                  last.c,
                  strike,
                  barsToExpiry,
                  scenario.vol,
                );
                const now = Date.now();
                const id = `${session.seed.toString(16)}-${now.toString(36)}`;
                const before = {
                  id,
                  seed: session.seed,
                  ticker: scenario.ticker,
                  regime: scenario.regime,
                  direction: a.direction,
                  reason: a.reason,
                  invalidation: a.invalidation,
                  scenarioLevel: a.scenarioLevel,
                  holdBars: a.holdBars,
                  contracts: a.contracts,
                  entryUnderlying: last.c,
                  entryPremium: premium,
                  riskUsd: verdict.riskUsd,
                  gates: verdict.gates,
                  sealedAt: now,
                };
                setSession((s) => ({
                  ...s,
                  phase: 'live',
                  entry: {
                    id,
                    strike,
                    premium,
                    underlying: last.c,
                    barIndex: bars.length - 1,
                    riskUsd: verdict.riskUsd,
                    gates: verdict.gates,
                    beforeHash: sealBefore(before),
                    sealedAt: now,
                  },
                }));
              }}
            />
          )}
          {session.phase === 'live' && session.entry && session.assumption && (
            <LivePanel
              t={t}
              barIndex={bars.length - 1 - session.entry.barIndex}
              holdBars={session.assumption.holdBars}
              underlying={last.c}
              premium={currentPremium}
              entryPremium={session.entry.premium}
              unrealized={unrealized}
              riskUsd={session.entry.riskUsd}
              invalidatedNow={invalidatedNow}
              ignored={session.ignoredInvalidationBars > 0}
              levelNow={levelNow}
              onAdvance={advance}
              onClose={() => closePosition('manual')}
            />
          )}
          {session.phase === 'after' && session.entry && session.assumption && session.exit && (
            <AfterPanel
              t={t}
              locale={locale}
              scenarioTicker={scenario.ticker}
              assumption={session.assumption}
              entry={session.entry}
              exit={session.exit}
              onSeal={(lesson) => {
                const a = session.assumption!;
                const e = session.entry!;
                const x = session.exit!;
                const receipt: Receipt = {
                  id: e.id,
                  seed: session.seed,
                  ticker: scenario.ticker,
                  regime: scenario.regime,
                  direction: a.direction,
                  reason: a.reason,
                  invalidation: a.invalidation,
                  scenarioLevel: a.scenarioLevel,
                  holdBars: a.holdBars,
                  contracts: a.contracts,
                  entryUnderlying: e.underlying,
                  entryPremium: e.premium,
                  riskUsd: e.riskUsd,
                  gates: e.gates,
                  beforeHash: e.beforeHash,
                  sealedAt: e.sealedAt,
                  exitUnderlying: x.underlying,
                  exitPremium: x.premium,
                  exitReason: x.reason,
                  barsHeld: x.barsHeld,
                  pnlUsd: x.pnlUsd,
                  realizedR: x.realizedR,
                  ruleFollowed: x.ruleFollowed,
                  invalidationHit: x.invalidationHit,
                  lesson,
                  afterHash: '',
                  closedAt: Date.now(),
                };
                receipt.afterHash = sealAfter(receipt);
                update((s) => {
                  const cash = round2(s.account.cash + x.pnlUsd);
                  return {
                    ...s,
                    account: { ...s.account, cash, peak: Math.max(s.account.peak, cash) },
                    receipts: [receipt, ...s.receipts],
                    session: freshSession(),
                  };
                });
              }}
            />
          )}
        </div>
      </section>

      <section className={styles.archive} aria-labelledby="archive-title">
        <div className={styles.archiveHead}>
          <div>
            <p className={styles.eyebrow}>05 / {t.archiveTitle}</p>
            <h2 id="archive-title">{t.archiveLead}</h2>
          </div>
          <div className={styles.archiveActions}>
            <button
              type="button"
              className={styles.ghost}
              onClick={copyJournal}
              disabled={!state.receipts.length}
            >
              {copied ? t.copied : t.copyJson}
            </button>
            {confirmReset ? (
              <span className={styles.confirm}>
                {t.resetConfirm}
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => {
                    setState(freshState());
                    setConfirmReset(false);
                  }}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setConfirmReset(false)}
                >
                  {t.no}
                </button>
              </span>
            ) : (
              <button type="button" className={styles.ghost} onClick={() => setConfirmReset(true)}>
                <RotateCcw size={13} aria-hidden="true" /> {t.reset}
              </button>
            )}
          </div>
        </div>

        <dl className={styles.stats}>
          <div>
            <dt>{t.winRate}</dt>
            <dd>{stats.winRate === null ? '—' : `${Math.round(stats.winRate * 100)}%`}</dd>
          </div>
          <div>
            <dt>{t.expectancy}</dt>
            <dd>
              {stats.expectancyR === null ? '—' : `${signed(stats.expectancyR)}R`}
              <small>{t.perTrade}</small>
            </dd>
          </div>
          <div>
            <dt>{t.ruleRate}</dt>
            <dd>
              {stats.ruleFollowRate === null ? '—' : `${Math.round(stats.ruleFollowRate * 100)}%`}
            </dd>
          </div>
          <div>
            <dt>{t.standDowns}</dt>
            <dd>{stats.standDowns}</dd>
          </div>
          <div>
            <dt>{t.worstDd}</dt>
            <dd>{stats.worstDrawdownR === null ? '—' : `${stats.worstDrawdownR.toFixed(2)}R`}</dd>
          </div>
          <div>
            <dt>{t.net}</dt>
            <dd data-tone={stats.netUsd > 0 ? 'up' : stats.netUsd < 0 ? 'down' : undefined}>
              {money(stats.netUsd, locale)}
            </dd>
          </div>
        </dl>

        {state.receipts.length === 0 ? (
          <p className={styles.empty}>{t.empty}</p>
        ) : (
          <ol className={styles.receipts}>
            {state.receipts.map((r) => (
              <li
                key={r.id}
                className={styles.receipt}
                data-tone={
                  r.exitReason === 'stand_down'
                    ? 'flat'
                    : r.realizedR > 0
                      ? 'up'
                      : r.realizedR < 0
                        ? 'down'
                        : 'flat'
                }
              >
                <div className={styles.receiptMeta}>
                  <span>
                    {new Date(r.closedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}
                  </span>
                  <span>
                    {r.ticker} · {t.regime[r.regime].split(' — ')[0]}
                  </span>
                </div>
                <div className={styles.receiptBody}>
                  <p className={styles.receiptLine}>
                    {r.exitReason === 'stand_down' ? (
                      <b>{t.exitReason.stand_down}</b>
                    ) : (
                      <>
                        <b>{r.direction === 'long_call' ? t.longCall : t.longPut}</b> ·{' '}
                        {r.contracts}× @ {r.entryPremium.toFixed(2)} → {r.exitPremium.toFixed(2)} ·{' '}
                        {t.exitReason[r.exitReason]} · {r.barsHeld} {t.bars}
                      </>
                    )}
                  </p>
                  {r.reason && <p className={styles.receiptReason}>“{r.reason}”</p>}
                  {r.lesson && <p className={styles.receiptLesson}>{r.lesson}</p>}
                </div>
                <div className={styles.receiptResult}>
                  {r.exitReason !== 'stand_down' && (
                    <>
                      <b>{signed(r.realizedR)}R</b>
                      <span>{r.ruleFollowed ? t.ruleFollowed : t.ruleBroken}</span>
                    </>
                  )}
                  <span className={styles.mono}>
                    {r.beforeHash}·{r.afterHash}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className={styles.foot}>
        <p>{t.boundary}</p>
        <Link href={locale === 'es' ? '/es' : '/'} className={styles.home}>
          <ArrowLeft size={14} aria-hidden="true" /> {t.home}
        </Link>
      </footer>
    </div>
  );
}

/* ================================================================== */
/* Panels                                                              */
/* ================================================================== */

type T = (typeof PLAY_COPY)['en'];

function GatePanel({
  t,
  regime,
  onEnter,
  onStandDown,
  onNewSeed,
}: {
  t: T;
  regime: keyof T['regime'];
  onEnter: () => void;
  onStandDown: () => void;
  onNewSeed: () => void;
}) {
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelLabel}>01 / {t.gateTitle}</p>
      <h2>{t.gateLead}</h2>
      <p className={styles.weather} data-tone={regime}>
        {t.weather}: <b>{t.regime[regime]}</b>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onEnter}>
          {t.enterEvidence} <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button type="button" className={styles.ghost} onClick={onStandDown}>
          {t.standDown}
        </button>
        <button type="button" className={styles.ghost} onClick={onNewSeed}>
          {t.newSeed}
        </button>
      </div>
      <p className={styles.hint}>{t.standDownHint}</p>
    </div>
  );
}

function EvidencePanel({
  t,
  spot,
  vol,
  barsToExpiry,
  question,
  onSeal,
  onBack,
}: {
  t: T;
  spot: number;
  vol: number;
  barsToExpiry: number;
  question: string;
  onSeal: (a: Assumption) => void;
  onBack: () => void;
}) {
  const [direction, setDirection] = useState<Direction>('long_call');
  const [reason, setReason] = useState('');
  const [invalidation, setInvalidation] = useState(() => round2(spot * 0.97));
  const [level, setLevel] = useState(() => round2(spot * 1.05));
  const [holdBars, setHoldBars] = useState(Math.min(10, barsToExpiry));
  const [contracts, setContracts] = useState(1);

  const strike = atmStrike(spot);
  const premium = optionPremium(direction, spot, strike, barsToExpiry, vol);
  const maxLoss = round2(premium * 100 * contracts);

  const flipDirection = (d: Direction) => {
    setDirection(d);
    setInvalidation(round2(d === 'long_call' ? spot * 0.97 : spot * 1.03));
    setLevel(round2(d === 'long_call' ? spot * 1.05 : spot * 0.95));
  };

  const invalidationOk = direction === 'long_call' ? invalidation < spot : invalidation > spot;
  const levelOk = direction === 'long_call' ? level > spot : level < spot;
  const reasonOk = reason.trim().length >= 20;
  const holdOk = holdBars >= 1 && holdBars <= barsToExpiry;
  const canSeal = invalidationOk && levelOk && reasonOk && holdOk && contracts >= 1;

  return (
    <form
      className={styles.panelBody}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSeal) return;
        onSeal({
          direction,
          reason: reason.trim(),
          invalidation,
          scenarioLevel: level,
          holdBars,
          contracts,
          sealedAt: Date.now(),
        });
      }}
    >
      <p className={styles.panelLabel}>02 / {t.evidenceTitle}</p>
      <h2>{t.evidenceLead}</h2>
      <p className={styles.question}>
        <span>{t.question}</span>
        {question}
      </p>

      <fieldset className={styles.segment}>
        <legend>{t.direction}</legend>
        <button
          type="button"
          data-on={direction === 'long_call'}
          onClick={() => flipDirection('long_call')}
        >
          {t.longCall}
        </button>
        <button
          type="button"
          data-on={direction === 'long_put'}
          onClick={() => flipDirection('long_put')}
        >
          {t.longPut}
        </button>
      </fieldset>

      <label className={styles.field}>
        <span>{t.reason}</span>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t.reasonPlaceholder}
          maxLength={280}
        />
        <small data-bad={!reasonOk && reason.length > 0}>{t.reasonHint}</small>
      </label>

      <div className={styles.grid2}>
        <label className={styles.field}>
          <span>{t.invalidation}</span>
          <input
            type="number"
            step="0.01"
            value={invalidation}
            onChange={(e) => setInvalidation(Number(e.target.value))}
          />
          {!invalidationOk && (
            <small data-bad>
              {direction === 'long_call' ? t.invalidationSideCall : t.invalidationSidePut}
            </small>
          )}
        </label>
        <label className={styles.field}>
          <span>{t.scenarioLevel}</span>
          <input
            type="number"
            step="0.01"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
          {!levelOk && (
            <small data-bad>{direction === 'long_call' ? t.levelSideCall : t.levelSidePut}</small>
          )}
        </label>
        <label className={styles.field}>
          <span>{t.holdBars}</span>
          <input
            type="number"
            min={1}
            max={barsToExpiry}
            value={holdBars}
            onChange={(e) => setHoldBars(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          <span>{t.contracts}</span>
          <input
            type="number"
            min={1}
            max={20}
            value={contracts}
            onChange={(e) => setContracts(Math.max(1, Number(e.target.value)))}
          />
        </label>
      </div>

      <dl className={styles.miniLedger}>
        <div>
          <dt>{t.atmStrike}</dt>
          <dd>{strike.toFixed(2)}</dd>
        </div>
        <div>
          <dt>{t.premium}</dt>
          <dd>{premium.toFixed(2)}</dd>
        </div>
        <div>
          <dt>{t.maxLoss}</dt>
          <dd>${maxLoss.toFixed(0)}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={!canSeal}>
          <Lock size={14} aria-hidden="true" /> {t.sealCard}
        </button>
        <button type="button" className={styles.ghost} onClick={onBack}>
          <ArrowLeft size={13} aria-hidden="true" /> {t.gateTitle}
        </button>
      </div>
    </form>
  );
}

function RiskPanel({
  t,
  locale,
  verdict,
  rested,
  onRested,
  onStandDown,
  onOpen,
}: {
  t: T;
  locale: Locale;
  verdict: ReturnType<typeof evaluateGates>;
  rested: boolean;
  onRested: (v: boolean) => void;
  onStandDown: () => void;
  onOpen: (verdict: ReturnType<typeof evaluateGates>) => void;
}) {
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelLabel}>03 / {t.riskTitle}</p>
      <h2>{t.riskLead}</h2>
      <ul className={styles.gates}>
        {verdict.gates.map((g) => (
          <li key={g.id} data-pass={g.pass}>
            {g.pass ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
            <b>{t.gate[g.id]}</b>
            <span>{g.detail}</span>
          </li>
        ))}
      </ul>
      <label className={styles.check}>
        <input type="checkbox" checked={rested} onChange={(e) => onRested(e.target.checked)} />
        {t.rested}
      </label>
      <p className={styles.riskLine}>
        {t.riskUsd}: <b>{money(verdict.riskUsd, locale)}</b> · {verdict.riskPct.toFixed(2)}%{' '}
        {t.ofFunds}
      </p>
      <p className={styles.verdict} data-allowed={verdict.allowed}>
        {verdict.allowed ? t.allowed : t.blocked}
      </p>
      <div className={styles.actions}>
        {verdict.allowed ? (
          <button type="button" className={styles.primary} onClick={() => onOpen(verdict)}>
            {t.openSession} <ArrowRight size={15} aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          className={verdict.allowed ? styles.ghost : styles.primary}
          onClick={onStandDown}
        >
          {t.standDown}
        </button>
      </div>
      {!verdict.allowed && <p className={styles.hint}>{t.blockedHint}</p>}
    </div>
  );
}

function LivePanel({
  t,
  barIndex,
  holdBars,
  underlying,
  premium,
  entryPremium,
  unrealized,
  riskUsd,
  invalidatedNow,
  ignored,
  levelNow,
  onAdvance,
  onClose,
}: {
  t: T;
  barIndex: number;
  holdBars: number;
  underlying: number;
  premium: number;
  entryPremium: number;
  unrealized: number;
  riskUsd: number;
  invalidatedNow: boolean;
  ignored: boolean;
  levelNow: boolean;
  onAdvance: () => void;
  onClose: () => void;
}) {
  const r = riskUsd > 0 ? unrealized / riskUsd : 0;
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelLabel}>04 / {t.liveTitle}</p>
      <h2>{t.liveLead}</h2>
      {invalidatedNow && !ignored && (
        <p className={styles.banner} data-tone="bad">
          {t.invalidationHitBanner}
        </p>
      )}
      {ignored && (
        <p className={styles.banner} data-tone="bad">
          {t.ignoredBanner}
        </p>
      )}
      {levelNow && (
        <p className={styles.banner} data-tone="good">
          {t.levelHitBanner}
        </p>
      )}
      <dl className={styles.liveLedger}>
        <div>
          <dt>{t.bar}</dt>
          <dd>
            {barIndex} / {holdBars}
          </dd>
        </div>
        <div>
          <dt>{t.underlying}</dt>
          <dd>{underlying.toFixed(2)}</dd>
        </div>
        <div>
          <dt>{t.mark}</dt>
          <dd>
            {premium.toFixed(2)} <small>({entryPremium.toFixed(2)})</small>
          </dd>
        </div>
        <div>
          <dt>{t.unrealized}</dt>
          <dd data-tone={unrealized > 0 ? 'up' : unrealized < 0 ? 'down' : undefined}>
            {signed(unrealized)} <small>{signed(r)}R</small>
          </dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <button
          type="button"
          className={invalidatedNow ? styles.ghost : styles.primary}
          onClick={onAdvance}
        >
          {t.advance} <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={invalidatedNow ? styles.primary : styles.ghost}
          onClick={onClose}
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}

function AfterPanel({
  t,
  locale,
  scenarioTicker,
  assumption,
  entry,
  exit,
  onSeal,
}: {
  t: T;
  locale: Locale;
  scenarioTicker: string;
  assumption: Assumption;
  entry: Entry;
  exit: NonNullable<Session['exit']>;
  onSeal: (lesson: string) => void;
}) {
  const [lesson, setLesson] = useState('');
  const ok = lesson.trim().length >= 10;
  return (
    <form
      className={styles.panelBody}
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSeal(lesson.trim());
      }}
    >
      <p className={styles.panelLabel}>05 / {t.afterTitle}</p>
      <h2>{t.afterLead}</h2>
      {exit.reason === 'expiry' && (
        <p className={styles.banner} data-tone="bad">
          {t.expiredBanner}
        </p>
      )}
      <div className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>
            {t.before} <span className={styles.mono}>{entry.beforeHash}</span>
          </p>
          <p>
            <b>{scenarioTicker}</b> ·{' '}
            {assumption.direction === 'long_call' ? t.longCall : t.longPut} · {assumption.contracts}
            × @ {entry.premium.toFixed(2)}
          </p>
          <p className={styles.cardQuote}>“{assumption.reason}”</p>
          <p className={styles.mono}>
            INV {assumption.invalidation.toFixed(2)} · LVL {assumption.scenarioLevel.toFixed(2)} ·{' '}
            {assumption.holdBars} {t.bars} · {t.riskUsd.toLowerCase()}{' '}
            {money(entry.riskUsd, locale)}
          </p>
        </div>
        <div
          className={styles.card}
          data-tone={exit.pnlUsd > 0 ? 'up' : exit.pnlUsd < 0 ? 'down' : 'flat'}
        >
          <p className={styles.cardLabel}>{t.after}</p>
          <p>
            {t.exit}: <b>{exit.premium.toFixed(2)}</b> · {t.exitReason[exit.reason]} ·{' '}
            {exit.barsHeld} {t.bars}
          </p>
          <p className={styles.cardResult}>
            {signed(exit.realizedR)}R <small>{signed(exit.pnlUsd)} USD</small>
          </p>
          <p className={styles.mono}>
            {t.ruleFollowed.toLowerCase()}: {exit.ruleFollowed ? t.yesRule : t.noRule}
            {exit.invalidationHit ? ` · INV hit` : ''}
          </p>
        </div>
      </div>
      <label className={styles.field}>
        <span>{t.lesson}</span>
        <textarea
          rows={3}
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          placeholder={t.lessonPlaceholder}
          maxLength={280}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={!ok}>
          <Lock size={14} aria-hidden="true" /> {t.sealReceipt}
        </button>
      </div>
    </form>
  );
}
