import {
  parseBridgeDescriptor,
  shapeBridgeList,
  shapeBridgeMetadata,
  bridgeRevokeInput,
  bridgeStatus,
  bridgeMetadataMatchesDescriptor,
  type BridgeDescriptor,
  type BridgeMetadata,
} from '../../lib/desk/bridge-contracts';
import { ResearchRequestError } from './research-client';

export type PairingDraft = { descriptor: BridgeDescriptor | null; attempted: boolean };
export const emptyPairingDraft = (): PairingDraft => ({ descriptor: null, attempted: false });
const invalidPairing = () =>
  new Error('Use the pairing descriptor from your existing session. Never paste a secret.');

export function parsePairingText(text: string, now = Date.now()): BridgeDescriptor {
  try {
    if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > 4096)
      throw invalidPairing();
    return parseBridgeDescriptor(JSON.parse(text), now);
  } catch {
    throw invalidPairing();
  }
}

export function preparePairing(draft: PairingDraft): PairingDraft {
  if (!draft.descriptor) throw invalidPairing();
  return { descriptor: { ...draft.descriptor }, attempted: true };
}

function matchesDescriptor(descriptor: BridgeDescriptor, bridge: BridgeMetadata) {
  return bridgeMetadataMatchesDescriptor(bridge, descriptor);
}

export function acknowledgePairing(draft: PairingDraft, metadata: BridgeMetadata): PairingDraft {
  const bridge = shapeBridgeMetadata(metadata);
  if (!draft.descriptor || !matchesDescriptor(draft.descriptor, bridge))
    throw new Error('Approval could not be confirmed. Check the same descriptor again.');
  return emptyPairingDraft();
}

export function connectionLabel(bridge: BridgeMetadata, serverNow: number): string {
  if (!Number.isFinite(serverNow)) return 'Status unavailable';
  try {
    bridge = shapeBridgeMetadata(bridge);
  } catch {
    return 'Status unavailable';
  }
  if (
    [bridge.created_at, bridge.revoked_at, bridge.last_seen_at].some(
      (value) => value !== null && Date.parse(value) > serverNow,
    )
  )
    return 'Status unavailable';
  const state = bridgeStatus(bridge, Math.floor(serverNow));
  if (state === 'revoked') return 'Access revoked';
  if (state === 'expired') return 'Approval expired';
  if (!bridge.last_seen_at) return 'Approved · awaiting first check';
  const age = serverNow - Date.parse(bridge.last_seen_at);
  if (!Number.isFinite(age) || age < 0) return 'Status unavailable';
  if (age < 60000) return 'Last check less than a minute ago';
  if (age < 3600000) return `Last check ${Math.floor(age / 60000)} min ago`;
  if (age < 86400000) return `Last check ${Math.floor(age / 3600000)} hr ago`;
  return `Last check ${Math.floor(age / 86400000)} days ago`;
}

type ClockEnvelope = { server_time: string };
export type BridgeListResponse = ClockEnvelope & { bridges: BridgeMetadata[] };
export type BridgeResponse = ClockEnvelope & { bridge: BridgeMetadata };
type Transport = typeof fetch;
const requestError = (status: number) =>
  new ResearchRequestError(
    status,
    status === 401 || status === 403
      ? 'Sign in again to manage connections.'
      : status === 400
        ? 'The pairing descriptor was refused. Check its details and expiry.'
        : status === 409
          ? 'This identity already has a different approval. Check your connections.'
          : 'Connection change could not be confirmed. Refresh, then check the same approval again.',
  );

async function request(
  action: 'list' | 'register' | 'revoke',
  body: object | undefined,
  transport: Transport,
) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 20000);
  try {
    const response = await transport(
      `/api/desk/research/bridges${action === 'list' ? '' : `/${action}`}`,
      {
        method: action === 'list' ? 'GET' : 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: abort.signal,
        headers: { 'X-XIV-Desk': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    if (!response.ok || response.redirected) {
      await response.body?.cancel();
      throw requestError(response.status >= 400 ? response.status : 503);
    }
    const reader = response.body?.getReader();
    if (!reader) throw requestError(503);
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024 * 1024) {
          await reader.cancel();
          throw requestError(503);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined));
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      typeof value.server_time !== 'string' ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.server_time) ||
      !Number.isFinite(Date.parse(value.server_time)) ||
      new Date(value.server_time).toISOString() !== value.server_time
    )
      throw requestError(503);
    return value;
  } catch (error) {
    if (error instanceof ResearchRequestError) throw error;
    throw requestError(503);
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadBridges(transport: Transport = fetch): Promise<BridgeListResponse> {
  const value = await request('list', undefined, transport);
  try {
    return { bridges: shapeBridgeList(value.bridges), server_time: value.server_time };
  } catch {
    throw requestError(503);
  }
}

export async function approveBridge(
  descriptor: BridgeDescriptor,
  transport: Transport = fetch,
  now = Date.now(),
): Promise<BridgeResponse> {
  const input = parseBridgeDescriptor(descriptor, now);
  const value = await request('register', input, transport);
  try {
    const bridge = shapeBridgeMetadata(value.bridge);
    if (!matchesDescriptor(input, bridge)) throw requestError(503);
    return { bridge, server_time: value.server_time };
  } catch {
    throw requestError(503);
  }
}

export async function revokeBridge(
  id: string,
  transport: Transport = fetch,
): Promise<BridgeResponse> {
  const input = bridgeRevokeInput({ id });
  const value = await request('revoke', input, transport);
  try {
    const bridge = shapeBridgeMetadata(value.bridge);
    if (bridge.id !== id || !bridge.revoked_at) throw requestError(503);
    return { bridge, server_time: value.server_time };
  } catch {
    throw requestError(503);
  }
}
