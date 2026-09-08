import { DeskError, exact, text, uuidPattern } from './contracts';

export const RESEARCH_PAGE_SIZE = 20;
export const RESEARCH_MAX_OFFSET = 1000000;
export const researchStatuses = ['queued', 'running', 'completed', 'blocked', 'cancelled'] as const;
export type ResearchStatus = (typeof researchStatuses)[number];
export type ResearchSource = { url: string; title: string; retrieved_at: string };
export type ResearchResult = { text: string; sources: ResearchSource[]; limitations: string };
export type ResearchTaskSummary = {
  id: string;
  question: string;
  scope: 'public_primary_sources';
  role: 'research_analyst';
  version: number;
  status: ResearchStatus;
  created_at: string;
  updated_at: string;
  worker_session: string | null;
  claimed_at: string | null;
  lease_expires_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  cancel_reason: string | null;
};
export type ResearchTask = ResearchTaskSummary & { result: ResearchResult | null };

// Owner is selected for an additional server check and never included in public output.
export const researchSummaryColumns =
  'owner_id,id,question,scope,role,version,status,created_at,updated_at,worker_session,claimed_at,lease_expires_at,completed_at,blocked_reason,cancel_reason';

const unavailable = () => new DeskError(503, 'Research storage is unavailable. Try again.');
const sessionPattern = /^(codex|claude):[A-Za-z0-9_-]{8,128}$/;
const sourceUrlPattern =
  /^https:\/\/([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(:[0-9]{1,5})?([/?#]([A-Za-z0-9._~!$&'()*+,;=:@/?#-]|%[0-9A-Fa-f]{2})*)?$/;

// JavaScript's $ can match before a final newline; require the complete value.
const matches = (pattern: RegExp, value: string) => pattern.exec(value)?.[0] === value;
export function isResearchId(value: unknown): value is string {
  return typeof value === 'string' && value.length === 36 && matches(uuidPattern, value);
}
export function researchId(value: unknown): string {
  if (!isResearchId(value)) throw new DeskError(400, 'A valid research task identity is required.');
  return value;
}
export function researchVersion(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 1000000000)
    throw new DeskError(400, 'A saved research task version is required.');
  return value;
}
function boundedText(value: unknown, max: number, nonblank = true): string {
  const result = text(value, max);
  // PostgreSQL JSONB rejects NUL and unpaired UTF-16 surrogates. Preserve all other
  // original characters and count Unicode code points, including astral characters.
  if ((nonblank && !result.trim()) || result.includes('\u0000') || /[\uD800-\uDFFF]/u.test(result))
    throw new DeskError(400, 'Research text is missing or invalid.');
  return result;
}

export function researchCreateInput(value: unknown) {
  const input = exact(value, ['id', 'question']);
  return { id: researchId(input.id), question: boundedText(input.question, 12000) };
}
export function researchCancelInput(value: unknown) {
  const input = exact(value, ['id', 'version', 'reason']);
  return {
    id: researchId(input.id),
    version: researchVersion(input.version),
    reason: boundedText(input.reason, 4000),
  };
}
export function researchRetryInput(value: unknown) {
  const input = exact(value, ['id', 'version']);
  return { id: researchId(input.id), version: researchVersion(input.version) };
}
export function researchOffset(query: URLSearchParams, allowOffset: boolean): number {
  const keys = [...query.keys()];
  const offsets = query.getAll('offset');
  if (keys.some((key) => !allowOffset || key !== 'offset') || offsets.length > 1)
    throw new DeskError(400, 'This research request has unsupported query parameters.');
  if (!offsets.length) return 0;
  if (!matches(/^(0|[1-9][0-9]{0,6})$/, offsets[0]) || Number(offsets[0]) > RESEARCH_MAX_OFFSET)
    throw new DeskError(400, 'Choose a valid research page.');
  return Number(offsets[0]);
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw unavailable();
  return value as Record<string, unknown>;
}
function timestamp(value: unknown, source = false): string {
  const format = source
    ? /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,6})?Z$/
    : /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,6})?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
  if (
    typeof value !== 'string' ||
    !matches(format, value) ||
    value.startsWith('0000') ||
    !Number.isFinite(Date.parse(value))
  )
    throw unavailable();
  const calendar = new Date(value.slice(0, 10) + 'T00:00:00Z');
  if (
    !Number.isFinite(calendar.getTime()) ||
    calendar.toISOString().slice(0, 10) !== value.slice(0, 10)
  )
    throw unavailable();
  return value;
}
const optionalTimestamp = (value: unknown) => (value === null ? null : timestamp(value));
const optionalReason = (value: unknown) => (value === null ? null : boundedText(value, 4000));

