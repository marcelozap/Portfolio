export const RESEARCH_ROLES = [
  {
    id: 'research',
    name: 'Research Analyst',
    action: 'Prepare my watchlist',
    note: 'Catalysts, filings and counterevidence.',
    available: true,
    question:
      '[Research Analyst] Prepare my watchlist: SPY, TSLA, NVDA, AMD, AMZN, META and Alphabet (keep GOOG and GOOGL separate). Check upcoming events, company filings and evidence against each idea. Give me a short dated brief with primary sources and gaps. Leave SPCX unresolved until its identity is confirmed.',
  },
  {
    id: 'quant',
    name: 'Quant Agent',
    action: 'Check the numbers',
    note: 'Public-company math. Private trade history awaits connection.',
    available: true,
    question:
      '[Quant Agent · public research] Compare revenue growth, margins, cash flow and valuation for TSLA, NVDA, AMD, AMZN, META and Alphabet using current public filings. Show inputs, dates, units, formulas and missing data. Keep GOOG and GOOGL separate. Do not use or infer my private trade history, win rate or comparable setups.',
  },
  {
    id: 'journal',
    name: 'Journal Coach',
    action: 'Needs journal connection',
    note: 'Selected journal evidence is not connected yet.',
    available: false,
    question: null,
  },
  {
    id: 'big-money',
    name: 'Big Money Agent',
    action: 'Follow the filings',
    note: 'Politician disclosures and fund holdings. Delayed public filings.',
    available: true,
    question:
      '[Big Money] Check recent US politician disclosures, including Pelosi household reports, and institutional fund filings relevant to SPY, TSLA, NVDA, AMD, AMZN, META and Alphabet. Show filer and owner, trade or holdings-period dates, filing dates, sizes, primary sources and coverage gaps. Preserve amount ranges; unknowns stay unknown. Keep GOOG and GOOGL separate; SPCX is unresolved. Distinguish transactions from holdings snapshots. Handle amendments without double counting; reported option value is not premium spent. Do not infer current money flows or total exposure. Highlight newly filed records; label older context clearly.',
  },
] as const;

export type ResearchRoleId = (typeof RESEARCH_ROLES)[number]['id'];

export function researchRole(id: unknown) {
  return RESEARCH_ROLES.find((role) => role.id === id) ?? null;
}

/** Starters are editable questions, never permissions or a new worker identity. */
export function prepareRoleQuestion(
  draft: { question: string; pending: unknown },
  roleId: unknown,
): string {
  const role = researchRole(roleId);
  if (!role) throw new Error('Choose a research role.');
  if (!role.available || !role.question) throw new Error(role.note);
  if (draft.pending) throw new Error('Check the pending request before starting another.');
  const isStarter = RESEARCH_ROLES.some((candidate) => candidate.question === draft.question);
  if (draft.question.trim() && !isStarter)
    throw new Error('Your draft is kept. Clear it before choosing a starter.');
  return role.question;
}
