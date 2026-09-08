'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { appendRecovery, discardRecovery, type Recovery } from './recovery';

type Phase = 'checking' | 'signed-out' | 'ready' | 'forbidden' | 'unavailable';

async function deskRequest(path: string, body?: object) {
  return fetch(`/api/desk/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'error',
    headers: {
      'X-XIV-Desk': '1',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function DeskGate() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [logoutUncertain, setLogoutUncertain] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const version = useRef(0);

  const applyStatus = useCallback((status: number) => {
    if (status === 401) {
      setPhase('signed-out');
      setMessage('Sign in to your private desk.');
    } else if (status === 403) {
      setPhase('forbidden');
      setMessage(
        'This account does not have access to the private desk. Sign out to use the owner account.',
      );
    } else {
      setPhase('unavailable');
      setMessage(
        status === 503
          ? 'The private desk connection is not configured yet. Your desktop files are not available on this website.'
          : 'The private desk connection is unavailable. No workspace has been opened. Try again shortly.',
      );
    }
  }, []);

  const checkSession = useCallback(
    async (expectedVersion?: number) => {
      const current = expectedVersion ?? ++version.current;
      setPhase('checking');
      setMessage('');
      try {
        const response = await deskRequest('bootstrap');
        if (version.current !== current) return;
        if (!response.ok) {
          applyStatus(response.status);
          return;
        }
        const bootstrap = await response.json();
        if (version.current !== current) return;
        if (bootstrap?.cloud !== true || typeof bootstrap.today !== 'string') {
          applyStatus(503);
          return;
        }
        setLogoutUncertain(false);
        setPhase('ready');
      } catch {
        if (version.current === current) applyStatus(503);
      }
    },
    [applyStatus],
  );

  const logout = useCallback(async (captured: unknown = null) => {
    const current = ++version.current;
    setRecoveries((held) => appendRecovery(held, captured));
    // Remove the iframe before the request, even when the connection is down.
    setPhase('signed-out');
    setPassword('');
    setEmail('');
    setBusy(true);
    setMessage('Closing your session…');
    try {
      const response = await deskRequest('logout', {});
      if (version.current !== current) return;
      if (!response.ok && response.status !== 401) throw new Error('Logout unavailable');
      setLogoutUncertain(false);
      setMessage('You are signed out. Your private workspace is closed.');
    } catch {
      if (version.current !== current) return;
      setLogoutUncertain(true);
      setMessage(
        'This workspace is closed, but sign-out could not be confirmed. Retry sign-out before leaving a shared device.',
      );
    } finally {
      if (version.current === current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    const requestVersion = version;
    document.body.classList.add('xiv-desk-active');
    void checkSession();
    return () => {
      requestVersion.current++;
      document.body.classList.remove('xiv-desk-active');
    };
  }, [checkSession]);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframe.current?.contentWindow ||
        !event.data ||
        typeof event.data !== 'object'
      )
        return;
      if (event.data.type === 'xiv-desk-authlost') {
        version.current++;
        setRecoveries((held) => appendRecovery(held, event.data.recovery));
        setPassword('');
        setBusy(false);
        applyStatus(event.data.status === 403 ? 403 : 401);
        if (event.data.status !== 403)
          setMessage('Your session ended. Your workspace is hidden. Sign in again to continue.');
      } else if (event.data.type === 'xiv-desk-logout') {
        void logout(event.data.recovery);
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [applyStatus, logout]);

  useEffect(() => {
    if (!recoveries.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [recoveries.length]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const current = ++version.current;
    setBusy(true);
    setMessage('Signing in…');
    try {
      const response = await deskRequest('login', { email: email.trim(), password });
      if (version.current !== current) return;
      setPassword('');
      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          setPhase('signed-out');
          setMessage('Sign-in failed. Check your email and password.');
        } else applyStatus(response.status);
        return;
      }
      await checkSession(current);
    } catch {
      if (version.current === current) {
        setPassword('');
        setPhase('signed-out');
        setMessage('Sign-in could not reach the private desk. Please try again.');
      }
    } finally {
      if (version.current === current) setBusy(false);
    }
  }

  function downloadRecovery(recovery: Recovery) {
    const url = URL.createObjectURL(
      new Blob([recovery.text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = recovery.filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function recoveryControls() {
    return (
      <>
        <p>
          Held in this tab only. Download each version before leaving. Downloading keeps its copy
          here until you discard it.
        </p>
        <div style={{ maxHeight: '35vh', overflowY: 'auto' }}>
          {recoveries.map((snapshot, index) => {
            const label = `${snapshot.filename.slice(9, 19)} · recovery ${index + 1}`;
            return (
              <div key={index}>
                <p>{label}</p>
                <button
                  type="button"
                  onClick={() => downloadRecovery(snapshot)}
                  aria-label={`Download ${label}`}
                >
                  Download text
                </button>
                <button
                  type="button"
                  className="desk-subtle"
                  aria-label={`Discard ${label}`}
                  onClick={() => {
                    if (
                      window.confirm(`Discard ${label}? Download it first if you still need it.`)
                    ) {
                      setRecoveries((held) => discardRecovery(held, snapshot));
                    }
                  }}
                >
                  Discard this version
                </button>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (phase === 'ready')
    return (
      <section className="desk-root desk-open" aria-label="Private XIV trading desk">
        <iframe
          ref={iframe}
          src="/desk-assets/index.html"
          title="XIV private spatial desk"
          className="desk-frame"
          allow="microphone"
          referrerPolicy="same-origin"
          sandbox="allow-scripts allow-same-origin allow-downloads allow-modals"
        />
        {recoveries.length > 0 && (
          <div className="desk-recovered-bar">
            <details style={{ maxWidth: 'min(360px, 85vw)', padding: '6px', fontSize: '12px' }}>
              <summary>{recoveries.length} text recoveries held in this tab</summary>
              {recoveryControls()}
            </details>
          </div>
        )}
      </section>
    );

  return (
    <section className="desk-root desk-gate" aria-label="Private desk sign-in">
      <Link
        className="desk-back"
        href="/"
        aria-label="Back to the public XIV website"
        onClick={(event) => {
          if (
            recoveries.length &&
            !window.confirm(
              `Leave the desk and discard ${recoveries.length} held text recoveries? Cancel to download them first.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        XIV <span>Back to the website</span>
      </Link>
      <div className="desk-login-card">
        <p className="desk-eyebrow">YOUR PRIVATE WORKSPACE</p>
        <h1>
          A little space
          <br />
          to think<span>.</span>
        </h1>
        <p className="desk-intro">Capture a thought. Move it around. Shape a preparation draft.</p>
        {phase === 'checking' ? (
          <p className="desk-message" role="status">
            Checking your private connection…
          </p>
        ) : (
          <>
            <p className="desk-message" role="status">
              {message}
            </p>
            {recoveries.length > 0 && (
              <div className="desk-recovery">
                <p>{recoveries.length} text recoveries</p>
                {recoveryControls()}
              </div>
            )}
            {phase === 'signed-out' && !logoutUncertain && (
              <form onSubmit={signIn}>
                <label htmlFor="desk-email">Email</label>
                <input
                  id="desk-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  maxLength={320}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
                <label htmlFor="desk-password">Password</label>
                <input
                  id="desk-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  maxLength={4096}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
                <button className="desk-primary" type="submit" disabled={busy}>
                  {busy ? 'Signing in…' : 'Open my desk'}
                </button>
                <p className="desk-footnote">
                  <Link
                    href="/desk/recover"
                    aria-disabled={busy}
                    onClick={(event) => {
                      if (
                        busy ||
                        (recoveries.length > 0 &&
                          !window.confirm(
                            `Leave the desk and discard ${recoveries.length} held text recoveries? Cancel to download them first.`,
                          ))
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </p>
              </form>
            )}
            {phase === 'forbidden' && (
              <button
                className="desk-primary"
                type="button"
                onClick={() => void logout()}
                disabled={busy}
              >
                Sign out of this account
              </button>
            )}
            {logoutUncertain && (
              <button
                className="desk-primary"
                type="button"
                onClick={() => void logout()}
                disabled={busy}
              >
                Retry sign-out
              </button>
            )}
            {phase === 'unavailable' && (
              <button
                className="desk-primary"
                type="button"
                onClick={() => void checkSession()}
                disabled={busy}
              >
                Check connection again
              </button>
            )}
          </>
        )}
        <p className="desk-footnote">
          Owner access only. No live prices, orders or AI connection. Historical Gold review is not
          available online.
        </p>
      </div>
    </section>
  );
}
