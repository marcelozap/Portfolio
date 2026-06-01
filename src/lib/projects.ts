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
    tagline:
      'Creative operating system for live-loop artists, project memory, and audio-reactive visual artwork.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    website: 'https://gatekpt.ai',
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
    name: 'Green Machine',
    tagline:
      'Python market-movement research system for backtests, historical context, and evidence-based review.',
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
    tagline:
      'Premium tennis lifestyle product pairing a fast daily rally engine with training, journaling, global court discovery, and real-world fashion and gear.',
    domain: 'game',
    status: 'prototype',
    accent: 'amber',
    year: '2025',
    description:
      'Rally is a premium tennis lifestyle product built around a fast daily rally engine. The broader experience connects training logs, match history, journaling, global court discovery, avatar identity, and real-world fashion and gear into one tennis-native product surface.',
    coreIdeas: [
      'Fast daily rally engine as the repeatable engagement hook',
      'Lifestyle product surface beyond gameplay alone',
      'Local-first iOS architecture with optional account sync',
      'Training, journaling, match history, and global court discovery in one product',
      'Fashion and gear flows tied to real-world tennis identity',
    ],
    features: [
      {
        title: 'Daily rally engine',
        description:
          'A fast rally mechanic gives the product a short, repeatable daily-open loop without making the entire experience feel like a casual game.',
      },
      {
        title: 'Training and journal layer',
        description:
          'Training sessions, matches, and journal entries live in the same product so the app supports a player’s actual tennis routine.',
      },
      {
        title: 'Courts, fashion, and gear',
        description:
          'Global court discovery, avatar identity, fashion, and gear make Rally feel like a complete tennis lifestyle product surface.',
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
