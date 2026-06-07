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
  /** optional public landing page */
  website?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'gatekpt',
    name: 'GATEKPT MusicOS',
    tagline: 'Live music memory. Loops, cues, visuals, release prep.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    website: 'https://gatekpt.ai',
    description:
      'GateKPT MusicOS is a C#/.NET desktop creative operating system for artists who build music through live performance. It organizes section-based song planning, RC-505 cue management, lyric/caption memory, stem capture, hardware routing, and visual prep into one artist-controlled workflow.',
    coreIdeas: [
      'Artist-first workflow for capturing ideas quickly without flattening the creative process',
      'Live-loop performance planning built around sections, layer order, and cue cards',
      'Local project memory for lyrics, takes, routing notes, stems, visuals, and export tasks',
      'Hardware-aware music tooling that supports RC-505 and studio routing instead of replacing the rig',
      'AI command layer direction: organize, summarize, and prep creative work without generating the artist for them',
    ],
    features: [
      {
        title: 'Live-loop planning',
        description:
          'Guides RC-505-based song building through section cards, layer order, cue notes, and performance memory.',
      },
      {
        title: 'Project memory',
        description:
          'Preserves lyrics, captures, takes, captions, routing notes, stems, visual presets, and export tasks in a unified local project file.',
      },
      {
        title: 'Creative command layer',
        description:
          'Designed for simple commands like organizing takes, finding hooks, preparing captions, and shaping versions while keeping the artist in control.',
      },
      {
        title: 'Release prep',
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
    name: 'Green Machine',
    tagline: 'Trading research cockpit. Backtests, risk, review.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: 'Fall 2021',
    website: '/green-machine',
    description:
      'Green Machine is a Python/FastAPI and React research system for studying market movement with historical data, reproducible backtests, movement labels, risk context, and LLM-assisted review. The goal is to turn trading ideas into measured research artifacts: what was tested, what failed, what improved, and what evidence is still missing.',
    coreIdeas: [
      'Market movement modeling with Python, historical data, labels, and repeatable tests',
      'Backtests and research memos that separate evidence from intuition',
      'Terrain-inspired interface for reading movement, regime, and context without hype',
      'LLM-assisted review for summarizing assumptions, holes, and next research questions',
      'Research boundary: no signal service, financial advice, or broker order routing',
    ],
    features: [
      {
        title: 'Movement research',
        description:
          'Studies how stocks and futures move using historical data, momentum/regime context, intraday labels, and similar-day market memory.',
      },
      {
        title: 'Backtesting and evidence',
        description:
          'Converts ideas into reproducible tests, research memos, risk notes, and follow-up questions instead of treating one result as a signal.',
      },
      {
        title: 'Technical stack',
        description:
          'Built around Python, FastAPI, React, SQLite, pytest, local data storage, tested API routes, and LLM-assisted workflows.',
      },
      {
        title: 'What it is not',
        description:
          'Not automated trading, not financial advice, not a signal service, and not broker order routing.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Movement' },
      { label: 'Method', value: 'Backtests' },
      { label: 'Boundary', value: 'No routing' },
    ],
    stack: ['Python', 'FastAPI', 'React', 'SQLite', 'pytest', 'LLM workflows'],
  },
  {
    id: 'rally',
    name: 'RALLY',
    tagline: 'Tennis routine. Daily play, courts, style, progress.',
    domain: 'game',
    status: 'prototype',
    accent: 'amber',
    year: '2025',
    description:
      'Rally is a premium tennis lifestyle product built around a fast daily rally loop and a broader player profile. It connects training logs, match history, journaling, court discovery, player identity, and gear/fashion into one tennis-native product surface.',
    coreIdeas: [
      'Daily rally loop as the lightweight reason to open the product',
      'Player memory across training logs, matches, journaling, and improvement notes',
      'Court discovery and tennis routine tools beyond gameplay alone',
      'Premium identity layer with avatar, fashion, gear, and real-world tennis taste',
      'Local-first iOS architecture with optional account sync',
    ],
    features: [
      {
        title: 'Daily rally engine',
        description:
          'A fast rally mechanic creates a short repeatable daily loop while the product stays positioned as a premium tennis companion, not a throwaway casual game.',
      },
      {
        title: 'Player memory',
        description:
          'Training sessions, matches, journal entries, and improvement notes live together so the product supports a real tennis routine.',
      },
      {
        title: 'Lifestyle surface',
        description:
          'Court discovery, player identity, fashion, and gear make Rally feel like a tennis-native lifestyle product instead of only a tracker.',
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
