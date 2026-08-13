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
  domain: 'markets' | 'game' | 'systems' | 'infra';
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
    name: 'GateKPT',
    tagline: 'A public AI learning system for understanding how modern AI is built and used.',
    domain: 'systems',
    status: 'in-development',
    accent: 'cyan',
    year: '2026',
    website: 'https://www.gatekpt.ai',
    description:
      'GateKPT is where I organize and publish what I am learning about AI: infrastructure, data, models, prompting, evaluation, deployment, and the people and businesses around these systems.',
    coreIdeas: [
      'Explain AI from physical infrastructure to real-world use',
      'Break complicated subjects into clear, connected lessons',
      'Treat prompting as communication and work design',
      'Treat evaluation, testing, and deployment as part of engineering',
      'Keep sources visible so ideas can be checked',
      'Turn ongoing study into useful public notes',
    ],
    features: [
      {
        title: 'AI learning map',
        description:
          'A clear path through modern AI, from power and compute to data, models, software, evaluation, and deployment.',
      },
      {
        title: 'Training',
        description:
          'Short exercises and practical examples for learning technical ideas and applying them.',
      },
      {
        title: 'Journals',
        description: 'Simple notes about what I am studying, building, and trying to understand.',
      },
      {
        title: 'Public work',
        description: 'A visible record of my learning, research, and progress over time.',
      },
    ],
    metrics: [
      { label: 'Mode', value: 'Learning system' },
      { label: 'Content', value: 'Lessons' },
      { label: 'Focus', value: 'AI + data' },
    ],
    stack: ['Next.js', 'TypeScript', 'AI systems', 'Research', 'Prompting', 'Evaluation'],
  },
  {
    id: 'fsu-options-research',
    name: 'Green Machine',
    tagline: 'A research data system for evidence review, backtesting notes, and risk context.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2026',
    website: '/fsu-options-research',
    description:
      'Green Machine is a software engineering case study for structuring market data, historical context, backtesting notes, assumptions, and risk review into repeatable research workflows.',
    coreIdeas: [
      'Market data, historical context, labels, and repeatable review flows',
      'Backtesting notes that separate evidence, assumptions, uncertainty, and intuition',
      'Interfaces for reading context, results, and risk without noise',
      'AI-assisted review for assumptions, missing data, and next questions',
      'Clear boundary: no recommendations, managed accounts, or order execution',
    ],
    features: [
      {
        title: 'Market data',
        description:
          'Organizes market context, historical data, labels, and source notes into repeatable software workflows.',
      },
      {
        title: 'Backtesting and evidence',
        description:
          'Converts research ideas into reproducible notes, test reviews, assumptions, limits, and follow-up questions.',
      },
      {
        title: 'Technical stack',
        description:
          'Built around Python, FastAPI, React, SQL-style storage, tested workflows, and AI-assisted review.',
      },
      {
        title: 'Boundary',
        description:
          'A software engineering research project, not a recommendation or execution tool.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Markets' },
      { label: 'Method', value: 'Backtests' },
      { label: 'Boundary', value: 'No execution' },
    ],
    stack: ['Python', 'FastAPI', 'React', 'SQL', 'Backtesting', 'Risk analysis'],
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
