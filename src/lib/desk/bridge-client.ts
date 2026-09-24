// Local Node transport only. No scheduler, model, automatic retry or credential storage.
// This module must never be imported by a browser component.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  isResearchId,
  researchVersion,
  shapeResearchTask,
  type ResearchResult,
  type ResearchTask,
} from './research';

export const XIV_BRIDGE_STOP = '2026-09-19T23:52:32Z';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const tokenPattern = /^[0-9a-f]{64}$/;
const sessionPattern = /^(codex|claude):[A-Za-z0-9_-]{8,128}$/;
const matches = (pattern: RegExp, value: string) => pattern.exec(value)?.[0] === value;

export type BridgeDescriptor = {
  id: string;
  session: string;
  token_sha256: string;
  expires_at: string;
};
export type BridgeCredentials = {
  projectUrl: string;
  publishableKey: string;
  ownerId: string;
  bridgeId: string;
  token: string;
  session: string;
  expiresAt: string;
};
export type BridgeTask = ResearchTask & { bridge_id: string | null; claim_id: string | null };
export type BridgeFailure = 'invalid' | 'denied' | 'conflict' | 'unavailable' | 'uncertain';
export class BridgeError extends Error {
  constructor(
    public kind: BridgeFailure,
    message: string,
  ) {
    super(message);
  }
}
const invalid = () => new BridgeError('invalid', 'Invalid private bridge configuration or input.');

function expiry(value: string, now: number) {
  // Canonical ISO UTC prevents permissive Date parsing from repairing bad dates.
  const parsed = Date.parse(value);
  if (
    !Number.isFinite(parsed) ||
    (new Date(parsed).toISOString() !== value.replace(/Z$/, '.000Z') &&
      new Date(parsed).toISOString() !== value) ||
    parsed <= now ||
    parsed > now + MAX_AGE_MS ||
    parsed > Date.parse(XIV_BRIDGE_STOP)
  )
    throw invalid();
  return parsed;
}

/** Generate locally only when deliberately pairing. Send only descriptor for owner approval. */
export function createBridgeIdentity(session: string, expiresAt: string, now = Date.now()) {
  if (!matches(sessionPattern, session)) throw invalid();
  expiry(expiresAt, now);
  const token = randomBytes(32).toString('hex');
  const descriptor: BridgeDescriptor = {
    id: randomUUID(),
    session,
    token_sha256: createHash('sha256').update(token, 'utf8').digest('hex'),
    expires_at: expiresAt,
  };
  return { descriptor, token };
}

type Transport = typeof fetch;
type Clock = () => number;
const readLimit = 4 * 1024 * 1024;
const failure = (status: number, write: boolean) => {
  if (status === 401 || status === 403)
    return new BridgeError(
      'denied',
      'The research connection was refused. Stop using this credential.',
    );
  if (status === 409)
    return new BridgeError(
      'conflict',
      'The research claim changed. Read its saved state before continuing.',
    );
  if (status === 400)
    return new BridgeError('invalid', 'The research request was refused as invalid.');
  return new BridgeError(
    write ? 'uncertain' : 'unavailable',
    write
      ? 'The write could not be confirmed. Read the task before attempting another mutation.'
      : 'The research queue is unavailable.',
  );
};

export class ResearchBridgeClient {
  readonly #credentials: BridgeCredentials;
  readonly #transport: Transport;
  readonly #clock: Clock;
  readonly #origin: string;

  constructor(
    credentials: BridgeCredentials,
    transport: Transport = fetch,
    clock: Clock = Date.now,
  ) {
    let origin: URL;
    try {
      origin = new URL(credentials.projectUrl);
    } catch {
      throw invalid();
    }
    if (
      origin.protocol !== 'https:' ||
      origin.origin !== credentials.projectUrl ||
      !/^[a-z0-9-]+\.supabase\.co$/.test(origin.hostname) ||
      origin.username ||
      origin.password ||
      origin.port ||
      !matches(/^sb_publishable_[A-Za-z0-9_-]{10,490}$/, credentials.publishableKey) ||
      !isResearchId(credentials.ownerId) ||
      !isResearchId(credentials.bridgeId) ||
      !matches(tokenPattern, credentials.token) ||
      !matches(sessionPattern, credentials.session)
    )
      throw invalid();
    expiry(credentials.expiresAt, clock());
    this.#credentials = { ...credentials };
    this.#transport = transport;
    this.#clock = clock;
    this.#origin = origin.origin;
  }

  #checkLive() {
    try {
      expiry(this.#credentials.expiresAt, this.#clock());
    } catch {
      throw new BridgeError('denied', 'This bridge approval expired. Stop work.');
    }
  }

