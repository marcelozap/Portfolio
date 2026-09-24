// Local session adapter. Never import into browser code.
import { createHash } from 'node:crypto';
import {
  BridgeError,
  createBridgeIdentity,
  ResearchBridgeClient,
  type BridgeCredentials,
  type BridgeTask,
} from './bridge-client';
import { createVault, type BridgeVault } from './bridge-vault';
import { exact } from './contracts';
import {
  isResearchId,
  researchId,
  researchVersion,
  shapeResearchResult,
  shapeResearchTask,
  type ResearchResult,
} from './research';

export type SessionFailure =
  | 'invalid'
  | 'vault'
  | 'denied'
  | 'conflict'
  | 'uncertain'
  | 'unavailable';
const messages: Record<SessionFailure, string> = {
  invalid: 'The explicit research command was refused as invalid.',
  vault:
    'The protected identity is unavailable or already saved. Use describe to inspect it; do not silently replace it.',
  denied: 'The research connection was refused or expired. Stop work.',
  conflict: 'The saved claim changed. Read the task before continuing.',
  uncertain: 'The write could not be confirmed. Read the task before another mutation.',
  unavailable: 'The research queue is unavailable. No mutation was attempted.',
};
export class SessionError extends Error {
  constructor(public kind: SessionFailure) {
    super(Object.hasOwn(messages, kind) ? messages[kind] : messages.unavailable);
    if (!Object.hasOwn(messages, kind)) this.kind = 'unavailable';
    this.name = 'SessionError';
  }
}
export type SessionClient = Pick<
  ResearchBridgeClient,
  'list' | 'read' | 'claim' | 'renew' | 'complete' | 'block'
>;
type Config = Pick<
  BridgeCredentials,
  'projectUrl' | 'publishableKey' | 'ownerId' | 'session' | 'expiresAt'
>;
type Command =
  | { operation: 'init'; config: Config }
  | { operation: 'describe'; session: string }
  | { operation: 'list'; session: string }
  | { operation: 'read'; session: string; id: string }
  | { operation: 'claim'; session: string; id: string; version: number }
  | { operation: 'renew'; session: string; id: string; version: number; claim_id: string }
  | {
      operation: 'complete';
      session: string;
      id: string;
      version: number;
      claim_id: string;
      result: ResearchResult;
    }
  | {
      operation: 'block';
      session: string;
      id: string;
      version: number;
      claim_id: string;
      reason: string;
    };

function sessionName(value: unknown): string {
  if (
    typeof value !== 'string' ||
    /^(codex|claude):[A-Za-z0-9_-]{8,128}$/.exec(value)?.[0] !== value
  )
    throw new SessionError('invalid');
  return value;
}
function parseCommand(value: unknown, now: number): Command {
  try {
    if (!Number.isSafeInteger(now) || now < 0 || !value || typeof value !== 'object') throw 0;
    const op = (value as { operation?: unknown }).operation;
    if (op === 'init') {
      const input = exact(value, ['operation', 'config']);
      const raw = exact(input.config, [
        'projectUrl',
        'publishableKey',
        'ownerId',
        'session',
        'expiresAt',
      ]);
      const config = raw as Config;
      sessionName(config.session);
      // Validate public setup before generating any identity or touching the vault.
      new ResearchBridgeClient(
        { ...config, bridgeId: '00000000-0000-0000-0000-000000000001', token: '0'.repeat(64) },
        fetch,
        () => now,
      );
      return { operation: op, config: { ...config } };
    }
    const keys = ['operation', 'session'];
    if (op === 'read' || op === 'claim' || op === 'renew' || op === 'complete' || op === 'block')
      keys.push('id');
    if (op === 'claim' || op === 'renew' || op === 'complete' || op === 'block')
      keys.push('version');
    if (op === 'renew' || op === 'complete' || op === 'block') keys.push('claim_id');
    if (op === 'complete') keys.push('result');
    if (op === 'block') keys.push('reason');
    const raw = exact(value, keys);
    const session = sessionName(raw.session);
    if (op === 'describe' || op === 'list') return { operation: op, session };
    const id = researchId(raw.id);
    if (op === 'read') return { operation: op, session, id };
    const version = researchVersion(raw.version);
    if (op === 'claim') return { operation: op, session, id, version };
    const claim_id = researchId(raw.claim_id);
    if (op === 'renew') return { operation: op, session, id, version, claim_id };
    if (op === 'complete')
      return {
        operation: op,
        session,
        id,
        version,
        claim_id,
        result: shapeResearchResult(raw.result),
      };
    if (op === 'block') {
      const reason = raw.reason;
      if (
        typeof reason !== 'string' ||
        !reason.trim() ||
        [...reason].length > 4000 ||
        reason.includes('\u0000') ||
        /[\uD800-\uDFFF]/u.test(reason)
      )
        throw 0;
      return { operation: op, session, id, version, claim_id, reason };
    }
    throw 0;
  } catch {
    throw new SessionError('invalid');
  }
}

