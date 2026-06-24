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
    id: 'local-workflow-os',
    name: 'Local Workflow OS',
    tagline: 'Local-first workflow system for queues, role packets, and approval-gated automation.',
    domain: 'systems',
    status: 'in-development',
    accent: 'violet',
    year: '2026',
    description:
      'Local Workflow OS / Career Forge turns scattered job leads, role notes, resume versions, application packets, and interview prep into structured local files and reviewable next actions. It uses C#/.NET, PowerShell, Markdown, CSV, JSON, a native Windows launcher, and browser/application-page inspection concepts.',
    coreIdeas: [
      'Local-first state: Markdown packets, CSV trackers, JSON pipeline outputs, and native launcher entry points',
      'Role scoring, decision gates, status summaries, resume targeting notes, and recruiter-screen prep',
      'Browser/application-page inspection that detects fields, buttons, uploads, and risk signals without submitting data',
      'Human-in-the-loop automation: prepare, organize, inspect, and summarize while final sensitive actions stay manual',
      'Public-safe case study for internal tools, workflow automation, QA/SDET, platform, and data/BI automation roles',
    ],
    features: [
      {
        title: 'Decision queues',
        description:
          'Transforms raw job leads into prioritized queues with salary, location, build-depth, stability, and public-story gates.',
      },
      {
        title: 'Role packets',
        description:
          'Generates application packets, resume angles, technical refresh notes, recruiter prompts, and manual review questions.',
      },
      {
        title: 'Application surface inspection',
        description:
          'Maps application pages and form signals so a person can review what is needed before any sensitive action.',
      },
      {
        title: 'Approval boundary',
        description:
          'Automation prepares and organizes. Submissions, uploads, legal answers, account creation, messages, and scheduling stay manual.',
      },
    ],
    metrics: [
      { label: 'State', value: 'Local' },
      { label: 'Boundary', value: 'Manual' },
      { label: 'Artifacts', value: 'MD/CSV/JSON' },
    ],
    stack: ['C#/.NET', 'PowerShell', 'Markdown', 'CSV', 'JSON', 'Windows Forms', 'Edge DevTools'],
  },
  {
    id: 'gatekpt',
    name: 'musxiv Artist OS',
    tagline: 'AI studio system. Songs, clips, content packets, release plans.',
    domain: 'audio',
    status: 'in-development',
    accent: 'cyan',
    year: '2025',
    website: 'https://gatekpt.ai',
    description:
      'musxiv Artist OS is an AI-supported studio system for independent artists. It organizes song ideas, recording notes, beat and drop options, lyrics, clips, captions, content packets, brand angles, and release planning in one workflow.',
    coreIdeas: [
      'Song workspaces that keep beats, hooks, lyrics, drops, clips, and next actions together',
      'Agent-assisted options for songwriting, recording, content, branding, and release prep',
      'Content packets that turn saved song ideas into post angles, captions, clip hooks, and edit notes',
      'Recording and capture bridge direction for marking moments, snippets, takes, and release assets',
      'Artist-in-control workflow: the system prepares options without posting, sending, or deciding for the artist',
    ],
    features: [
      {
        title: 'Artist workspaces',
        description:
          'Groups beat ideas, hooks, lyrics, drops, recording notes, clip ideas, captions, and next actions by song or project.',
      },
      {
        title: 'Agent archive',
        description:
          'Saves useful outputs from music, content, brand, release, and image-prep agents so the artist can return later and choose what to use.',
      },
      {
        title: 'Content packet builder',
        description:
          'Turns a song workspace into post angles, caption drafts, clip hooks, an artist-story blurb, and one next edit without posting anything automatically.',
      },
      {
        title: 'Recording bridge direction',
        description:
          'Designed to connect content ideas to the recording surface: what to record, what to clip, what to snip, and where the asset belongs.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Artists' },
      { label: 'Workflow', value: 'Songs -> clips' },
      { label: 'Memory model', value: 'Local' },
    ],
    stack: ['C#', '.NET', 'Python', 'TypeScript', 'AI workflows', 'FFmpeg'],
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
