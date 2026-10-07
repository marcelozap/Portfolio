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
    slug: 'automation',
    name: 'Automation & validation',
    domain: 'Software engineering',
    status: 'Professional experience',
    year: '2022–2026',
    tagline: 'Automate the work. Check the data. Test the result.',
    description:
      'At Publix Super Markets, I worked on warehouse and distribution processes, enterprise integrations, reporting workflows, and software quality. My experience includes workflow and report automation, backend data validation, manual and automated testing, and field testing for conveyor and crane systems.',
    laneNote: 'Professional experience across operational software and data workflows.',
    coreIdeas: [
      'Understand the operational process and define the expected result.',
      'Automate recurring workflows and reports with checks that can be repeated.',
      'Trace data from source records through integrations and downstream reports.',
      'Write test cases, coordinate execution, investigate failures, and document findings.',
    ],
    features: [
      {
        title: 'Workflow and report automation',
        description:
          'Power Apps and Power Automate for operational workflows, and automation around recurring reports. Power BI experience includes checking source data and reconciling reporting outputs.',
      },
      {
        title: 'Backend data validation',
        description:
          'SQL, Azure Databricks, and Azure Data Lake work to investigate missing or duplicate records, review error tables, reconcile mismatches, and check that data reaches downstream systems correctly.',
      },
      {
        title: 'Test automation and CI/CD',
        description:
          'Repeatable validation using Playwright, Selenium, Azure Pipelines, and YAML scheduling, supported by manual testing, written test cases, and failure analysis.',
      },
      {
        title: 'Warehouse field testing',
        description:
          'Test execution for conveyor and automated crane systems, including frozen-food facilities, during modernization from on-premises applications to browser-based tools.',
      },
    ],
    metrics: [
      { label: 'Workflows', value: 'Automate' },
      { label: 'Data', value: 'Validate' },
      { label: 'Software', value: 'Test' },
    ],
    stack: [
      'Power Automate',
      'Power Apps',
      'Power BI',
      'SQL',
      'Azure Databricks',
      'Azure Data Lake',
      'Azure Pipelines',
      'Playwright',
      'Selenium',
      'Python',
      'C#/.NET',
      'JavaScript/TypeScript',
      'PowerShell',
    ],
  },
  {
    slug: 'xiv',
    name: 'XIV Capital',
    domain: 'Options trading',
    status: 'Trading & research',
    year: '2026',
    tagline: 'Market structure. Execution. Risk.',
    description:
      'XIV Capital is my personal options trading and market research initiative, focused on market structure, execution, and risk management. Originally developed as my software engineering thesis at Florida State University, it applies software and AI to research and performance analysis. I trade my own capital; I do not manage client money.',
    laneNote: 'I make every trading decision.',
    coreIdeas: [
      'Study price action across multiple timeframes.',
      'Define entry, exit, and position-risk criteria.',
      'Review trading costs, drawdowns, and decision quality.',
    ],
    features: [
      {
        title: 'Research tools',
        description: 'Software and AI support data validation, research, and performance review.',
      },
      {
        title: 'Dragon Scales',
        description: 'A separate, free practice game with simulated prices and virtual funds.',
      },
    ],
    metrics: [
      { label: 'Focus', value: 'Options' },
      { label: 'Process', value: 'Research' },
      { label: 'Discipline', value: 'Risk' },
    ],
    stack: ['Python', 'SQL', 'Data validation', 'AI-assisted research'],
  },
];

export function getPublicSystem(slug: string) {
  return PUBLIC_SYSTEMS.find((system) => system.slug === slug);
}