function withoutSecret(value: unknown, token: string) {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized.includes(token)) throw new Error();
}

function checkedTask(value: BridgeTask, credentials: BridgeCredentials, id?: string): BridgeTask {
  withoutSecret(value, credentials.token);
  if (!value || !isResearchId(value.id) || (id && value.id !== id)) throw new Error();
  const task = shapeResearchTask(
    { ...value, owner_id: credentials.ownerId },
    credentials.ownerId,
    value.id,
  );
  if (value.claim_id !== null && !isResearchId(value.claim_id)) throw new Error();
  if (value.bridge_id !== null && !isResearchId(value.bridge_id)) throw new Error();
  if (task.status === 'queued') {
    if (value.claim_id !== null || value.bridge_id !== null) throw new Error();
  } else if (
    value.bridge_id !== credentials.bridgeId ||
    task.worker_session !== credentials.session ||
    !value.claim_id
  )
    throw new Error();
  return { ...task, bridge_id: value.bridge_id, claim_id: value.claim_id };
}

/** Exactly one explicit command, for one existing session. No polling or automatic retries. */
export async function executeBridgeCommand(
  input: unknown,
  deps?: {
    vault: BridgeVault;
    client: (credentials: BridgeCredentials) => SessionClient;
    now: () => number;
  },
): Promise<object> {
  const clock = deps?.now ?? Date.now;
  const command = parseCommand(input, clock());
  let credentials: BridgeCredentials;
  try {
    const vault = deps?.vault ?? createVault();
    if (command.operation === 'init') {
      const { descriptor, token } = createBridgeIdentity(
        command.config.session,
        command.config.expiresAt,
        clock(),
      );
      credentials = { ...command.config, bridgeId: descriptor.id, token };
      new ResearchBridgeClient(credentials, fetch, clock);
      withoutSecret(descriptor, token);
      await vault.save(credentials);
      return { kind: 'pairing_descriptor', descriptor, connected: false };
    }
    credentials = await vault.load(command.session);
    if (credentials.session !== command.session) throw new Error();
    new ResearchBridgeClient(credentials, fetch, clock);
  } catch {
    throw new SessionError('vault');
  }
  if (command.operation === 'describe') {
    const output = {
      kind: 'pairing_descriptor',
      descriptor: {
        id: credentials.bridgeId,
        session: credentials.session,
        token_sha256: createHash('sha256').update(credentials.token, 'utf8').digest('hex'),
        expires_at: credentials.expiresAt,
      },
      connected: false,
    };
    try {
      withoutSecret(output, credentials.token);
      return output;
    } catch {
      throw new SessionError('vault');
    }
  }
  let writeEntered = false;
  try {
    // Refuse accidental inclusion of this private credential before sending any task text.
    withoutSecret(command, credentials.token);
    const client = deps?.client(credentials) ?? new ResearchBridgeClient(credentials, fetch, clock);
    if (command.operation === 'list') {
      const values = await client.list();
      if (!Array.isArray(values) || values.length > 20) throw new Error();
      const tasks = values.map((value) => checkedTask(value, credentials));
      if (new Set(tasks.map((task) => task.id)).size !== tasks.length) throw new Error();
      return { kind: 'research_tasks', tasks };
    }
    if (command.operation === 'read') {
      return {
        kind: 'research_task',
        task: checkedTask(await client.read(command.id), credentials, command.id),
      };
    }
    let task: BridgeTask;
    if (command.operation === 'claim') {
      writeEntered = true;
      task = await client.claim({ id: command.id, version: command.version });
    } else {
      const saved = checkedTask(await client.read(command.id), credentials, command.id);
      if (
        saved.version !== command.version ||
        saved.claim_id !== command.claim_id ||
        saved.status !== 'running' ||
        saved.bridge_id !== credentials.bridgeId ||
        saved.worker_session !== command.session ||
        !saved.lease_expires_at ||
        Date.parse(saved.lease_expires_at) <= clock()
      )
        throw new SessionError('conflict');
      writeEntered = true;
      if (command.operation === 'renew') task = await client.renew(saved);
      else if (command.operation === 'complete')
        task = await client.complete(saved, command.result);
      else task = await client.block(saved, command.reason);
    }
    const checked = checkedTask(task, credentials, command.id);
    const status =
      command.operation === 'complete'
        ? 'completed'
        : command.operation === 'block'
          ? 'blocked'
          : 'running';
    if (
      checked.version !== command.version + 1 ||
      checked.status !== status ||
      (command.operation !== 'claim' && checked.claim_id !== command.claim_id)
    )
      throw new Error();
    return { kind: 'research_task', task: checked };
  } catch (error) {
    if (error instanceof SessionError)
      throw new SessionError(writeEntered ? 'uncertain' : error.kind);
    if (
      error instanceof BridgeError &&
      ['invalid', 'denied', 'conflict', 'uncertain'].includes(error.kind)
    )
      throw new SessionError(error.kind);
    throw new SessionError(writeEntered ? 'uncertain' : 'unavailable');
  }
}
