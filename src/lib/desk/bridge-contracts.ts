// Browser-safe owner pairing contract. No token generation, hashing, or worker transport.
import { DeskError, exact } from './contracts';
import { isResearchId } from './research';

export const XIV_BRIDGE_STOP = '2026-09-19T23:52:32Z';
const MAX_AGE_US = 14n * 24n * 60n * 60n * 1000000n;
const STOP_US = BigInt(Date.parse(XIV_BRIDGE_STOP)) * 1000n;
const sessionPattern = /^(codex|claude):[A-Za-z0-9_-]{8,128}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const descriptorTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
const utcPattern =
  /^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d)(?:\.(\d{1,6}))?(Z|\+00:00)$/;
const matches = (pattern: RegExp, value: string) => pattern.exec(value)?.[0] === value;

export type BridgeDescriptor = {
  id: string;
  session: string;
  token_sha256: string;
  expires_at: string;
};
export type BridgeMetadata = {
  id: string;
  session: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string | null;
};
export type BridgeStatus = 'approved' | 'expired' | 'revoked';

const invalid = () => new DeskError(400, 'The research bridge descriptor is invalid or expired.');
const unavailable = () =>
  new DeskError(503, 'Bridge approvals could not be read. Refresh the list before continuing.');

function utc(value: unknown): { text: string; micros: bigint } {
  if (typeof value !== 'string') throw invalid();
  const match = utcPattern.exec(value);
  if (!match || match[0] !== value || value.startsWith('0000')) throw invalid();
  const base = new Date(match[1] + 'Z');
  if (!Number.isFinite(base.getTime()) || base.toISOString().slice(0, 10) !== value.slice(0, 10))
    throw invalid();
  return {
    text: value,
    micros: BigInt(base.getTime()) * 1000n + BigInt((match[5] || '').padEnd(6, '0')),
  };
}
function session(value: unknown): string {
  if (typeof value !== 'string' || !matches(sessionPattern, value)) throw invalid();
  return value;
}

export function parseBridgeDescriptor(value: unknown, now = Date.now()): BridgeDescriptor {
  try {
    const raw = exact(value, ['id', 'session', 'token_sha256', 'expires_at']);
    if (
      !isResearchId(raw.id) ||
      typeof raw.token_sha256 !== 'string' ||
      !matches(digestPattern, raw.token_sha256) ||
      typeof raw.expires_at !== 'string' ||
      !matches(descriptorTimePattern, raw.expires_at) ||
      !Number.isSafeInteger(now)
    )
      throw invalid();
    const expires = utc(raw.expires_at);
    const nowUs = BigInt(now) * 1000n;
    if (expires.micros <= nowUs || expires.micros > nowUs + MAX_AGE_US || expires.micros > STOP_US)
      throw invalid();
    return {
      id: raw.id,
      session: session(raw.session),
      token_sha256: raw.token_sha256,
      expires_at: raw.expires_at,
    };
  } catch {
    throw invalid();
  }
}

export function bridgeRevokeInput(value: unknown): { id: string } {
  const raw = exact(value, ['id']);
  if (!isResearchId(raw.id)) throw new DeskError(400, 'Choose a valid bridge approval to revoke.');
  return { id: raw.id };
}

export function shapeBridgeMetadata(raw: unknown): BridgeMetadata {
  try {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw unavailable();
    const row = raw as Record<string, unknown>;
    if (!isResearchId(row.id)) throw unavailable();
    const created = utc(row.created_at),
      expires = utc(row.expires_at);
    const revoked = row.revoked_at === null ? null : utc(row.revoked_at);
    const seen = row.last_seen_at === null ? null : utc(row.last_seen_at);
    if (
      expires.micros <= created.micros ||
      expires.micros > created.micros + MAX_AGE_US ||
      expires.micros > STOP_US ||
      (revoked && revoked.micros < created.micros) ||
      (seen && seen.micros < created.micros) ||
      (revoked && seen && seen.micros > revoked.micros)
    )
      throw unavailable();
    // Explicit fields prevent a changed/malformed provider result from exposing a
    // digest, token, owner identity, or diagnostic fields to the browser.
    return {
      id: row.id,
      session: session(row.session),
      created_at: created.text,
      expires_at: expires.text,
      revoked_at: revoked?.text ?? null,
      last_seen_at: seen?.text ?? null,
    };
  } catch {
    throw unavailable();
  }
}

export function shapeBridgeList(raw: unknown): BridgeMetadata[] {
  if (!Array.isArray(raw)) throw unavailable();
  const bridges = raw.map(shapeBridgeMetadata);
  if (new Set(bridges.map((bridge) => bridge.id)).size !== bridges.length) throw unavailable();
  return bridges;
}

export function bridgeMetadataMatchesDescriptor(
  bridge: BridgeMetadata,
  descriptor: BridgeDescriptor,
): boolean {
  return (
    bridge.id === descriptor.id &&
    bridge.session === descriptor.session &&
    utc(bridge.expires_at).micros === utc(descriptor.expires_at).micros
  );
}

export function bridgeStatus(bridge: BridgeMetadata, serverNow = Date.now()): BridgeStatus {
  if (bridge.revoked_at !== null) return 'revoked';
  if (
    !Number.isSafeInteger(serverNow) ||
    utc(bridge.expires_at).micros <= BigInt(serverNow) * 1000n
  )
    return 'expired';
  // Approval describes a capability's validity, never whether a worker is connected.
  return 'approved';
}
