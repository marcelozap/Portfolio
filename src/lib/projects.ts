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
    id: 'green-machine',
    name: 'Green Machine',
    tagline:
      'A research kernel for price movement: opaque, non-linear models behind a disciplined shell—outputs are trade suggestions and telemetry, not promises.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'Green Machine is intentionally a black box: the interesting structure lives inside models readers are not meant to fully reverse-engineer from the UI. The surrounding system behaves like a small lab—hypotheses, overlays on movement and liquidity, versioned runs, and hard gates between exploration and anything that could touch a broker. Trade ideas surface as ranked suggestions under explicit risk budgets; nothing here promises returns or peddles “alpha”—only a controlled loop for interrogating markets with grown-up skepticism.',
    coreIdeas: [
      'Kernel-and-shell split: non-linear / opaque internals emit suggestions and diagnostics; the shell is for supervision, not peering into every weight',
      'Price movement and microstructure framed first—regimes, stress, tails—before any narrative layer',
      'Human-in-the-loop by design: mandate, caps, kill switches, and journals so automation never outruns policy',
      'Strict contracts between research UI, agents, and execution hosts—intent stays separable from API touchpoints',
      'Replay and post-mortems replace folklore; past behavior is instrumentation, not a forward guarantee',
    ],
    features: [
      {
        title: 'Suggestion plane',
        description:
          'The stack surfaces candidate trades and context (constraints, dissenting signals) while leaving sizing and go/no-go to the operator—no implied edge, no performance copy.',
      },
      {
        title: 'Research command surface',
        description:
          'Dashboards foreground uncertainty, drawdown envelopes, and regime markers so decisions stay grounded in risk, not charts that flatter.',
      },
      {
        title: 'Distributed host plane',
        description:
          'FastAPI `/ws/feed`, factor tiles, and hardened bridges keep live research and telemetry distinct from brokerage paths until deliberately handed off.',
      },
      {
        title: 'Evaluation & replay',
        description:
          'Structured logs and replay snapshots support tuning and incident review without treating backtests as prophecy.',
      },
    ],
    metrics: [
      { label: 'Lab posture', value: 'Kernel-first' },
      { label: 'Hosts in mesh', value: '2' },
      { label: 'Factors / signal', value: '6' },
    ],
    stack: [
      'Python',
      'FastAPI',
      'React',
      'Vite',
      'WebSockets',
      'LLM agents',
      'Telegram API',
      'Polars',
    ],
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
