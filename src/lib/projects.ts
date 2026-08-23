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
    id: 'green-machine',
    name: 'Green Machine',
    tagline: 'Bilingual market education. Daily snapshots, paper practice, risk-first review.',
    domain: 'markets',
    status: 'in-development',
    accent: 'green',
    year: '2026',
    website: '/green-machine',
    description:
      'Green Machine is a bilingual market education and research-software project. The public layer teaches market weather, key levels, paper practice, and risk-first review while the engineering layer shows Python/FastAPI research workflows.',
    coreIdeas: [
      'Daily market snapshot wrapper for weather, levels, lesson, paper exercise, and no-trade conditions',
      'Bilingual English/Spanish framing for families and beginner learners',
      'Backtesting notes and research memos that separate evidence from intuition',
      'AI-assisted review for assumptions, missing context, and next questions',
      'Clear boundary: no recommendations, managed accounts, order execution, or copy-trading',
    ],
    features: [
      {
        title: 'Daily snapshot',
        description:
          'Turns market weather, SPY/QQQ context, volatility, key levels, and a beginner lesson into a repeatable public learning wrapper.',
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
        title: 'Boundary',
        description:
          'Not recommendations, not managed accounts, not order execution, not copy-trading, and not a signal service.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Education' },
      { label: 'Method', value: 'Paper practice' },
      { label: 'Boundary', value: 'No signals' },
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
