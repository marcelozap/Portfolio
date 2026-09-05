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
    domain: 'trading',
    status: 'in development',
    year: '2026',
    tagline: 'A personal trading and research workbench.',
    description:
      'XIV is where I study markets, test theories, and build tools for my own research. My work includes analysis agents and an options-practice experiment with fictional prices, simulated funds, and a journal for reviewing decisions.',
    laneNote: 'Study the market. Test an idea. Review the reasoning.',
    coreIdeas: [
      'Fictional prices and simulated funds, with no live orders in the practice game',
      'Manual advancement so practice fits around time away from the screen',
      'Journaling and review focused on decisions and lessons',
      'Market theories explored through evidence and repeatable analysis',
      'Separate research agents for thesis drafts, quantitative context, and post-trade review',
    ],
    features: [
      {
        title: 'The practice experiment',
        description:
          'I am developing a personal options-practice game with fictional scenarios, simulated accounting, journals, and reviews. Sessions advance manually so I can examine each decision.',
      },
      {
        title: 'The research',
        description:
          'Momentum, changing market regimes, and risk budgeting are questions for testing, not claims of a proven edge.',
      },
      {
        title: 'The analysis agents',
        description:
          'Research Analyst, Quant Agent, and Journal Coach provide drafts and context for human review. This research workflow is separate from the game simulation.',
      },
      {
        title: 'The engineering',
        description:
          'Data workflows, automated tests, and AI tools help me make research repeatable and keep the reasoning open to review.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Personal research' },
      { label: 'Practice', value: 'Simulation' },
      { label: 'Workflow', value: 'Human review' },
    ],
    stack: ['JavaScript', 'Node.js', 'SQLite', 'Python', 'Automated tests'],
  },
];

export function getPublicSystem(slug: string) {
  return PUBLIC_SYSTEMS.find((system) => system.slug === slug);
}
