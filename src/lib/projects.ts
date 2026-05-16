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
    tagline: 'Hands-off, agentic trading stack that compounds its own edge.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'Green Machine merges disciplined market analytics with a distributed execution mesh: probability-first dashboards, volatility and regime context, and a versioned bridge from research UI to trading host. Agentic layers automate the full loop—signal formation, risk checks, alerting, and execution prep—so the system runs with minimal babysitting while feedback continuously sharpens behavior.',
    coreIdeas: [
      'Agentic control loop: research → risk → action with human-in-the-loop only where policy requires',
      'Probability surfaces instead of story trading — vol grids, regimes, and base-rate overlays',
      'Mac control deck ↔ Windows host over a strict, versioned WebSocket contract',
      'Telegram and in-app alerting on breaches; one-hop kill switch always visible',
      'Research memory and evaluation hooks so automation gets smarter run over run',
    ],
    features: [
      {
        title: 'Autonomous operating loop',
        description:
          'Orchestrated agents monitor markets, reconcile signals with risk policy, and stage trades while logging every decision for replay and tuning.',
      },
      {
        title: 'Probability command deck',
        description:
          'Volatility heatmaps, regime shading, and macro timelines rendered in a single calm surface—built for decisions, not noise.',
      },
      {
        title: 'Distributed execution mesh',
        description:
          'FastAPI `/ws/feed`, six-factor tiles, and handshake-gated actions keep research UX separated from execution on the host.',
      },
      {
        title: 'Pattern intelligence',
        description:
          'Pattern tagging with historical base rates and worst-case paths so automated sizing respects distribution, not a single point forecast.',
      },
    ],
    metrics: [
      { label: 'Automation depth', value: 'Full loop' },
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
