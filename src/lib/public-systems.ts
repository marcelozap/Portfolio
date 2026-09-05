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
    domain: 'dragon',
    status: 'active build',
    year: '2026',
    tagline: 'I am the dragon.',
    description:
      'Everyone is a bear or a bull. I am the dragon. XIV is the world I am building around that identity: markets and research, music and movement, code and writing.',
    laneNote: 'Markets, research, music, movement, code, and writing.',
    coreIdeas: [
      'The dragon is my identity inside XIV',
      'Markets and research as a practice of observation, interpretation, and discipline',
      'Original music and movement as ways to make the work felt',
      'Code and shared session state connecting sound, motion, and visual experiments',
      'Public writing and inspectable artifacts that show what is actually built',
    ],
    features: [
      {
        title: 'Markets and research',
        description:
          'Market movement is material for study: data, interpretation, and the practice of forming a view.',
      },
      {
        title: 'Music and movement',
        description:
          'MaloSound carries the music. Rally studies movement. Both give XIV a connection to sound, rhythm, and physical practice.',
      },
      {
        title: 'Code and experiments',
        description:
          'Software experiments connect audio, motion, visual output, and session evidence.',
      },
      {
        title: 'Writing and evidence',
        description:
          'Public notes and project artifacts make the thinking visible and keep the vision connected to what has been built.',
      },
    ],
    metrics: [
      { label: 'Identity', value: 'Dragon' },
      { label: 'Practice', value: 'Art + research' },
      { label: 'Status', value: 'In development' },
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
