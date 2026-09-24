import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  copyFile,
  link,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  rmdir,
  stat,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { inspect } from 'node:util';
import { createVault, VaultError } from '../src/lib/desk/bridge-vault';
import type { BridgeCredentials } from '../src/lib/desk/bridge-client';

// Real CurrentUser DPAPI, synthetic credentials, and explicit temporary roots only.
// Never call createVault without testRoot or inspect the default credential location.
const POWERSHELL = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const ROOT_PREFIX = 'xiv-bridge-vault-test-';
const SESSION = 'codex:synthetic_vault_session';
const OTHER_SESSION = 'claude:synthetic_other_session';
const TOKEN = 'a'.repeat(64);
const OTHER_TOKEN = 'b'.repeat(64);
const KEY = 'sb_publishable_synthetic_12345';
const MESSAGE = 'The local bridge vault could not complete this operation.';
const windows = { skip: process.platform !== 'win32' };
const roots = new Set<string>();

function credentials(overrides: Partial<BridgeCredentials> = {}): BridgeCredentials {
  return {
    projectUrl: 'https://fixture.supabase.co',
    publishableKey: KEY,
    ownerId: '11111111-1111-4111-8111-111111111111',
    bridgeId: 'aaaaaaaa-2222-4222-8222-222222222222',
    token: TOKEN,
    session: SESSION,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    ...overrides,
  };
}
function newRoot() {
  const root = path.join(tmpdir(), ROOT_PREFIX + randomUUID());
  roots.add(root);
  return root;
}
function rootOnly(root: string) {
  const full = path.resolve(root);
  assert.equal(path.dirname(full).toLowerCase(), path.resolve(tmpdir()).toLowerCase());
  assert.match(path.basename(full), /^xiv-bridge-vault-test-[0-9a-f-]{36}$/);
  return full;
}
function sessionDirectory(root: string, session = SESSION) {
  return path.join(rootOnly(root), createHash('sha256').update(session, 'utf8').digest('hex'));
}
function credentialFile(root: string, session = SESSION) {
  return path.join(sessionDirectory(root, session), 'credential.dpapi');
}
function safeError(error: unknown) {
  assert.ok(error instanceof VaultError);
  assert.equal(error.message, MESSAGE);
  for (const key of ['cause', 'stdout', 'stderr', 'token', 'credentials', 'publishableKey'])
    assert.equal((error as unknown as Record<string, unknown>)[key], undefined, key);
  for (const text of [String(error), JSON.stringify(error), inspect(error, { showHidden: true })])
    for (const secret of [TOKEN, OTHER_TOKEN, KEY, 'SYNTHETIC-PRIVATE-INPUT'])
      assert.ok(!text.includes(secret));
  return true;
}
const rejects = (action: () => unknown | Promise<unknown>) =>
  assert.rejects(async () => action(), safeError);

