// Local Windows transport only. Never import this module in a browser or print load().
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  ResearchBridgeClient,
  type BridgeCredentials,
  type BridgeDescriptor,
} from './bridge-client';

export type BridgeVault = {
  save(credentials: BridgeCredentials): Promise<void>;
  load(session: string): Promise<BridgeCredentials>;
  describe(session: string): Promise<BridgeDescriptor>;
};
export type VaultOptions = { testRoot?: string };
const MESSAGE = 'The local bridge vault could not complete this operation.';
export class VaultError extends Error {
  constructor() {
    super(MESSAGE);
    this.name = 'VaultError';
  }
}
const failure = () => new VaultError();
const powershell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const script = fileURLToPath(new URL('../../../scripts/bridge-vault.ps1', import.meta.url));
const sessionPattern = /^(codex|claude):[A-Za-z0-9_-]{8,128}$/;
const keys = [
  'projectUrl',
  'publishableKey',
  'ownerId',
  'bridgeId',
  'token',
  'session',
  'expiresAt',
] as const;

function sessionValue(value: unknown): string {
  if (typeof value !== 'string' || sessionPattern.exec(value)?.[0] !== value) throw failure();
  return value;
}
function credentialsValue(value: unknown, expectedSession?: string): BridgeCredentials {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw failure();
    const raw = value as Record<string, unknown>;
    if (
      Object.keys(raw).length !== keys.length ||
      keys.some((key) => !Object.hasOwn(raw, key) || typeof raw[key] !== 'string')
    )
      throw failure();
    const credentials = Object.fromEntries(keys.map((key) => [key, raw[key]])) as BridgeCredentials;
    sessionValue(credentials.session);
    if (expectedSession !== undefined && credentials.session !== expectedSession) throw failure();
    // Construction validates public configuration, token shape and current expiry;
    // this transport deliberately cannot perform a network request.
    new ResearchBridgeClient(credentials, async () => {
      throw failure();
    });
    return credentials;
  } catch {
    throw failure();
  }
}
function testRootValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw failure();
  const resolved = path.resolve(value);
  if (
    resolved !== value ||
    path.dirname(resolved).toLowerCase() !== path.resolve(tmpdir()).toLowerCase() ||
    /^xiv-bridge-vault-test-[A-Za-z0-9_-]{8,100}$/.exec(path.basename(resolved))?.[0] !==
      path.basename(resolved)
  )
    throw failure();
  return resolved;
}

function invoke(input: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      reject(failure());
      return;
    }
    // Serialize before spawning so a rejected input cannot leave a waiting child.
    const serialized = JSON.stringify(input);
    let settled = false;
    const chunks: Buffer[] = [];
    let size = 0;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!ok) {
        // Include stdin failures: the helper may otherwise keep waiting for EOF.
        child.stdin.destroy();
        try {
          child.kill();
        } catch {
          // Never attach native process diagnostics to the sanitized failure.
        }
        for (const chunk of chunks) chunk.fill(0);
        reject(failure());
        return;
      }
      const output = Buffer.concat(chunks);
      try {
        resolve(JSON.parse(output.toString('utf8')));
      } catch {
        reject(failure());
      } finally {
        output.fill(0);
        for (const chunk of chunks) chunk.fill(0);
      }
    };
    const child = spawn(
      powershell,
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script],
      {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
      },
    );
    const timer = setTimeout(() => {
      child.kill();
      finish(false);
    }, 20000);
    child.on('error', () => finish(false));
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 32768) {
        chunk.fill(0);
        child.kill();
        finish(false);
      } else if (!settled) chunks.push(chunk);
      else chunk.fill(0);
    });
    // Never retain or reflect child errors: PowerShell errors may contain input data.
    child.stderr.on('data', (chunk: Buffer) => {
      chunk.fill(0);
    });
    child.stdin.on('error', () => finish(false));
    child.on('close', (code) => finish(code === 0));
    try {
      child.stdin.end(serialized);
    } catch {
      child.kill();
      finish(false);
    }
  });
}

export function createVault(options: VaultOptions = {}): BridgeVault {
  let testRoot: string | undefined;
  try {
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw failure();
    if (Object.keys(options).some((key) => key !== 'testRoot')) throw failure();
    testRoot = testRootValue(options.testRoot);
  } catch {
    throw failure();
  }
  const payload = (operation: string, session: string) => ({
    operation,
    session,
    ...(testRoot ? { testRoot } : {}),
  });
  const vault: BridgeVault = {
    async save(value) {
      try {
        const credentials = credentialsValue(value);
        const result = await invoke({ ...payload('save', credentials.session), credentials });
        if (
          !result ||
          typeof result !== 'object' ||
          Array.isArray(result) ||
          Object.keys(result).length !== 1 ||
          (result as { ok?: unknown }).ok !== true
        )
          throw failure();
      } catch {
        throw failure();
      }
    },
    async load(session) {
      try {
        const expected = sessionValue(session);
        return credentialsValue(await invoke(payload('load', expected)), expected);
      } catch {
        throw failure();
      }
    },
    async describe(session) {
      try {
        const credentials = await vault.load(session);
        return {
          id: credentials.bridgeId,
          session: credentials.session,
          expires_at: credentials.expiresAt,
          token_sha256: createHash('sha256').update(credentials.token, 'utf8').digest('hex'),
        };
      } catch {
        throw failure();
      }
    },
  };
  return vault;
}
