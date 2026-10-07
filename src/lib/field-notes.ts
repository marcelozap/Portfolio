export type FieldNote = {
  slug: string;
  number: string;
  date: string;
  title: string;
  summary: string;
  source?: string;
  image?: { src: string; alt: string; width: number; height: number };
  references?: { label: string; url: string }[];
  body: string[];
  closing?: string;
};

export const FIELD_NOTES: FieldNote[] = [
  {
    slug: 'before-i-trust-a-backtest-i-check-the-data',
    number: 'NOTE 013',
    date: '2026-09-17',
    title: 'Before I Trust a Backtest, I Check the Data',
    summary:
      'Building a small options-data check in Green Machine taught me to ask what a result can actually support before asking how much it could make.',
    source: 'Green Machine / Research Memo 006',
    references: [
      {
        label: 'Reproduced synthetic fixture results and methodology — September 17, 2026 (JSON)',
        url: '/research/options-data-quality-2026-09-17.json',
      },
    ],
    body: [
      'I trade options, and I build software. Those two parts of my work meet in a question I keep coming back to: what would make me trust this result?',
      'A backtest can produce a smooth curve and precise statistics. Before I take those numbers seriously, I need to know what went into them. Which quotes were available? Which observations are missing? What price does the simulation assume I could have traded?',
      'In Green Machine, my research software, I built a small check for options and intraday datasets. I called it the options honesty study. Its job is to flag basic problems before I move on to testing a trading idea.',
      'The first version checks whether required columns exist, whether there is enough date and row coverage under the configured thresholds, and how much of the required numerical feature data is missing. It also flags negative bids, nonpositive asks, crossed quotes where the ask is below the bid, and a high proportion of wide spreads.',
      'The spread matters because a quoted midpoint is not a guaranteed execution price. Consider a hypothetical option with a $1.00 bid and a $1.20 ask. Its midpoint is $1.10. A simulation that assumes I can buy and sell at that midpoint needs evidence for that assumption. The quote alone does not provide it.',
      'For this prototype, I defined a wide spread as more than 20% of the midpoint. If more than 15% of observations exceed that threshold, the check issues a warning. These are configurable research choices. They are not universal standards or proof that the remaining quotes are tradable.',
      'The output has three states. FAIL identifies a blocking issue under these checks. WARN allows exploratory diagnostics while calling attention to execution assumptions. PASS means only that the dataset cleared this particular screen and can move to a controlled study. It says nothing about profitability.',
      'I tested the implementation with deliberately constructed examples. A 25-date fixture with complete fields and narrow spreads passed. A version with wide spreads in every fifth quote produced a warning. A three-date fixture failed the minimum-history check. Separate tests checked missing columns, crossed quotes, and missing numerical features. All six existing tests passed when rerun for this article.',
      'These are synthetic fixtures. They demonstrate that the tested branches behave as expected. They do not validate a historical options feed, establish realistic fills, or show a trading edge. The dates are generated using weekdays rather than a full exchange calendar.',
      'Reading the implementation also makes its limits concrete. It counts distinct dates across the two input tables; it does not prove that their observations match at the same times. A row count does not establish complete strike or expiration coverage. An average missing-value rate can hide a concentrated gap in one feature. Those distinctions matter before calling a dataset ready.',
      'There is more work to do: explicit timestamp and underlying alignment, exchange-session handling, duplicate and missing-quote checks, quote-age validation, and realistic execution-cost assumptions. This version also does not verify Greeks or whether every input was actually available at the moment a simulated decision would have been made.',
      'The next experiment is to bring a real historical dataset through those checks and inspect the rejected records. After that, I can test whether a defined setup separates future outcomes, using evaluation periods that were not used to choose the rule. Performance claims come later.',
      'This is the kind of work I want XIV to document: the question, the implementation, the result, and the remaining uncertainty. Sometimes the useful result is discovering that I cannot answer the trading question yet.',
      'Neither bull nor bear. I follow the evidence and manage the risk. That starts with checking the evidence itself.',
    ],
  },
  {
    slug: 'ai-is-an-addictive-product-on-a-subscription',
    number: 'NOTE 009',
    date: '2026-09-03',
    title: 'Building AI Workflows That Can Adapt',
    summary:
      'What I am learning about usage limits, portability, and keeping AI-assisted work reviewable.',
    body: [
      'AI has become part of how I build. That makes reliability, cost, and portability practical engineering questions.',
      'In my own projects, I want to know what happens when a model is unavailable, a subscription changes, or a task uses more tokens than expected.',
      'A useful workflow needs more than a good prompt. It needs clear inputs, acceptance criteria, saved progress, and a way to review the result.',
      'I use a written project brief to describe what the system should become, what boundaries matter, and what done means. Keeping that context alongside the code helps me resume work across tools.',
      'Portability takes work. Models differ, integrations differ, and switching tools still requires validation. A shared brief helps preserve intent; it does not guarantee identical results.',
      'My next step is to make costs and failure modes easier to inspect: bounded tasks, recorded changes, and checks before accepting output.',
      'I want AI to help me move faster while keeping the work understandable to me and to anyone who may maintain it later.',
    ],
    closing: 'KEEP THE CONTEXT. CHECK THE RESULT.',
  },
  {
    slug: 'coding-beats',
    number: 'NOTE 004',
    date: '2026-08-24',
    title: 'Coding Beats',
    summary: 'A public study of rhythm written as code: patterns, motion, and measured sound.',
    source: 'MaloSound',
    body: [
      'I want to study beats that are written as code.',
      'Tools like Strudel make rhythm visible. A beat is not only an audio file. It is tempo, samples, rests, repetition, probability, filters, space, and timing written into a system.',
      'That matters because coded music can be inspected. Change one line and the beat changes. Save the pattern and the idea becomes repeatable. Compare two versions and you can hear what moved.',
      'That is the research question: what happens when a beat is treated like software and sound at the same time?',
      'The study is simple. Build small coded sketches. Document the pattern. Listen to the result. Measure the audio. Map the signal to movement or visuals.',
      'It is also a memory system. I can come back later and see the beat as code: the tempo, the rests, the drum choices, the filter shape, the space, and the pulse.',
      'Someone else can open the same sketch in Strudel, press play, and change it. That is different from posting an audio clip.',
      'The beat is not only something to hear. It is something to inspect.',
      'This is not a claim that AI understands music. It is a public study of how coded rhythm becomes measurable sound and movement.',
      'MaloSound is the public music lane for XIV. This note is the coded rhythm lane.',
      'The first sketch is a slow coded beat in Strudel: readable, playable, and changeable.',
    ],
    closing: 'The beat is not only something to hear. It is something to inspect.',
  },
];

export function getFieldNote(slug: string) {
  return FIELD_NOTES.find((note) => note.slug === slug);
}