// Static helper code and JSON stdin keep paths and test data out of shell interpolation.
// ACL repair is confined to registered, direct-child temporary roots and never follows links.
const FILESYSTEM_HELPER = String.raw`
$ErrorActionPreference = 'Stop'
$request = [Console]::In.ReadToEnd() | ConvertFrom-Json
$root = [IO.Path]::GetFullPath([string]$request.root).TrimEnd('\')
$temporary = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
if (-not [String]::Equals([IO.Path]::GetDirectoryName($root), $temporary, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($root) -notmatch '^xiv-bridge-vault-test-[0-9a-f-]{36}$') { throw 'Invalid synthetic test root' }
$current = [Security.Principal.WindowsIdentity]::GetCurrent().User
$system = New-Object Security.Principal.SecurityIdentifier('S-1-5-18')
function Safe-Path([string]$value) {
  $full = [IO.Path]::GetFullPath($value)
  if (-not [String]::Equals($full, $root, [StringComparison]::OrdinalIgnoreCase) -and
      -not $full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Outside synthetic test root' }
  return $full
}
function Set-SafeAcl([string]$value) {
  $item = Get-Item -LiteralPath $value -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { return }
  if ($item.PSIsContainer) {
    $acl = New-Object Security.AccessControl.DirectorySecurity
    $inheritance = [Security.AccessControl.InheritanceFlags]'ContainerInherit,ObjectInherit'
  } else {
    $acl = New-Object Security.AccessControl.FileSecurity
    $inheritance = [Security.AccessControl.InheritanceFlags]::None
  }
  $acl.SetOwner($current)
  $acl.SetAccessRuleProtection($true, $false)
  foreach ($identity in @($current, $system)) {
    $rule = New-Object Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', $inheritance, 'None', 'Allow')
    $acl.AddAccessRule($rule)
  }
  if ($item.PSIsContainer) { [IO.Directory]::SetAccessControl($value, $acl) }
  else { [IO.File]::SetAccessControl($value, $acl) }
}
function Repair-Tree([string]$value) {
  $item = Get-Item -LiteralPath $value -Force
  if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { return }
  Set-SafeAcl $value
  if ($item.PSIsContainer) {
    foreach ($child in [IO.Directory]::EnumerateFileSystemEntries($value)) { Repair-Tree (Safe-Path $child) }
  }
}
switch ([string]$request.action) {
  'inspect' {
    $rows = @()
    foreach ($value in $request.paths) {
      $full = Safe-Path ([string]$value)
      $item = Get-Item -LiteralPath $full -Force
      if ($item.PSIsContainer) { $acl = [IO.Directory]::GetAccessControl($full) }
      else { $acl = [IO.File]::GetAccessControl($full) }
      $rules = @($acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier]) | ForEach-Object {
        @{ sid=$_.IdentityReference.Value; inherited=$_.IsInherited; type=$_.AccessControlType.ToString(); rights=$_.FileSystemRights.ToString() }
      })
      $rows += @{ path=$full; owner=$acl.GetOwner([Security.Principal.SecurityIdentifier]).Value; protected=$acl.AreAccessRulesProtected; rules=$rules }
    }
    @{ currentSid=$current.Value; paths=$rows } | ConvertTo-Json -Depth 8 -Compress
  }
  'weaken' {
    $full = Safe-Path ([string]$request.path)
    $item = Get-Item -LiteralPath $full -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Unexpected test reparse point' }
    if ($item.PSIsContainer) { $acl = [IO.Directory]::GetAccessControl($full) }
    else { $acl = [IO.File]::GetAccessControl($full) }
    $users = New-Object Security.Principal.SecurityIdentifier('S-1-5-32-545')
    $rule = New-Object Security.AccessControl.FileSystemAccessRule($users, 'ReadAndExecute', 'Allow')
    $acl.AddAccessRule($rule)
    if ($item.PSIsContainer) { [IO.Directory]::SetAccessControl($full, $acl) }
    else { [IO.File]::SetAccessControl($full, $acl) }
    @{ ok=$true } | ConvertTo-Json -Compress
  }
  'repair' {
    if (Test-Path -LiteralPath $root) { Repair-Tree $root }
    @{ ok=$true } | ConvertTo-Json -Compress
  }
  'seal' {
    $full = Safe-Path ([string]$request.path)
    if (-not [IO.File]::Exists($full) -or ([IO.File]::GetAttributes($full) -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Invalid synthetic ciphertext target' }
    Add-Type -AssemblyName System.Security
    $entropy = [Text.Encoding]::UTF8.GetBytes('xiv-research-bridge-vault:v1' + [char]10 + [string]$request.session + [char]10 + $full.ToUpperInvariant())
    $plain = [Text.Encoding]::UTF8.GetBytes(($request.credentials | ConvertTo-Json -Depth 8 -Compress))
    try {
      $cipher = [Security.Cryptography.ProtectedData]::Protect($plain, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser)
      try { [IO.File]::WriteAllBytes($full, $cipher) }
      finally { [Array]::Clear($cipher, 0, $cipher.Length) }
    } finally { [Array]::Clear($plain, 0, $plain.Length) }
    @{ ok=$true } | ConvertTo-Json -Compress
  }
  default { throw 'Unsupported synthetic test action' }
}
`;
function filesystem(
  root: string,
  action: string,
  values: Record<string, unknown> = {},
): Promise<unknown> {
  rootOnly(root);
  return new Promise((resolve, reject) => {
    const child = execFile(
      POWERSHELL,
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        FILESYSTEM_HELPER,
      ],
      {
        windowsHide: true,
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout) => {
        if (error) return reject(new Error('Synthetic filesystem helper failed.'));
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          reject(new Error('Synthetic filesystem helper returned invalid data.'));
        }
      },
    );
    child.stdin?.end(JSON.stringify({ root, action, ...values }));
  });
}
async function cleanup(root: string) {
  const full = rootOnly(root);
  let entry;
  try {
    entry = await lstat(full);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  if (entry.isSymbolicLink()) {
    await unlink(full);
    return;
  }
  const canonical = await realpath(full);
  assert.equal(path.dirname(canonical).toLowerCase(), (await realpath(tmpdir())).toLowerCase());
  assert.equal(path.basename(canonical).toLowerCase(), path.basename(full).toLowerCase());
  await filesystem(full, 'repair');
  rootOnly(full);
  await rm(full, { recursive: true, force: true });
}
afterEach(async () => {
  for (const root of roots) await cleanup(root);
  roots.clear();
});

test(
  'real DPAPI round-trip preserves exact credentials and describe exposes only the approval descriptor',
  windows,
  async () => {
    const root = newRoot();
    const value = credentials();
    const vault = createVault({ testRoot: root });
    await assert.rejects(() => lstat(root), { code: 'ENOENT' });
    await vault.save(value);
    assert.deepEqual(await vault.load(SESSION), value);
    const descriptor = await vault.describe(SESSION);
    assert.deepEqual(descriptor, {
      id: value.bridgeId,
      session: value.session,
      token_sha256: createHash('sha256').update(value.token, 'utf8').digest('hex'),
      expires_at: value.expiresAt,
    });
    for (const secret of [TOKEN, KEY, value.projectUrl, value.ownerId])
      assert.ok(!JSON.stringify(descriptor).includes(secret));
  },
);

test(
  'the vault contains one encrypted blob and no plaintext credential or scratch file',
  windows,
  async () => {
    const root = newRoot();
    const value = credentials();
    await createVault({ testRoot: root }).save(value);
    assert.deepEqual(await readdir(root), [path.basename(sessionDirectory(root))]);
    assert.deepEqual(await readdir(sessionDirectory(root)), ['credential.dpapi']);
    const bytes = await readFile(credentialFile(root));
    assert.ok(bytes.length > 64);
    for (const text of [
      TOKEN,
      KEY,
      SESSION,
      value.projectUrl,
      JSON.stringify(value),
      'publishableKey',
    ]) {
      assert.equal(bytes.includes(Buffer.from(text, 'utf8')), false);
      assert.equal(bytes.includes(Buffer.from(text, 'utf16le')), false);
    }
  },
);

test(
  'root, session directory and ciphertext have a protected ACL owned by the current user',
  windows,
  async () => {
    const root = newRoot();
    await createVault({ testRoot: root }).save(credentials());
    const report = (await filesystem(root, 'inspect', {
      paths: [root, sessionDirectory(root), credentialFile(root)],
    })) as {
      currentSid: string;
      paths: Array<{
        owner: string;
        protected: boolean;
        rules: Array<{ sid: string; inherited: boolean; type: string; rights: string }>;
      }>;
    };
    assert.equal(report.paths.length, 3);
    for (const entry of report.paths) {
      assert.equal(entry.owner, report.currentSid);
      assert.equal(entry.protected, true);
      assert.deepEqual(
        entry.rules.map((rule) => rule.sid).sort(),
        [report.currentSid, 'S-1-5-18'].sort(),
      );
      for (const rule of entry.rules) {
        assert.equal(rule.inherited, false);
        assert.equal(rule.type, 'Allow');
        assert.match(rule.rights, /FullControl/);
      }
    }
  },
);

test(
  'save never overwrites a credential, including competing saves for one session',
  windows,
  async () => {
    const root = newRoot();
    const vault = createVault({ testRoot: root });
    const first = credentials();
    const second = credentials({
      token: OTHER_TOKEN,
      bridgeId: 'bbbbbbbb-3333-4333-8333-333333333333',
    });
    const outcomes = await Promise.allSettled([vault.save(first), vault.save(second)]);
    assert.equal(outcomes.filter((outcome) => outcome.status === 'fulfilled').length, 1);
    for (const outcome of outcomes) if (outcome.status === 'rejected') safeError(outcome.reason);
    const saved = await vault.load(SESSION);
    assert.deepEqual(saved, outcomes[0].status === 'fulfilled' ? first : second);
    const before = await readFile(credentialFile(root));
    await rejects(() => vault.save(first));
    assert.deepEqual(await readFile(credentialFile(root)), before);
    assert.deepEqual(await vault.load(SESSION), saved);
    assert.deepEqual(await readdir(sessionDirectory(root)), ['credential.dpapi']);
  },
);

test('tampered ciphertext produces only the constant vault error', windows, async () => {
  const root = newRoot();
  const vault = createVault({ testRoot: root });
  await vault.save(credentials());
  const file = credentialFile(root);
  const original = await readFile(file);
  const corrupted = Buffer.from(original);
  corrupted[Math.floor(corrupted.length / 2)] ^= 0xff;
  await writeFile(file, corrupted);
  await rejects(() => vault.load(SESSION));
  await rejects(() => vault.describe(SESSION));
  await writeFile(file, original);
  assert.equal((await vault.load(SESSION)).token, TOKEN);
});

test('DPAPI entropy prevents moving a valid blob to another root or session', windows, async () => {
  const firstRoot = newRoot();
  const secondRoot = newRoot();
  const first = createVault({ testRoot: firstRoot });
  const second = createVault({ testRoot: secondRoot });
  await first.save(credentials());
  await second.save(credentials());
  await first.save(credentials({ session: OTHER_SESSION, token: OTHER_TOKEN }));
  await copyFile(credentialFile(firstRoot), credentialFile(secondRoot));
  await rejects(() => second.load(SESSION));
  await copyFile(credentialFile(firstRoot), credentialFile(firstRoot, OTHER_SESSION));
  await rejects(() => first.load(OTHER_SESSION));
  assert.equal((await first.load(SESSION)).token, TOKEN);
});

test(
  'malformed credentials and session names fail before any temporary vault is created',
  windows,
  async () => {
    const root = newRoot();
    const vault = createVault({ testRoot: root });
    const value = credentials();
    const malformed: unknown[] = [
      null,
      [],
      {},
      { ...value, extra: 'SYNTHETIC-PRIVATE-INPUT ' + TOKEN },
      { ...value, token: 'A'.repeat(64) },
      { ...value, token: TOKEN + '\n' },
      { ...value, publishableKey: 'SYNTHETIC-PRIVATE-INPUT ' + TOKEN },
      { ...value, projectUrl: 'http://fixture.supabase.co' },
      { ...value, projectUrl: 'https://other.example' },
      { ...value, bridgeId: value.bridgeId.toUpperCase() },
      { ...value, ownerId: 'bad' },
      { ...value, session: SESSION + '\n' },
      { ...value, expiresAt: new Date(Date.now() - 1).toISOString() },
      { ...value, expiresAt: '2026-09-19T23:52:32.001Z' },
    ];
    const { ownerId: _owner, ...missing } = value;
    malformed.push(missing);
    for (const invalid of malformed) await rejects(() => vault.save(invalid as BridgeCredentials));
    for (const session of [
      '',
      '../escape',
      'codex:short',
      SESSION + '\n',
      'codex:bad\u0000session',
    ]) {
      await rejects(() => vault.load(session));
      await rejects(() => vault.describe(session));
    }
    await assert.rejects(() => lstat(root), { code: 'ENOENT' });
  },
);

test(
  'load and describe revalidate expiration without waiting for a real credential to expire',
  windows,
  async (context) => {
    const root = newRoot();
    const vault = createVault({ testRoot: root });
    const value = credentials();
    await vault.save(value);
    context.mock.timers.enable({ apis: ['Date'], now: Date.parse(value.expiresAt) + 1 });
    try {
      await rejects(() => vault.load(SESSION));
      await rejects(() => vault.describe(SESSION));
    } finally {
      context.mock.timers.reset();
    }
  },
);

test(
  'an unsafe ACL on the root, session directory or ciphertext prevents loading',
  windows,
  async () => {
    for (const target of ['root', 'session', 'credential']) {
      const root = newRoot();
      const vault = createVault({ testRoot: root });
      await vault.save(credentials());
      const file =
        target === 'root'
          ? root
          : target === 'session'
            ? sessionDirectory(root)
            : credentialFile(root);
      await filesystem(root, 'weaken', { path: file });
      await rejects(() => vault.load(SESSION));
      await filesystem(root, 'repair');
      assert.equal((await vault.load(SESSION)).token, TOKEN);
    }
  },
);

test(
  'a junction at the vault root cannot redirect a save into another temporary vault',
  windows,
  async () => {
    const root = newRoot();
    const target = newRoot();
    const redirected = createVault({ testRoot: root });
    const original = createVault({ testRoot: target });
    await original.save(credentials({ session: OTHER_SESSION, token: OTHER_TOKEN }));
    const before = await readdir(target);
    await symlink(target, root, 'junction');
    try {
      assert.equal((await lstat(root)).isSymbolicLink(), true);
      await rejects(() => redirected.save(credentials()));
      await rejects(() => redirected.load(OTHER_SESSION));
      assert.deepEqual(await readdir(target), before);
      assert.equal((await original.load(OTHER_SESSION)).token, OTHER_TOKEN);
    } finally {
      rootOnly(root);
      await unlink(root);
    }
  },
);

test(
  'hard links, Git markers, missing entries and nested test roots fail with sanitized errors',
  windows,
  async () => {
    const root = newRoot();
    const vault = createVault({ testRoot: root });
    await rejects(() => vault.load(SESSION));
    await vault.save(credentials());
    const file = credentialFile(root);
    const duplicate = path.join(sessionDirectory(root), 'synthetic-hardlink.dpapi');
    await link(file, duplicate);
    try {
      assert.equal((await stat(file)).nlink, 2);
      await rejects(() => vault.load(SESSION));
      await rejects(() => vault.describe(SESSION));
    } finally {
      await unlink(duplicate);
    }
    assert.equal((await vault.load(SESSION)).token, TOKEN);
    const marker = path.join(rootOnly(root), '.git');
    for (const kind of ['file', 'directory']) {
      if (kind === 'file') await writeFile(marker, 'Synthetic Git marker fixture.\n');
      else await mkdir(marker);
      try {
        await rejects(() => vault.load(SESSION));
        await rejects(() => vault.save(credentials({ session: OTHER_SESSION })));
        await assert.rejects(() => lstat(sessionDirectory(root, OTHER_SESSION)), {
          code: 'ENOENT',
        });
      } finally {
        if (kind === 'file') await unlink(marker);
        else await rmdir(marker);
      }
    }
    assert.equal((await vault.load(SESSION)).token, TOKEN);
    const invalidRoot = newRoot();
    await rejects(() =>
      createVault({ testRoot: path.join(invalidRoot, 'nested') }).save(credentials()),
    );
    await assert.rejects(() => lstat(invalidRoot), { code: 'ENOENT' });
  },
);

test(
  'decrypted credentials must retain the requested session, exact fields and valid configuration',
  windows,
  async () => {
    const root = newRoot();
    const vault = createVault({ testRoot: root });
    const value = credentials();
    await vault.save(value);
    const seal = (payload: unknown) =>
      filesystem(root, 'seal', {
        path: credentialFile(root),
        session: SESSION,
        credentials: payload,
      });
    await seal(value);
    assert.deepEqual(await vault.load(SESSION), value);
    for (const invalid of [
      { ...value, session: OTHER_SESSION },
      { ...value, token: 'SYNTHETIC-PRIVATE-INPUT' },
      { ...value, extra: 'SYNTHETIC-PRIVATE-INPUT ' + TOKEN },
      { ...value, expiresAt: '2000-01-01T00:00:00Z' },
      { ...value, projectUrl: 'https://outside.invalid' },
    ]) {
      await seal(invalid);
      await rejects(() => vault.load(SESSION));
    }
  },
);
