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
    tagline: 'Audio workflow system. Cues, captures, visuals, release prep.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    website: 'https://gatekpt.ai',
    description:
      'GateKPT MusicOS is a C#/.NET desktop workflow system for audio and performance work. It keeps sections, RC-505 cues, lyrics, captions, stems, routing notes, and visuals in one local workspace.',
    coreIdeas: [
      'Fast capture without burying the work in extra screens',
      'Live-loop performance planning built around sections, layer order, and cue cards',
      'Local project memory for lyrics, takes, routing notes, stems, visuals, and export tasks',
      'Hardware-aware tooling for RC-505 and studio routing',
      'AI command layer direction: organize, summarize, and prep work without taking over the work',
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
      'Green Machine is a private Python/FastAPI and React workspace for market data, backtests, labels, and LLM review notes.',
    coreIdeas: [
      'Historical market data, labels, and repeatable tests',
      'Backtests and notes that separate evidence from intuition',
      'Terrain-inspired interface for reading context without hype',
      'LLM-assisted review for assumptions, holes, and next questions',
      'Research boundary: no signal service, financial advice, or broker order routing',
    ],
    features: [
      {
        title: 'Context research',
        description:
          'Studies stocks and futures using historical data, momentum/regime context, intraday labels, and similar-day market memory.',
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
      { label: 'Focus', value: 'Context' },
      { label: 'Method', value: 'Backtests' },
      { label: 'Boundary', value: 'No routing' },
    ],
    stack: ['Python', 'FastAPI', 'React', 'SQLite', 'pytest', 'LLM workflows'],
  },
  {
    id: 'rally',
    name: 'RALLY',
    tagline: 'Practice system. Training logs, activity data, progress.',
    domain: 'game',
    status: 'prototype',
    accent: 'amber',
    year: '2025',
    website: '/rally',
    description:
      'Rally is a practice app for sports, sessions, activity data, and improvement loops. It brings training logs, match history, recovery notes, wearable data, and progress review into one place.',
    coreIdeas: [
      'Daily practice loop as the lightweight reason to open the app',
      'Memory across training logs, matches, recovery notes, and improvement notes',
      'Support for different sports and real-world routines',
      'Wearable data direction for Garmin-style activity history and review',
      'Local-first iOS architecture with optional account sync',
    ],
    features: [
      {
        title: 'Daily practice engine',
        description:
          'A short repeatable loop keeps practice visible without turning the app into another noisy tracker.',
      },
      {
        title: 'Training memory',
        description:
          'Sessions, matches, notes, recovery, and improvement markers live together so the system can show what is actually changing.',
      },
      {
        title: 'Activity data',
        description:
          'Designed to grow toward Garmin and activity-data sync across running, swimming, biking, golf, cricket, court work, and other practice loops.',
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
      { label: 'Loop', value: 'Practice' },
    ],
    stack: ['SwiftUI', 'SpriteKit', 'SwiftData', 'Activity data', 'Garmin API', 'Node.js'],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
