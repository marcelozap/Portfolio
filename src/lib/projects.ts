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
    name: 'GREEN MACHINE',
    tagline:
      'Single markets laboratory: probabilistic analytics plus orchestrated agentic research and execution prep—risk-aware automation, never implied returns.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'Green Machine unifies exploratory analytics dashboards and unattended monitoring into one evolving stack tuned for skepticism-first decisions. Probabilistic context, volatility and regime overlays, reproducible hypotheses, controlled automation, alerting, journaling, handshake-gated actions, explicit kill switches, and auditable telemetry sit under the same codebase so the workspace can iterate without rewriting its spine. Operating capital is discretionary; variance is acknowledged by design—not performance marketing.',
    coreIdeas: [
      'Unified surface for probabilistic dashboards, agent-assisted research synthesis, and hands-off supervising loops constrained by mandate',
      'Automation envelopes escalate to humans when ambiguity outruns policy—people still set intent, limits, and rollback',
      'Calibrated overlays (liquidity stress, regimes, tails) prioritized over persuasive charting',
      'Versioned UI-to-host bridges with strict contracts separating operator intent from brokerage/API touchpoints',
      'Evaluation envelopes and replay so autonomy improves deliberately instead of collapsing into folklore',
    ],
    features: [
      {
        title: 'Research-through-execution loop',
        description:
          'Agents handle repetitive research passes, consistency checks, and alerting; execution paths stay optional, capped, and reversible where the broker/API allows.',
      },
      {
        title: 'Risk-aware command surface',
        description:
          'Dashboards emphasize uncertainty and drawdown context—not implied edge—so sizing and halts stay intentional.',
      },
      {
        title: 'Distributed execution plane',
        description:
          'FastAPI `/ws/feed`, factor tiles, and strict contracts separate interactive research from the machine that talks to markets.',
      },
      {
        title: 'Evaluation & replay',
        description:
          'Structured logs and replay snapshots support post-mortems and constraint tuning without pretending past behavior guarantees future results.',
      },
    ],
    metrics: [
      { label: 'Operating mode', value: 'Hands-off' },
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
