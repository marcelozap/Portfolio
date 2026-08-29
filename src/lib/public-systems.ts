export type PublicSystem = {
  slug: string;
  name: string;
  domain: string;
  status: string;
  year: string;
  tagline: string;
  description: string;
  laneNote: string;
  coreIdeas: string[];
  features: { title: string; description: string }[];
  metrics: { label: string; value: string }[];
  stack: string[];
  publicUrl?: string;
};

export const PUBLIC_SYSTEMS: PublicSystem[] = [
  {
    slug: 'xiv',
    name: 'XIV',
    domain: 'orchestration',
    status: 'active build',
    year: '2026',
    tagline: 'A personal command system for AI research, creative work, movement, and execution.',
    description:
      'XIV is the layer that connects the work. It turns messy inputs into structured sessions, connects specialist analysis, and keeps decisions, evidence, and outputs on one timeline. Its current research surface combines audio and movement for live visual systems.',
    laneNote: 'Shared state, specialist analysis, and multimodal experiments.',
    coreIdeas: [
      'One state model connecting audio, movement, visual output, and session evidence',
      'Specialist analysis lanes that produce structured events instead of opaque answers',
      'Local-first experiments designed to run on a home PC as well as a public web surface',
      'Open adapters for dance, tennis, golf, swimming, and running',
      'Receipts and evaluation alongside the creative experience',
    ],
    features: [
      {
        title: 'Shared timeline',
        description:
          'Audio and movement meet on one timestamped timeline so synchronization can be measured rather than implied.',
      },
      {
        title: 'Role-based analysis',
        description:
          'MaloSound understands the music, the movement lane reads the body, and XIV explains the result.',
      },
      {
        title: 'Visual skins',
        description:
          'A rhythm tunnel and character surface can change without rewriting the underlying session state.',
      },
      {
        title: 'Honest model boundary',
        description:
          'The project distinguishes working baselines, pretrained components, and genuinely trained models.',
      },
    ],
    metrics: [
      { label: 'Core', value: 'State' },
      { label: 'Inputs', value: 'Audio + motion' },
      { label: 'Mode', value: 'Local-first' },
    ],
    stack: ['TypeScript', 'Python', 'Pose', 'Audio ML', 'JSON', 'WebGL'],
  },
  {
    slug: 'malosound',
    name: 'MaloSound',
    domain: 'music',
    status: 'active build',
    year: '2025',
    tagline:
      'Music and audio-visual research where coded rhythm becomes signal, movement, and release material.',
    description:
      'MaloSound is the music lane inside the wider XIV system. It treats songs as both creative work and structured signal: beats, energy, embeddings, movement, visuals, and the practical work of releasing music.',
    laneNote: 'Original music, audio analysis, performance visuals, and release work.',
    coreIdeas: [
      'Original music and artist-tech infrastructure kept on one timeline',
      'Audio analysis that can be inspected, searched, and connected to visual output',
      'Coded rhythm sketches that make timing and pattern visible',
      'Performance visuals designed for real music, not generic dashboards',
      'Local artifacts and provenance before model claims',
    ],
    features: [
      {
        title: 'Sound into signal',
        description:
          'Beat, onset, energy, spectral, and embedding outputs give the rest of the system something measurable to use.',
      },
      {
        title: 'Coded rhythm',
        description:
          'Patterns can be saved, changed, replayed, and inspected as code rather than disappearing into a finished audio file.',
      },
      {
        title: 'Performance visuals',
        description:
          'Music energy can drive brightness, rhythmic density can drive pulse count, and movement can drive character heat.',
      },
      {
        title: 'Release context',
        description:
          'The creative system also keeps ownership, publishing materials, and release decisions visible.',
      },
    ],
    metrics: [
      { label: 'Lane', value: 'Music' },
      { label: 'Input', value: 'Audio' },
      { label: 'Output', value: 'Signal + art' },
    ],
    stack: ['Python', 'CLAP', 'Audio ML', 'Strudel', 'Web Audio', 'Visuals'],
    publicUrl: 'https://malosound.ai',
  },
  {
    slug: 'green-machine',
    name: 'Green Machine',
    domain: 'evidence',
    status: 'active build',
    year: '2026',
    tagline: 'Data, research, and risk review made visible enough to question.',
    description:
      'Green Machine is the data and evidence lane. It turns market and operational inputs into repeatable snapshots, research notes, and reviewable outputs while keeping uncertainty and boundaries visible.',
    laneNote: 'Data pipelines, evidence review, and risk-aware research.',
    coreIdeas: [
      'Repeatable data snapshots instead of unexplained conclusions',
      'Backtesting notes that separate evidence from intuition',
      'AI-assisted review for assumptions, missing context, and next questions',
      'Clear boundaries around advice, execution, and unsupported confidence',
    ],
    features: [
      {
        title: 'Data spine',
        description:
          'Structured inputs, provenance, and reproducible outputs make research easier to inspect.',
      },
      {
        title: 'Risk review',
        description:
          'The system keeps uncertainty, assumptions, and no-action conditions in the same frame as the result.',
      },
      {
        title: 'Learning wrapper',
        description:
          'Complex research is organized into a format that a beginner can follow and question.',
      },
      {
        title: 'Public boundary',
        description:
          'The public surface is education and research software, not recommendations or a signal service.',
      },
    ],
    metrics: [
      { label: 'Lane', value: 'Data' },
      { label: 'Method', value: 'Review' },
      { label: 'Boundary', value: 'Visible' },
    ],
    stack: ['Python', 'FastAPI', 'SQL', 'Backtesting', 'Risk review', 'Reports'],
  },
  {
    slug: 'rally',
    name: 'Rally',
    domain: 'movement',
    status: 'computer vision',
    year: '2026',
    tagline: 'Practice memory for athletes, starting with tennis and phone-camera movement.',
    description:
      'Rally is a movement and practice system. Phone video goes in; pose estimation, adaptive filtering, and movement segments come out as measured practice memory. The design rule is simple: report what changed, never what is wrong.',
    laneNote: 'Tennis, training, computer vision, and activity data.',
    coreIdeas: [
      'Short daily practice loop with memory across sessions',
      'Phone-camera analysis for accessible skill feedback',
      'Explainable cues tied to a pose, timing, or rule',
      'A refusal such as not usable is better than invented precision',
      'Tennis first, with mechanical measurements that can extend to other movement',
    ],
    features: [
      {
        title: 'Practice memory',
        description:
          'Sessions, matches, recovery notes, and video feedback live together so improvement can be seen over time.',
      },
      {
        title: 'Movement analysis',
        description:
          'Pose landmarks, motion phases, and confidence gates turn phone video into measured movement.',
      },
      {
        title: 'Explainable feedback',
        description:
          'Each cue should show the timing, pose, or rule behind it instead of hiding behind a score.',
      },
      {
        title: 'Open activity layer',
        description:
          'The model stays open for future links to training history and recovery context.',
      },
    ],
    metrics: [
      { label: 'Lane', value: 'Movement' },
      { label: 'Input', value: 'Phone video' },
      { label: 'Mode', value: 'Calibration' },
    ],
    stack: ['SwiftUI', 'Python', 'MediaPipe', 'OpenCV', 'Signal processing', 'NumPy'],
  },
];

export function getPublicSystem(slug: string) {
  return PUBLIC_SYSTEMS.find((system) => system.slug === slug);
}
