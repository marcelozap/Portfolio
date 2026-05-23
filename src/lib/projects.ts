/**
 * Project catalog rendered by the projects grid + modal.
 * Strongly typed so we get autocomplete and safe refactors.
 */

export type ProjectStatus = 'in-development' | 'prototype' | 'research';

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
    tagline: 'AI-assisted production workspace for preserving context across long studio sessions.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    description:
      'GATEKPT is a desktop-first tool for producers and composers who lose time to context switching, forgotten mix decisions, and scattered references. It combines project memory, threaded discussion, and feedback utilities so a session can pick up exactly where it left off.',
    coreIdeas: [
      'Persistent project memory instead of disposable chat sessions',
      'Threaded critique, arrangement, and mix conversations in one workspace',
      'Reference-aware analysis for BPM, key, arrangement, and mix targets',
      'Lightweight sidecar surfaces that live alongside the DAW',
      'Session journaling so ideas and decisions stay searchable',
    ],
    features: [
      {
        title: 'Project memory',
        description:
          'Each track keeps a durable record of notes, decisions, and experiments so progress survives between sessions.',
      },
      {
        title: 'Threaded workspaces',
        description:
          'Separate lanes for arrangement, sound design, mix notes, and references keep collaboration structured without flattening every idea into one chat.',
      },
      {
        title: 'Reference analysis',
        description:
          'The workspace can reason about tempo, tonal center, and target references so feedback stays grounded in the record being made.',
      },
      {
        title: 'Dockable surfaces',
        description:
          'Panels are designed to sit beside the DAW rather than replace it, making the tool feel like part of the production environment.',
      },
    ],
    metrics: [
      { label: 'Workspace modes', value: '4' },
      { label: 'Primary surface', value: 'Desktop' },
      { label: 'Memory model', value: 'Persistent' },
    ],
    stack: ['TypeScript', 'Web Audio', 'LLM', 'Tauri', 'React'],
  },
  {
    id: 'green-machine',
    name: 'GREEN MACHINE',
    tagline:
      'Research and monitoring platform for decision support and guardrailed automation.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'Green Machine is a personal research platform built around skepticism, traceability, and controlled automation. It combines dashboards, monitoring, alerting, replayable logs, and execution prep so ideas can be tested and supervised without turning the system into performance theater.',
    coreIdeas: [
      'Research, monitoring, and automation share one controlled operating surface',
      'Human approval stays in the loop when ambiguity or risk exceeds policy',
      'Risk and regime context appear before conviction or action',
      'Clear contracts separate analysis UI, agents, and broker-facing systems',
      'Replayable logs support post-mortems and deliberate system tuning',
    ],
    features: [
      {
        title: 'Research-through-monitoring loop',
        description:
          'Automated passes handle repetitive research, consistency checks, and alerting while leaving the operator in control of sizing, approval, and escalation.',
      },
      {
        title: 'Risk-first dashboards',
        description:
          'Dashboards emphasize uncertainty, drawdown context, and regime shifts so action stays grounded in downside awareness.',
      },
      {
        title: 'Separation of concerns',
        description:
          'UI, data services, and broker-facing components are kept behind strict contracts so experimentation does not contaminate execution paths.',
      },
      {
        title: 'Evaluation & replay',
        description:
          'Structured logs and replay snapshots make it easier to review what the system saw, suggested, and would have done.',
      },
    ],
    metrics: [
      { label: 'Signal layers', value: '6' },
      { label: 'Alert channels', value: '2' },
      { label: 'Execution stance', value: 'Guardrailed' },
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
    tagline: 'Tennis lifestyle app pairing a fast daily game loop with training, journaling, and style.',
    domain: 'game',
    status: 'prototype',
    accent: 'amber',
    year: '2026',
    description:
      'Rally is a tennis lifestyle product, not just a game. The core hook is a high-polish rhythm-swipe mini-game, but the broader experience wraps that around training logs, match logs, journaling, avatar customization, and a shop surface connected to real brands.',
    coreIdeas: [
      'One daily-engagement hook anchored by a short, replayable game loop',
      'The mini-game is a retention driver, not the entire product',
      'Local-first iOS architecture with optional account sync',
      'Avatar, apparel, and shop flows tied to real-world purchase intent',
      'Audio, haptics, and motion used to make the product feel premium',
    ],
    features: [
      {
        title: 'Play tab as the hook',
        description:
          'A rhythm-adjacent tennis mini-game provides the fast, repeatable loop that gives the app daily-open energy.',
      },
      {
        title: 'Logs, journal, and progression',
        description:
          'Training sessions, matches, and journal entries live in the same product so the app supports a player’s actual tennis routine.',
      },
      {
        title: 'Avatar and shop layer',
        description:
          'Users can customize a tennis avatar, browse branded apparel, and move from digital identity to vendor purchase intent.',
      },
      {
        title: 'Local-first sync model',
        description:
          'SwiftData drives the on-device experience first, with optional account sync for users who want persistence across sessions.',
      },
    ],
    metrics: [
      { label: 'Core tabs', value: '5' },
      { label: 'Platform', value: 'iOS' },
      { label: 'Primary loop', value: 'Daily' },
    ],
    stack: ['SwiftUI', 'SpriteKit', 'SwiftData', 'AVAudioEngine', 'Node.js'],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
