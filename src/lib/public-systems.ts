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
    domain: 'Options trading',
    status: 'Trading & research',
    year: '2026',
    tagline: 'Market structure. Execution. Risk.',
    description:
      'XIV is my options trading and market research initiative, focused on market structure, execution, and risk management. Originally developed as my software engineering thesis at Florida State University, it applies software and AI to research and performance analysis.',
    laneNote: 'I make every trading decision.',
    coreIdeas: [
      'Study price action across multiple timeframes.',
      'Define entry, exit, and position-risk criteria.',
      'Review trading costs, drawdowns, and decision quality.',
    ],
    features: [
      {
        title: 'Market perspective',
        description:
          'MaloSound.ai is my market journal, connecting trading, reflection, and music.',
      },
      {
        title: 'Research tools',
        description: 'Software and AI support data validation, research, and performance review.',
      },
      {
        title: 'Dragon Tape',
        description: 'A separate, free practice game with simulated prices and virtual funds.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Options' },
      { label: 'Process', value: 'Research' },
      { label: 'Discipline', value: 'Risk' },
    ],
    stack: ['Python', 'SQL', 'Data validation', 'AI-assisted research'],
    publicUrl: 'https://malosound.ai/',
  },
];

export function getPublicSystem(slug: string) {
  return PUBLIC_SYSTEMS.find((system) => system.slug === slug);
}
