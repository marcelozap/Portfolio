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
    name: 'GATEKPT MusicOS',
    tagline:
      'Creative operating system for live-loop artists, project memory, and audio-reactive visual artwork.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    description:
      'GateKPT MusicOS is a C#/.NET desktop creative operating system for artists who build music through live performance. It connects section-based song planning, RC-505 cue management, lyric and caption memory, stem capture, hardware routing notes, and audio-reactive visual artwork into one focused artist cockpit.',
    coreIdeas: [
      'Live-loop performance workflow built around sections, layer order, and cue cards',
      'Local project memory for lyrics, takes, routing notes, stems, visuals, and export tasks',
      'Audio-reactive visual artwork driven by live Focusrite or RC-505 input',
      'Video-first production pipeline for captions, aspect ratios, loudness, and platform exports',
      'Hardware-aware music workflow that sits above the creative rig without replacing it',
    ],
    features: [
      {
        title: 'Live loop workflow',
        description:
          'Guides RC-505-based song building through section cards, layer order, cue notes, and performance memory.',
      },
      {
        title: 'Project memory',
        description:
          'Preserves lyrics, captures, takes, captions, routing notes, stems, visual presets, and export tasks in a unified local project file.',
      },
      {
        title: 'Audio-reactive visuals',
        description:
          'Uses live audio input to generate visual paintings for performance backdrops, video material, and stage visuals.',
      },
      {
        title: 'Video-first production',
        description:
          'Supports lyric captions, lip-sync review, export planning, aspect ratios, loudness targets, and platform-ready video workflows.',
      },
    ],
    metrics: [
      { label: 'Runtime', value: '.NET' },
      { label: 'Primary rig', value: 'RC-505' },
      { label: 'Memory model', value: 'Local' },
    ],
    stack: ['C#', '.NET', 'Avalonia', 'NAudio', 'MIDI', 'FFmpeg'],
  },
  {
    id: 'green-machine',
    name: 'GREEN MACHINE',
    tagline:
      'Python/FastAPI quantitative research platform with Schwab data, backtesting, paper execution, and risk controls.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2024',
    description:
      'Green Machine Quant OS is a Python/FastAPI quantitative research and paper-execution platform that connects OAuth-secured Schwab market and account data to local research workflows. It supports quotes, historical candles, options chains, account previews, reproducible backtests, risk metrics, paper trading, and AI-assisted research review.',
    coreIdeas: [
      'OAuth-secured broker API integration for live data access and account previews',
      'Local-first data spine for historical candles, research outputs, and reproducible experiments',
      'Strategy research loop spanning momentum, regime overlays, risk budgeting, and walk-forward validation',
      'Paper execution engine with order intents, execution reports, position snapshots, and futures multipliers',
      'Live broker execution isolated behind explicit safety gates and review boundaries',
    ],
    features: [
      {
        title: 'Schwab integration',
        description:
          'Implements OAuth 2 authorization-code flow, live quotes, price history, options chains, and account/position preview routes.',
      },
      {
        title: 'Reproducible research',
        description:
          'Backtests strategies with transaction costs, drawdown analysis, documented research memos, and walk-forward validation.',
      },
      {
        title: 'Paper execution',
        description:
          'Uses a PaperBroker abstraction for order intents, execution reports, realized/unrealized P&L, and live quote marking.',
      },
      {
        title: 'Risk controls',
        description:
          'Keeps broker execution separated from research and paper trading behind max-loss requirements, drawdown guards, and explicit review gates.',
      },
    ],
    metrics: [
      { label: 'Broker API', value: 'Schwab' },
      { label: 'Execution', value: 'Paper' },
      { label: 'Safety', value: 'Gated' },
    ],
    stack: [
      'Python',
      'FastAPI',
      'SQLite',
      'pandas',
      'pytest',
      'Schwab API',
      'OAuth 2.0',
      'LLM review',
    ],
  },
  {
    id: 'rally',
    name: 'RALLY',
    tagline:
      'Tennis lifestyle app pairing a fast daily game loop with training, journaling, and style.',
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
