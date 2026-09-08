'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBridgeDescriptor, type BridgeMetadata } from '../../lib/desk/bridge-contracts';
import {
  emptyPairingDraft,
  parsePairingText,
  preparePairing,
  acknowledgePairing,
  connectionLabel,
  loadBridges,
  approveBridge,
  revokeBridge,
  type PairingDraft,
} from './bridge-ui';
import { ResearchRequestError } from './research-client';

type Props = {
  draft: PairingDraft;
  onDraft: (draft: PairingDraft) => void;
  onAuthLost: (status: number) => void;
  onBusy: (busy: boolean) => void;
};

export function ResearchConnections({ draft, onDraft, onAuthLost, onBusy }: Props) {
  const [bridges, setBridges] = useState<BridgeMetadata[] | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [clock, setClock] = useState({ server: NaN, local: 0 });
  const [elapsed, setElapsed] = useState(0);
  const active = useRef(true);
  const listVersion = useRef(0);
  const mutation = useRef(false);
  const importVersion = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = clock.server + elapsed;

  useEffect(() => {
    const listCounter = listVersion;
    const importCounter = importVersion;
    active.current = true;
    return () => {
      active.current = false;
      listCounter.current++;
      importCounter.current++;
    };
  }, []);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (clock.local) setElapsed(Math.max(0, performance.now() - clock.local));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [clock]);

  const failed = useCallback(
    (error: unknown) => {
      if (error instanceof ResearchRequestError && [401, 403].includes(error.status))
        onAuthLost(error.status);
      return error instanceof Error ? error.message : 'Connection unavailable. Refresh to check.';
    },
    [onAuthLost],
  );

  function updateClock(serverTime: string) {
    setClock({ server: Date.parse(serverTime), local: performance.now() });
    setElapsed(0);
  }

  async function load() {
    if (mutation.current) return;
    const version = ++listVersion.current;
    setLoading(true);
    try {
      const response = await loadBridges();
      if (!active.current || version !== listVersion.current) return;
      setBridges(response.bridges);
      updateClock(response.server_time);
      setMessage('');
    } catch (error) {
      if (active.current && version === listVersion.current) setMessage(failed(error));
    } finally {
      if (active.current && version === listVersion.current) setLoading(false);
    }
  }

  function acceptText(text: string) {
    if (mutation.current || draft.attempted) return;
    try {
      const descriptor = parsePairingText(text);
      onDraft({ descriptor, attempted: false });
      setMessage('Review this session before allowing access.');
    } catch (error) {
      setMessage(failed(error));
    }
  }

  async function acceptFile(file?: File) {
    if (!file || mutation.current || draft.attempted) return;
    const version = ++importVersion.current;
    if (file.size > 4096) {
      setMessage('Use a pairing descriptor file, up to 4 KB.');
      return;
    }
    try {
      const content = await file.text();
      if (active.current && version === importVersion.current) acceptText(content);
    } catch {
      if (active.current) setMessage('The pairing file could not be read.');
    }
  }

  async function approve() {
    if (mutation.current || !draft.descriptor) return;
    // Refuse an expired review before recording a new attempt. An earlier
    // uncertain attempt stays held until the owner deliberately dismisses it.
    try {
      parseBridgeDescriptor(draft.descriptor);
    } catch (error) {
      setMessage(failed(error));
      return;
    }
    const pending = preparePairing(draft);
    onDraft(pending);
    importVersion.current++;
    mutation.current = true;
    listVersion.current++;
    setLoading(false);
    setBusy(true);
    onBusy(true);
    setMessage('Checking approval…');
    try {
      const response = await approveBridge(pending.descriptor!);
      if (!active.current) return;
      onDraft(acknowledgePairing(pending, response.bridge));
      listVersion.current++;
      setLoading(false);
      updateClock(response.server_time);
      setBridges((previous) => [
        response.bridge,
        ...(previous || []).filter((b) => b.id !== response.bridge.id),
      ]);
      setMessage(
        response.bridge.revoked_at
          ? 'This approval was already revoked.'
          : 'Approval saved. This does not start a session.',
      );
    } catch (error) {
      if (active.current) setMessage(failed(error));
    } finally {
      mutation.current = false;
      onBusy(false);
      if (active.current) setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (mutation.current) return;
    mutation.current = true;
    listVersion.current++;
    setLoading(false);
    setBusy(true);
    onBusy(true);
    setMessage('Revoking access…');
    try {
      const response = await revokeBridge(id);
      if (!active.current) return;
      listVersion.current++;
      setLoading(false);
      updateClock(response.server_time);
      setBridges((previous) => (previous || []).map((b) => (b.id === id ? response.bridge : b)));
      setRevokeId(null);
      setMessage('Access revoked.');
    } catch (error) {
      if (active.current) setMessage(failed(error));
    } finally {
      mutation.current = false;
      onBusy(false);
      if (active.current) setBusy(false);
    }
  }

  return (
    <details
      className="research-connections"
      onToggle={(event) => {
        if (event.currentTarget.open && bridges === null && !loading) void load();
      }}
    >
      <summary>
        Connections <span>Approve an existing session</span>
      </summary>
      <div className="research-connections-body">
        <div className="research-section-heading">
          <h2>Your approved sessions</h2>
          <button type="button" disabled={busy || loading} onClick={() => void load()}>
            {loading ? 'Checking…' : 'Refresh'}
          </button>
        </div>
        {bridges !== null && !bridges.length && (
          <p className="research-empty">No approved sessions.</p>
        )}
        {bridges?.map((bridge) => (
          <article className="research-bridge" key={bridge.id}>
            <div>
              <strong>{bridge.session}</strong>
              <p>{connectionLabel(bridge, now)}</p>
            </div>
            {!bridge.revoked_at && (
              <button type="button" disabled={busy} onClick={() => setRevokeId(bridge.id)}>
                Revoke
              </button>
            )}
            <small>
              Expires{' '}
              <time dateTime={bridge.expires_at}>
                {new Date(bridge.expires_at).toLocaleString()}
              </time>
            </small>
            {bridge.last_seen_at && (
              <small>
                Recorded check{' '}
                <time dateTime={bridge.last_seen_at}>
                  {new Date(bridge.last_seen_at).toLocaleString()}
                </time>
              </small>
            )}
            <details>
              <summary>Session details</summary>
              <code>{bridge.id}</code>
            </details>
            {revokeId === bridge.id && !bridge.revoked_at && (
              <div className="research-bridge-revoke">
                <span>Stop this session’s research access?</span>
                <button type="button" disabled={busy} onClick={() => void revoke(bridge.id)}>
                  Confirm revoke
                </button>
                <button type="button" disabled={busy} onClick={() => setRevokeId(null)}>
                  Keep access
                </button>
              </div>
            )}
          </article>
        ))}
        <p className="research-empty">
          A recorded check shows credential use, not a continuously running agent.
        </p>

        {!draft.descriptor ? (
          <div
            className="research-pair-drop"
            tabIndex={0}
            role="group"
            aria-label="Drop or paste a pairing descriptor"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer.files.length === 1)
                void acceptFile(event.dataTransfer.files[0]);
              else setMessage('Choose one pairing descriptor file.');
            }}
            onPaste={(event) => {
              event.preventDefault();
              importVersion.current++;
              acceptText(event.clipboardData.getData('text/plain'));
            }}
          >
            <p>Drop a pairing file or paste here.</p>
            <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>
              Choose file
            </button>
            <input
              type="file"
              ref={fileInput}
              accept=".json,application/json"
              hidden
              onChange={(event) => {
                void acceptFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <small>Descriptor only. Never a password or secret.</small>
          </div>
        ) : (
          <div className="research-pair-review">
            <h3>Allow this session to research?</h3>
            <dl>
              <dt>Session</dt>
              <dd>{draft.descriptor.session}</dd>
              <dt>Until</dt>
              <dd>{new Date(draft.descriptor.expires_at).toLocaleString()}</dd>
              <dt>Identity</dt>
              <dd>
                <code>{draft.descriptor.id}</code>
              </dd>
            </dl>
            <p>Read queued questions. Save sourced answers. Revoke anytime.</p>
            <details>
              <summary>Verify descriptor</summary>
              <code>{draft.descriptor.token_sha256}</code>
            </details>
            {draft.attempted && <p>Approval unconfirmed. Check the same descriptor again.</p>}
            <div className="research-actions">
              <button
                type="button"
                className="research-primary"
                disabled={busy}
                onClick={() => void approve()}
              >
                {busy ? 'Checking…' : draft.attempted ? 'Check approval' : 'Allow research'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    draft.attempted &&
                    !window.confirm(
                      'Approval may already be saved. Discard only these local details? Check your connections before approving another session.',
                    )
                  )
                    return;
                  importVersion.current++;
                  onDraft(emptyPairingDraft());
                  setMessage(
                    draft.attempted
                      ? 'Local details discarded. Existing approvals are unchanged; refresh to check them.'
                      : '',
                  );
                }}
              >
                {draft.attempted ? 'Discard local details' : 'Discard'}
              </button>
            </div>
          </div>
        )}
        <p role="status" className="research-message">
          {message}
        </p>
      </div>
    </details>
  );
}
