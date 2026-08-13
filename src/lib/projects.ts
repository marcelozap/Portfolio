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
    name: 'GATEKPT.AI',
    tagline: 'A public AI learning system for understanding how modern AI is built and used.',
    domain: 'systems',
    status: 'in-development',
    accent: 'cyan',
    year: '2026',
    website: 'https://www.gatekpt.ai',
    description:
      'GATEKPT.AI is where I organize and publish what I am learning about AI: infrastructure, data, models, prompting, evaluation, deployment, and the people and businesses around these systems.',
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
      'Green Machine is a local-first research system for turning market history, structured data, assumptions, and human-reviewed risk questions into cleaner evidence workflows.',
    coreIdeas: [
      'Market data, evidence review, backtesting notes, and risk context',
      'Market history treated as something to test, label, review, and revisit',
      'Data, notes, assumptions, risk context, and follow-up questions in one repeatable workflow',
      'AI-assisted review for assumptions, missing context, and better research questions',
      'Research software project. No recommendations, no managed accounts, no order execution.',
    ],
    features: [
      {
        title: 'Market data',
        description:
          'Structures market context, historical datasets, labels, and source notes into repeatable review flows.',
      },
      {
        title: 'Backtesting',
        description:
          'Turns research ideas into test notes, assumptions, limits, and follow-up questions for software-driven review.',
      },
      {
        title: 'Risk analysis',
        description:
          'Captures uncertainty, risk context, behavioral guardrails, and AI-assisted summaries for missed context.',
      },
      {
        title: 'AI-assisted review',
        description:
          'Uses language models to organize assumptions, identify missing context, and generate better follow-up research questions.',
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
    tagline: 'Practice memory for athletes.',
    domain: 'game',
    status: 'prototype',
    accent: 'amber',
    year: '2025',
    website: '/rally',
    description:
      'Rally is a local-first practice system for athletes: training logs, match history, recovery notes, activity data, and progress review in one place.',
    coreIdeas: [
      'Daily practice loop as the lightweight reason to return',
      'Practice memory across sessions, matches, recovery notes, and video feedback',
      'Phone-camera coaching for accessible skill improvement',
      'Explainable feedback: show the pose, timing, or rule behind each cue',
      'Local-first data model with optional account sync',
      'Activity-data direction for Garmin-style training history and recovery context',
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
          'Sessions, matches, recovery notes, video feedback, and improvement markers live together so the system can show what is actually changing.',
      },
      {
        title: 'Phone-video coaching prototype',
        description:
          'Uses normal phone-camera video to analyze practice clips, detect movement patterns, and return simple, explainable coaching cues.',
      },
      {
        title: 'Pose detection and movement analysis',
        description:
          'The first prototype focuses on tennis serve analysis: body landmarks, motion phases, confidence scoring, and one clear cue for the next session.',
      },
      {
        title: 'Activity data direction',
        description:
          'Designed to grow toward Garmin-style training history and recovery context across tennis first, then other sports and routines.',
      },
      {
        title: 'Local-first sync model',
        description:
          'SwiftData drives the on-device experience first, with optional account sync for users who want persistence across sessions.',
      },
    ],
    metrics: [
      { label: 'Mode', value: 'Practice' },
      { label: 'Platform', value: 'iOS' },
      { label: 'Prototype', value: 'Video' },
    ],
    stack: [
      'SwiftUI',
      'SpriteKit',
      'SwiftData',
      'Python',
      'OpenCV',
      'MediaPipe',
      'Activity data',
      'Garmin API direction',
      'Node.js',
    ],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