export function shapeResearchResult(value: unknown): ResearchResult {
  const raw = exact(value, ['text', 'sources', 'limitations']);
  if (!Array.isArray(raw.sources) || raw.sources.length < 1 || raw.sources.length > 30)
    throw unavailable();
  const sources = raw.sources.map((value): ResearchSource => {
    const source = exact(value, ['url', 'title', 'retrieved_at']);
    const url = boundedText(source.url, 2000);
    if (!matches(sourceUrlPattern, url)) throw unavailable();
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      (parsed.port !== '' && (Number(parsed.port) < 1 || Number(parsed.port) > 65535))
    )
      throw unavailable();
    return {
      url,
      title: boundedText(source.title, 300),
      retrieved_at: timestamp(source.retrieved_at, true),
    };
  });
  const result = {
    text: boundedText(raw.text, 20000),
    sources,
    limitations: boundedText(raw.limitations, 4000, false),
  };
  // JSONB's text representation adds one space after every structural colon and
  // comma. This exact fixed shape has 4 + 6 * source_count such separators.
  if (new TextEncoder().encode(JSON.stringify(result)).length + 4 + 6 * sources.length > 100000)
    throw unavailable();
  return result;
}

function summary(value: unknown, owner: string): ResearchTaskSummary {
  const row = object(value);
  if (
    row.owner_id !== owner ||
    row.scope !== 'public_primary_sources' ||
    row.role !== 'research_analyst' ||
    typeof row.status !== 'string' ||
    !researchStatuses.includes(row.status as ResearchStatus)
  )
    throw unavailable();
  if (
    row.worker_session !== null &&
    (typeof row.worker_session !== 'string' || !matches(sessionPattern, row.worker_session))
  )
    throw unavailable();
  const result: ResearchTaskSummary = {
    id: researchId(row.id),
    question: boundedText(row.question, 12000),
    scope: 'public_primary_sources',
    role: 'research_analyst',
    version: researchVersion(row.version),
    status: row.status as ResearchStatus,
    created_at: timestamp(row.created_at),
    updated_at: timestamp(row.updated_at),
    worker_session: row.worker_session as string | null,
    claimed_at: optionalTimestamp(row.claimed_at),
    lease_expires_at: optionalTimestamp(row.lease_expires_at),
    completed_at: optionalTimestamp(row.completed_at),
    blocked_reason: optionalReason(row.blocked_reason),
    cancel_reason: optionalReason(row.cancel_reason),
  };
  const claimed = result.worker_session !== null;
  if (
    claimed !== (result.claimed_at !== null) ||
    (result.status === 'queued' && claimed) ||
    (['running', 'completed', 'blocked'].includes(result.status) && !claimed) ||
    (result.status === 'running') !== (result.lease_expires_at !== null) ||
    (result.status === 'completed') !== (result.completed_at !== null) ||
    (result.status === 'blocked') !== (result.blocked_reason !== null) ||
    (result.status === 'cancelled') !== (result.cancel_reason !== null)
  )
    throw unavailable();
  return result;
}

export function shapeResearchSummary(value: unknown, owner: string): ResearchTaskSummary {
  try {
    return summary(value, owner);
  } catch {
    throw unavailable();
  }
}
export function shapeResearchTask(value: unknown, owner: string, id: string): ResearchTask {
  try {
    const shaped = summary(value, owner);
    const row = object(value);
    if (shaped.id !== id || (shaped.status === 'completed') !== (row.result !== null))
      throw unavailable();
    return { ...shaped, result: row.result === null ? null : shapeResearchResult(row.result) };
  } catch {
    throw unavailable();
  }
}

export function researchStorageError(error: { code?: string }) {
  if (error.code === '40001')
    return new DeskError(409, 'This research task changed. Reload it before continuing.');
  if (error.code === '42501')
    return new DeskError(403, 'This account does not have access to this research task.');
  if (error.code === '22023')
    return new DeskError(400, 'The research request is invalid or a task limit was reached.');
  return unavailable();
}
