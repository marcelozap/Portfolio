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
    tagline: 'An options-practice game. An independent research process.',
    description:
      'XIV is my options-practice product in development: fictional price action, simulated funds, manually advanced sessions, and a journal for reviewing decisions. A separate analysis desk supports my market research.',
    laneNote: 'Practice decisions. Test a theory. Review the reasoning.',
    coreIdeas: [
      'Fictional prices and simulated funds, with no live orders in the practice game',
      'Manual advancement so practice fits around time away from the screen',
      'Fourteen levels in each planned calendar-month collection',
      'Journaling and review focused on decisions and lessons',
      'Separate research agents for thesis drafts, quantitative context, and post-trade review',
    ],
    features: [
      {
        title: 'The practice game',
        description:
          'Local implementation covers options scenarios, orders, simulated accounting, journals, and reviews. The member product remains in development.',
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
        title: 'Planned access',
        description:
          'USD 114 initially includes USD 100 access plus the first USD 14 monthly period. Continued gameplay requires USD 14/month thereafter. Checkout remains test-only; this website does not accept payment.',
      },
    ],
    metrics: [
      { label: 'Mode', value: 'Simulation' },
      { label: 'Product', value: 'In development' },
      { label: 'Billing', value: 'Test only' },
    ],
    stack: ['JavaScript', 'Node.js', 'SQLite', 'Python', 'Automated tests'],
  },
];

export function getPublicSystem(slug: string) {
  return PUBLIC_SYSTEMS.find((system) => system.slug === slug);
}
