import { executeBridgeCommand, SessionError } from '../src/lib/desk/bridge-session';

// One bounded UTF-8 JSON command on stdin. No credential arguments, environment
// loading, automatic action, task-text execution, or repeated/background polling.
async function readCommand(): Promise<unknown> {
  if (process.argv.length !== 2 || process.stdin.isTTY) throw new SessionError('invalid');
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of process.stdin) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.length;
      if (size > 512 * 1024) {
        process.stdin.destroy();
        throw new SessionError('invalid');
      }
      chunks.push(bytes);
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    throw new SessionError('invalid');
  } finally {
    for (const chunk of chunks) chunk.fill(0);
  }
}

async function main() {
  try {
    const result = await executeBridgeCommand(await readCommand());
    process.stdout.write(JSON.stringify(result) + '\n');
  } catch (error) {
    const failure = error instanceof SessionError ? error : new SessionError('unavailable');
    // Never print caught diagnostics, input, response bodies, credentials or stacks.
    process.stdout.write(
      JSON.stringify({ kind: 'error', error: failure.kind, message: failure.message }) + '\n',
    );
    process.exitCode = 1;
  }
}

void main();
