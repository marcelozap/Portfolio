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
    id: 'green-machine',
    name: 'Green Machine',
    tagline: 'A public systems map for AI, data, workflows, and research.',
    domain: 'systems',
    status: 'in-development',
    accent: 'cyan',
    year: '2026',
    website: 'https://gatekpt.ai',
    description:
      'Green Machine is the public systems lane: a place where AI study notes, workflow tools, research maps, sourced anchors, and validation habits turn into inspectable artifacts.',
    coreIdeas: [
      'A public map of how I understand AI, data, and workflow systems',
      'One layer at a time instead of a generic content wall',
      'Prompting treated as professional communication, not magic phrasing',
      'Evaluation and deployment treated as first-class engineering constraints',
      'Source links kept visible so claims can be checked',
    ],
    features: [
      {
        title: 'AI stack map',
        description:
          'Breaks AI into practical layers: power and site, compute, data, models, applications, evaluation, and deployment.',
      },
      {
        title: 'Workflow instrument',
        description:
          'Uses focused screens, recall checks, source links, and review gates instead of broad promises.',
      },
      {
        title: 'Research memory',
        description:
          'Connects technical foundations with market context, infrastructure economics, and deployment constraints.',
      },
      {
        title: 'Public build loop',
        description:
          'Turns private study and local tools into visible artifacts that can improve as the field changes.',
      },
    ],
    metrics: [
      { label: 'Mode', value: 'Systems map' },
      { label: 'Output', value: 'Artifacts' },
      { label: 'Focus', value: 'AI + data' },
    ],
    stack: ['Next.js', 'TypeScript', 'AI systems', 'Research', 'Prompting', 'Evaluation'],
  },
  {
    id: 'fsu-options-research',
    name: 'FSU Options Research',
    tagline: 'Software engineering research project for options market data and risk analysis.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2026',
    website: '/fsu-options-research',
    description:
      'Florida State University software engineering research project focused on options market data, analysis, backtesting, and risk analysis.',
    coreIdeas: [
      'Options market data, historical context, labels, and repeatable review flows',
      'Backtesting notes that separate evidence, assumptions, uncertainty, and intuition',
      'Interfaces for reading context, results, and risk without noise',
      'AI-assisted review for assumptions, missing data, and next questions',
      'Clear boundary: no recommendations, managed accounts, or order execution',
    ],
    features: [
      {
        title: 'Market data',
        description:
          'Organizes options market context, historical data, labels, and source notes into repeatable software workflows.',
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