  #task(value: unknown, expectedId?: string): BridgeTask {
    try {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
      const raw = value as Record<string, unknown>;
      if (!isResearchId(raw.id) || (expectedId && raw.id !== expectedId)) throw invalid();
      const shaped = shapeResearchTask(raw, this.#credentials.ownerId, raw.id);
      if (raw.claim_id !== null && !isResearchId(raw.claim_id)) throw invalid();
      if (raw.bridge_id !== null && !isResearchId(raw.bridge_id)) throw invalid();
      if (shaped.status === 'queued') {
        if (raw.claim_id !== null || raw.bridge_id !== null) throw invalid();
      } else if (
        raw.bridge_id !== this.#credentials.bridgeId ||
        shaped.worker_session !== this.#credentials.session ||
        !raw.claim_id
      )
        throw invalid();
      return {
        ...shaped,
        bridge_id: raw.bridge_id as string | null,
        claim_id: raw.claim_id as string | null,
      };
    } catch {
      throw new BridgeError('unavailable', 'The returned research task failed validation.');
    }
  }

  async #rpc(
    name: 'xiv_research_bridge_read' | 'xiv_research_bridge_apply',
    args: object,
    write: boolean,
  ) {
    this.#checkLive();
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const response = await this.#transport(`${this.#origin}/rest/v1/rpc/${name}`, {
        method: 'POST',
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
        signal: abort.signal,
        // Supabase publishable keys belong in apikey, never a user Bearer header.
        headers: {
          apikey: this.#credentials.publishableKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          p_bridge_id: this.#credentials.bridgeId,
          p_token: this.#credentials.token,
          ...args,
        }),
      });
      if (!response.ok || response.redirected) {
        await response.body?.cancel();
        throw failure(response.status, write);
      }
      const reader = response.body?.getReader();
      if (!reader) throw failure(503, write);
      let size = 0;
      const chunks: Uint8Array[] = [];
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > readLimit) {
            await reader.cancel();
            throw failure(503, write);
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
    } catch (error) {
      // Never reflect provider messages, response bodies, token-bearing args or fetch errors.
      if (error instanceof BridgeError) throw error;
      throw failure(503, write);
    } finally {
      clearTimeout(timeout);
    }
  }

  async list(): Promise<BridgeTask[]> {
    const value = await this.#rpc('xiv_research_bridge_read', { p_task_id: null }, false);
    if (!value || typeof value !== 'object' || !Array.isArray((value as { tasks?: unknown }).tasks))
      throw failure(503, false);
    const tasks = (value as { tasks: unknown[] }).tasks;
    if (tasks.length > 20) throw failure(503, false);
    const shaped = tasks.map((task) => this.#task(task));
    if (new Set(shaped.map((task) => task.id)).size !== shaped.length) throw failure(503, false);
    return shaped;
  }

  async read(id: string): Promise<BridgeTask> {
    if (!isResearchId(id)) throw invalid();
    const value = await this.#rpc('xiv_research_bridge_read', { p_task_id: id }, false);
    return this.#task(
      value && typeof value === 'object' ? (value as { task?: unknown }).task : null,
      id,
    );
  }

  async claim(task: Pick<BridgeTask, 'id' | 'version'>) {
    return this.#apply(task, 'claim', {});
  }
  async renew(task: BridgeTask) {
    return this.#apply(task, 'renew', { claim_id: this.#ownClaim(task) });
  }
  async complete(task: BridgeTask, result: ResearchResult) {
    return this.#apply(task, 'complete', { claim_id: this.#ownClaim(task), result });
  }
  async block(task: BridgeTask, reason: string) {
    if (typeof reason !== 'string' || !reason.trim() || [...reason].length > 4000) throw invalid();
    return this.#apply(task, 'block', { claim_id: this.#ownClaim(task), reason });
  }

  #ownClaim(task: BridgeTask) {
    if (
      task.status !== 'running' ||
      task.bridge_id !== this.#credentials.bridgeId ||
      task.worker_session !== this.#credentials.session ||
      !isResearchId(task.claim_id)
    )
      throw invalid();
    return task.claim_id;
  }

  async #apply(task: Pick<BridgeTask, 'id' | 'version'>, action: string, payload: object) {
    if (!isResearchId(task.id)) throw invalid();
    try {
      researchVersion(task.version);
    } catch {
      throw invalid();
    }
    const value = await this.#rpc(
      'xiv_research_bridge_apply',
      {
        p_task_id: task.id,
        p_expected_version: task.version,
        p_action: action,
        p_payload: payload,
      },
      true,
    );
    try {
      const result = this.#task(value, task.id);
      const expectedStatus =
        action === 'complete' ? 'completed' : action === 'block' ? 'blocked' : 'running';
      if (
        result.version !== task.version + 1 ||
        result.status !== expectedStatus ||
        (action !== 'claim' && result.claim_id !== (payload as { claim_id: string }).claim_id)
      )
        throw invalid();
      return result;
    } catch {
      throw new BridgeError(
        'uncertain',
        'The write response failed validation. Read the task before another mutation.',
      );
    }
  }
}
