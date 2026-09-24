/** Deterministic transcript proposals. No recognition, network, or execution runs here. */
const TICKERS = Object.freeze(['SPY', 'TSLA', 'NVDA', 'AMD', 'AMZN', 'META', 'GOOGL', 'GOOG']);
const DIRECTIONS = new Set([null, 'long_call', 'long_put']);
const KINDS = new Set(['thought', 'research', 'review']);
const NUMBER = String.raw`(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]+)?`;
const VALUE = String.raw`\$?${NUMBER}(?:\s*(?:[-–—]|to|through|and)\s*\$?${NUMBER})?`;
const NEGATION =
  /\b(?:no|not|never|neither|without|avoid|against|cannot|can['’]?t|don['’]?t|doesn['’]?t|didn['’]?t|won['’]?t|wouldn['’]?t|isn['’]?t|aren['’]?t)\b/i;

function requireText(value, label, maximum = 20000) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    throw new TypeError(`${label} must be nonempty text, at most ${maximum} characters.`);
  }
  return value;
}

function requireDate(value) {
  if (
    typeof value !== 'string' ||
    !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) ||
    value.startsWith('0000')
  ) {
    throw new TypeError('Provide an explicit ISO calendar date.');
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new TypeError('Provide a valid ISO calendar date.');
  }
  return value;
}

function explicitLevel(text, labelPattern, field, warnings, negated) {
  const pattern = new RegExp(
    String.raw`\b(?:${labelPattern})\s*(?:(?:at|around|is)\s+)?[:=]?\s*(${VALUE})(?![\p{L}\p{N}_]|[.,][0-9])`,
    'giu',
  );
  const matches = [...text.matchAll(pattern)];
  if (!matches.length) return null;
  if (negated) {
    warnings.push(`Negated wording leaves ${field} unresolved.`);
    return null;
  }
  // A malformed range must not silently collapse to its first price.
  if (
    matches.some((match) =>
      /^\s*(?:[-–—]|to\b|through\b)/i.test(text.slice(match.index + match[0].length)),
    )
  ) {
    warnings.push(`Incomplete ${field} range needs confirmation and correction.`);
    return null;
  }
  const values = [...new Set(matches.map((match) => match[1]))];
  if (values.length !== 1) {
    warnings.push(`Multiple ${field} values are unresolved.`);
    return null;
  }
  return values[0];
}

/** Preserve raw speech and propose only explicit facts; caller supplies the date. */
export function parseUtterance(raw, contextDate) {
  requireText(raw, 'Transcript');
  requireDate(contextDate);
  let text = raw.replace(/[’‘]/g, "'");
  for (const ticker of TICKERS) {
    const spoken = new RegExp(`\\b${ticker.split('').join('[\\s.]+')}\\b`, 'gi');
    text = text.replace(spoken, ticker);
  }
  const tokens = text.toUpperCase().split(/[^\p{L}\p{N}_]+/u);
  const symbols = [...new Set(tokens.filter((token) => TICKERS.includes(token)))];
  const warnings = [];
  if (
    /\b(?:google|alphabet)\b/i.test(text) &&
    !symbols.some((symbol) => symbol === 'GOOG' || symbol === 'GOOGL')
  ) {
    warnings.push('Google share class is unresolved; choose GOOGL or GOOG explicitly.');
  }
  if (/\bSPCX\b/i.test(text)) {
    warnings.push('SPCX is unresolved; no listed ticker has been inferred.');
  }
  const calls = /\b(?:calls|call\s+options|long[ -]+calls?)\b/i.test(text);
  const puts = /\b(?:puts|put\s+options|long[ -]+puts?)\b/i.test(text);
  const negated = NEGATION.test(text);
  let direction = null;
  if (calls && puts) warnings.push('Both calls and puts were mentioned; direction is unresolved.');
  else if (calls || puts) {
    if (negated) warnings.push('Negated wording leaves direction unresolved.');
    else if (
      /\b(?:earnings|conference|phone|telephone|video|zoom|margin|analyst)\s+calls?\b|\bputs\s+(?:the|this|that|a|an|it|them|away)\b/i.test(
        text,
      )
    ) {
      warnings.push(
        'Calls or puts may describe something other than options; direction is unresolved.',
      );
    } else if (/\b(?:short|sell|selling|sold|write|writing|written)\b/i.test(text)) {
      warnings.push(
        'Selling or short-option wording is unresolved; no long direction has been inferred.',
      );
    } else if (
      /\b(?:maybe|perhaps|might|could|undecided|unsure)\b/i.test(text) ||
      text.includes('?')
    ) {
      warnings.push('Uncertain wording leaves direction unresolved.');
    } else direction = calls ? 'long_call' : 'long_put';
  }
  const entry_zone = explicitLevel(
    text,
    'entry(?:\\s+zone)?|enter\\s+at',
    'entry zone',
    warnings,
    negated,
  );
  const invalidation = explicitLevel(
    text,
    'invalidation|invalidate\\s+at|stop(?:[ -]+loss)?',
    'invalidation',
    warnings,
    negated,
  );
  const kind = /\b(?:review|journal|lesson|closed|yesterday|retrospective|sold)\b/i.test(text)
    ? 'review'
    : /\b(?:research|earnings|valuation|filing|investigate|analyze|analyse|watch|catalyst)\b/i.test(
          text,
        )
      ? 'research'
      : 'thought';
  return {
    raw,
    title: raw.trim().replace(/\s+/g, ' ').slice(0, 120),
    symbols,
    direction,
    entry_zone,
    invalidation,
    kind,
    date_context: contextDate,
    needs_confirmation: true,
    warnings,
  };
}

/** Capability check only: never instantiate recognition or request microphone access. */
export function supportsSpeechRecognition(windowLike) {
  return Boolean(
    windowLike &&
    (typeof windowLike.SpeechRecognition === 'function' ||
      typeof windowLike.webkitSpeechRecognition === 'function'),
  );
}

/** UI must explicitly confirm the proposal first; this is not trade authorization. */
export function buildDraftInput(proposal) {
  if (
    !proposal ||
    typeof proposal !== 'object' ||
    Array.isArray(proposal) ||
    proposal.needs_confirmation !== false
  ) {
    throw new TypeError('Explicit user confirmation is required before preparing runner input.');
  }
  requireText(proposal.raw, 'Transcript');
  requireText(proposal.title, 'Title', 200);
  requireDate(proposal.date_context);
  if (
    !Array.isArray(proposal.symbols) ||
    proposal.symbols.some((symbol) => !TICKERS.includes(symbol)) ||
    new Set(proposal.symbols).size !== proposal.symbols.length ||
    !DIRECTIONS.has(proposal.direction) ||
    !KINDS.has(proposal.kind)
  ) {
    throw new TypeError('Invalid confirmed proposal fields.');
  }
  for (const field of ['entry_zone', 'invalidation']) {
    if (proposal[field] !== null) requireText(proposal[field], field, 200);
  }
  return {
    instrument: proposal.symbols.length ? proposal.symbols.join(', ') : proposal.title,
    notes: proposal.raw,
    sources: [],
    direction: proposal.direction ?? '',
    entry_zone: proposal.entry_zone ?? '',
    invalidation: proposal.invalidation ?? '',
  };
}
