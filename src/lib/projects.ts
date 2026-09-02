/**
 * Project catalog rendered by the projects grid + modal.
 * Strongly typed so we get autocomplete and safe refactors.
 */

export type ProjectStatus = 'in-development' | 'prototype' | 'research' | 'computer-vision';

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
    id: 'ai-workflow-systems',
    name: 'role-systems',
    tagline: 'Public repo for role-based AI infrastructure, starting with creator systems.',
    domain: 'infra',
    status: 'in-development',
    accent: 'violet',
    year: '2026',
    website: 'https://github.com/marcelozap/role-systems',
    description:
      'A public GitHub repo for role-based AI infrastructure: one shared core, different systems for different jobs. The first built package is a creator system that turns messy music folders into structured song data.',
    coreIdeas: [
      'One repo, not five: the shared spine lives in core/ and role packages live under roles/',
      'Creator systems are built; QA systems are designed; marketing, teaching, and commerce are planned',
      'Truth lives in roles.json so built, designed, and planned work cannot drift quietly',
      'Public examples stay synthetic or derived-safe; raw audio, private paths, and embeddings stay local',
      'The first creator package groups bounces, stems, and practice captures into stable song IDs',
    ],
    features: [
      {
        title: 'Creator system',
        description:
          'Scans a local catalog and groups audio/video files into stable songs with stage, ownership, and release-readiness fields.',
      },
      {
        title: 'Stable song IDs',
        description:
          'Files are not songs. Twelve bounces of one track are one song, and that grouping is required for honest ML evaluation.',
      },
      {
        title: 'Public safety',
        description:
          'The repo ignores raw audio, real catalog files, private paths, embeddings, and local model artifacts by default.',
      },
      {
        title: 'Validation',
        description:
          'Tests cover two label-corruption bugs: underscore-named masters and tempo tokens that could split one song into two.',
      },
    ],
    metrics: [
      { label: 'Repo', value: 'Public' },
      { label: 'Built', value: 'Creator' },
      { label: 'Tests', value: '5' },
    ],
    stack: ['Python', 'JSON Schema', 'pytest', 'Ruff', 'GitHub Actions', 'Creator systems'],
  },
  {
    id: 'gatekpt',
    name: 'GATEKPT.AI',
    tagline: 'A public lab for making AI, signal, music, and motion systems visible.',
    domain: 'systems',
    status: 'in-development',
    accent: 'cyan',
    year: '2026',
    description:
      'GateKPT.ai is the public research lab for AI systems, notes, signal analysis, visual interfaces, and technical thinking. It stays separate from the business-facing trust surface on marcelozapata.dev.',
    coreIdeas: [
      'Show the transformation from input to features to mapping to output',
      'Use public-safe derived data instead of raw private creative files',
      'Keep the writing and demo connected to the same system thesis',
      'Make machine learning claims visible, modest, and checkable',
      'Keep creative technology as a technical proof lane, not the main business offer',
    ],
    features: [
      {
        title: 'Signal-to-interface demo',
        description:
          'Music analysis data drives a visual body in the browser so the pipeline can be seen instead of only described.',
      },
      {
        title: 'Public notes',
        description:
          'Short writing connects the demo to AI systems, workflow design, music technology, and measured artifacts.',
      },
      {
        title: 'Proof surface',
        description:
          'The site stays small, public-safe, and direct: show the system, then let the work explain itself.',
      },
      {
        title: 'Boundary',
        description:
          'Raw audio, local paths, embedding matrices, private notes, and unreleased material stay private.',
      },
    ],
    metrics: [
      { label: 'Mode', value: 'Lab' },
      { label: 'Data', value: 'Derived' },
      { label: 'Focus', value: 'Signal' },
    ],
    stack: ['Next.js', 'TypeScript', 'Signal analysis', 'AI systems', 'Public notes', 'Schema'],
  },
  {
    id: 'rally',
    name: 'RALLY',
    tagline: 'Practice memory for athletes.',
    domain: 'game',
    status: 'computer-vision',
    accent: 'amber',
    year: 'active build 2026',
    website: '/rally',
    description:
      "An iOS practice log with a computer-vision engine underneath. Phone video goes in; pose estimation, adaptive filtering and swing segmentation come out as measured movement — logged against every prior session.\n\nThe design rule is that it reports what changed, never what is wrong. Diagnosis is someone else's licence. When the footage can't support a number, the honest output is 'not usable'.",
    coreIdeas: [
      'Daily practice loop as the lightweight reason to return',
      'Practice memory across sessions, matches, recovery notes, and video feedback',
      'Phone-camera coaching for accessible skill improvement',
      'Explainable feedback: show the pose, timing, or rule behind each cue',
      'Local-first data model with optional account sync',
      'Activity-data direction for Garmin-style training history and recovery context',
      'Tennis first. The measurements are mechanical, not sport-specific.',
      'Engine in calibration.',
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
      { label: 'Platform', value: 'iOS + Python' },
      { label: 'Pose', value: 'Engine' },
    ],
    stack: [
      'SwiftUI',
      'SpriteKit',
      'SwiftData',
      'Python',
      'MediaPipe',
      'OpenCV',
      'Computer Vision',
      'Signal Processing',
      'NumPy',
    ],
  },
];

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);
