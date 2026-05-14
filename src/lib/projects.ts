/**
 * Project catalog rendered by the projects grid + modal.
 * Strongly typed so we get autocomplete and safe refactors.
 */

export type ProjectStatus = 'in-development' | 'concept' | 'research';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface Project {
  /** kebab-case slug, used as DOM id and modal route */
  id: string;
  /** display title */
  name: string;
  /** short one-liner */
  tagline: string;
  /** which system family this belongs to */
  domain: 'audio' | 'markets' | 'game' | 'systems' | 'infra';
  /** development status */
  status: ProjectStatus;
  /** main pitch paragraph */
  description: string;
  /** core ideas (bulleted) */
  coreIdeas: string[];
  /** detailed features for modal */
  features: ProjectFeature[];
  /** key numbers for the dashboard view */
  metrics: ProjectMetric[];
  /** technology pills */
  stack: string[];
  /** accent palette used for the card glow */
  accent: 'cyan' | 'amber' | 'violet' | 'green';
  /** year started */
  year: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'gatekpt',
    name: 'GATEKPT',
    tagline: 'Intelligent audio workflow OS for producers and composers.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    description:
      'A creative technology system designed around the actual workflow of making music: long sessions, lost ideas, half-remembered references. GATEKPT acts as the connective tissue between the DAW, the producer, and the long arc of a record — an AI co-pilot that remembers what you were chasing.',
    coreIdeas: [
      'Multi-threaded chat with persistent project memory',
      'Plugin-style UI surfaces that dock alongside the DAW',
      'Audio-reactive interface that responds to playback',
      'Reference-aware feedback (BPM, key, mix targets)',
      'Session journaling that survives across days',
    ],
    features: [
      {
        title: 'Threaded sessions',
        description:
          'Every project gets its own conversation tree. Branch ideas, archive dead ends, never lose context between studio nights.',
      },
      {
        title: 'Callback memory',
        description:
          'GATEKPT recalls earlier decisions — "we already tried side-chained sub at -6dB" — so the assistant stops repeating itself.',
      },
      {
        title: 'Floating plugin windows',
        description:
          'Glass UI panels that snap to the side of the screen, modeled on modern DAW plugin chrome.',
      },
      {
        title: 'Audio-reactive shell',
        description:
          'The entire UI breathes with the track: waveform overlays, transient flashes, ambient color shifts.',
      },
    ],
    metrics: [
      { label: 'Active threads', value: '∞' },
      { label: 'Latency target', value: '< 80ms' },
      { label: 'DAW bridges', value: '3' },
    ],
    stack: ['TypeScript', 'Web Audio', 'LLM', 'Tauri', 'React'],
  },
  {
    id: 'money-machine',
    name: 'MONEY MACHINE',
    tagline: 'Probabilistic market analytics for the patient operator.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'A disciplined, systems-first market research environment. Not a "trading guru" toolkit — a probability dashboard that respects the math: regime detection, volatility surfaces, options flow context, and macro-event timing rendered in one calm, legible space.',
    coreIdeas: [
      'Probability-first dashboards over predictions',
      'Volatility surface and term-structure visualization',
      'Macro-event timeline with cause/effect overlays',
      'Options flow contextualized by regime',
      'Pattern library with backtested base rates',
    ],
    features: [
      {
        title: 'Volatility heatmap',
        description:
          'Animated IV / RV grids per sector and tenor, with regime shading so you see where vol is mispriced before clicking.',
      },
      {
        title: 'Macro timeline',
        description:
          'A horizontal timeline of CPI prints, FOMC, earnings, NFP — overlaid against your watchlist drawdowns.',
      },
      {
        title: 'Pattern engine',
        description:
          'Tag any chart pattern; the engine returns base-rate statistics, expected value, and worst historical realization.',
      },
      {
        title: 'Probability cones',
        description:
          'Replace point predictions with distributions. Every trade idea is sized off a probabilistic forecast, not a hunch.',
      },
    ],
    metrics: [
      { label: 'Series tracked', value: '1,400+' },
      { label: 'Update cadence', value: '15s' },
      { label: 'Regimes modeled', value: '6' },
    ],
    stack: ['Python', 'Next.js', 'D3', 'DuckDB', 'Polars'],
  },
  {
    id: 'green-machine',
    name: 'GREEN MACHINE',
    tagline: 'Distributed SPY options command center with real-time alerts.',
    domain: 'infra',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'A distributed trading command center for SPY options analytics. A Mac front-end talks to a Windows trading host over a versioned WebSocket protocol with a strict handshake, surfaces six factors per signal, and always exposes a one-hop kill switch to the operator. Strict separation of concerns: signals on the host, UX on the Mac.',
    coreIdeas: [
      'Versioned WebSocket API contract between Mac and trading host',
      'Operator-first kill switch — one hop from idea to off',
      'Six factors per signal, surfaced as calm glassy tiles',
      'Telegram alerting on threshold breaches',
      'Vite-proxied dev loop so backend + UI boot together',
    ],
    features: [
      {
        title: 'Mac Control Deck',
        description:
          'A focused front-end with kill switch, handshake, and six-factor tiles. The UI is intentionally calm — no flashing red anywhere unless something is actually wrong.',
      },
      {
        title: 'FastAPI bridge',
        description:
          'Python backend exposes `/ws/feed` to all connected clients, handles auth, and bridges Telegram for out-of-app alerting.',
      },
      {
        title: 'Strict API contract',
        description:
          'Every message is versioned and documented; the handshake gates dangerous actions like notional-trade requests.',
      },
      {
        title: 'Single-command dev loop',
        description:
          '`npm run dev:all` boots backend + UI together, with Vite proxying WebSockets so the dev experience matches production.',
      },
    ],
    metrics: [
      { label: 'Hosts in mesh', value: '2' },
      { label: 'Factors / signal', value: '6' },
      { label: 'Kill hops', value: '1' },
    ],
    stack: ['React', 'Vite', 'FastAPI', 'WebSockets', 'Telegram API'],
  },
  {
    id: 'rally',
    name: 'RALLY',
    tagline: 'A cinematic tennis-inspired flow-state game concept.',
    domain: 'game',
    status: 'concept',
    accent: 'amber',
    year: '2026',
    description:
      'Rally reimagines tennis as a meditation on movement, focus, and precision timing. Neon courts, motion trails, atmospheric crowd hums. A sports experience built around flow state rather than spectacle — every point is a small mastery loop.',
    coreIdeas: [
      'Movement-first input model — placement over power',
      'Flow-state progression: longer rallies unlock visual layers',
      'Atmospheric environments — night courts, rooftop courts, stadium rain',
      'Cinematic HUD that fades when you are dialed in',
      'Mastery loop: each session is a session, not a tournament',
    ],
    features: [
      {
        title: 'Neon court system',
        description:
          'Multiple court archetypes — clay-noir, rooftop-glow, stadium-rain — each with its own physics and sound design.',
      },
      {
        title: 'Flow HUD',
        description:
          'The HUD recedes the deeper you go. Hit ten clean rallies and the UI dims to almost nothing.',
      },
      {
        title: 'Precision-timing meter',
        description:
          'A subtle ring around the racquet visualizes timing windows without breaking immersion.',
      },
      {
        title: 'Progression of moments',
        description:
          'Unlock environmental layers (lighting, weather, crowd density) by accumulating high-quality points, not just wins.',
      },
    ],
    metrics: [
      { label: 'Court archetypes', value: '6' },
      { label: 'Frame target', value: '120fps' },
      { label: 'Audio layers', value: '14' },
    ],
    stack: ['Unity', 'C#', 'Shader Graph', 'Wwise'],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
