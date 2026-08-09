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
    tagline: 'A public map for studying the modern AI stack end to end.',
    domain: 'systems',
    status: 'in-development',
    accent: 'cyan',
    year: '2026',
    website: 'https://gatekpt.ai',
    description:
      'GateKPT is my public research hub for organizing years of notes, diagrams, projects, and instincts into a structured map of AI infrastructure, data, models, prompting, evaluation, deployment, and business context.',
    coreIdeas: [
      'A public map of how I understand AI systems across the full stack',
      'Research notes shaped into focused lessons, weekly briefs, and system explainers',
      'Prompting treated as professional communication, not magic phrasing',
      'AI deployment framed through evaluation, observability, privacy, and adoption constraints',
      'A public accountability system for staying current with fast-moving AI technology',
    ],
    features: [
      {
        title: 'AI stack map',
        description:
          'Breaks AI into practical layers: power and site, compute, data, models, applications, evaluation, and deployment.',
      },
      {
        title: 'Learning instrument',
        description:
          'Uses short focused screens, recall checks, and sourced anchors instead of a wall of generic content.',
      },
      {
        title: 'Research discipline',
        description:
          'Connects technical foundations with market context, infrastructure economics, and real deployment constraints.',
      },
      {
        title: 'Public growth loop',
        description:
          'Turns private study into a visible system that can improve as the field changes.',
      },
    ],
    metrics: [
      { label: 'Layers', value: '7' },
      { label: 'Mode', value: 'Public map' },
      { label: 'Focus', value: 'AI systems' },
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
  {
    id: 'ai-workflow-systems',
    name: 'AI Workflow Systems',
    tagline: 'Approval-gated automation for data, QA, and internal software workflows.',
    domain: 'systems',
    status: 'in-development',
    accent: 'violet',
    year: '2026',
    description:
      'AI Workflow Systems is a set of local-first software experiments for turning messy work into reviewable plans, structured records, validation checks, and human-approved actions.',
    coreIdeas: [
      'Human-in-the-loop workflows where AI drafts, checks, and organizes instead of acting silently',
      'Structured notes, task records, and repeatable review loops for real operational work',
      'QA and validation habits carried into AI-assisted software delivery',
      'Local-first architecture for private context, auditability, and safe iteration',
    ],
    features: [
      {
        title: 'Workflow capture',
        description:
          'Converts loose notes, files, and decisions into structured records that are easier to search, review, and hand off.',
      },
      {
        title: 'Approval gates',
        description:
          'Keeps important actions behind clear review steps so automation supports judgment instead of replacing it.',
      },
      {
        title: 'Validation layer',
        description:
          'Pairs AI-assisted work with tests, checklists, logs, and explicit acceptance criteria.',
      },
      {
        title: 'System memory',
        description:
          'Keeps project context, decisions, follow-ups, and reusable patterns in one practical loop.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'AI systems' },
      { label: 'Mode', value: 'Review' },
      { label: 'Output', value: 'Records' },
    ],
    stack: ['TypeScript', 'React', 'Python', 'C#', 'PowerShell', 'Playwright', 'AI workflows'],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
