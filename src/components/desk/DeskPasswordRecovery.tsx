'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';

type Phase = 'checking' | 'request' | 'password' | 'complete';
type InitialState = { phase: 'request' | 'password'; message: string };

const expiredMessage =
  'This link could not be used. Request a new one and open it in this browser.';
const unavailableMessage = 'Password recovery is unavailable. Try again shortly.';

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

async function initializeRecovery(): Promise<InitialState> {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const flowId = url.searchParams.get('sb_flow_id');
    const invalidLink =
      url.searchParams.has('error') ||
      url.searchParams.has('error_code') ||
      url.searchParams.has('error_description') ||
      Boolean(url.hash) ||
      (url.searchParams.has('code') && !code);

    // Keep credentials and provider errors out of subsequent URLs and referrers.
    if (url.search || url.hash) {
      window.history.replaceState(window.history.state, '', '/desk/recover');
    }
    if (invalidLink) return { phase: 'request', message: expiredMessage };

    if (code) {
      const response = await deskRequest('reset-exchange', {
        code,
        ...(flowId ? { flowId } : {}),
      });
      if (!response.ok) {
        return {
          phase: 'request',
          message:
            response.status === 401 || response.status === 403
              ? expiredMessage
              : unavailableMessage,
        };
      }
      return { phase: 'password', message: '' };
    }

    // Only a server-verified owner session can enter the password form without a link.
    const response = await deskRequest('bootstrap');
    if (response.ok) {
      const bootstrap = await response.json();
      if (bootstrap?.cloud === true && typeof bootstrap.today === 'string') {
        return { phase: 'password', message: '' };
      }
      return { phase: 'request', message: unavailableMessage };
    }
    return {
      phase: 'request',
      message: response.status === 401 || response.status === 403 ? '' : unavailableMessage,
    };
  } catch {
    return { phase: 'request', message: unavailableMessage };
  }
}

export function DeskPasswordRecovery() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const initialization = useRef<Promise<InitialState> | null>(null);

  useEffect(() => {
    let active = true;
    document.body.classList.add('xiv-desk-active');
    // React StrictMode replays effects; retain the single-use code exchange promise.
    initialization.current ??= initializeRecovery();
    void initialization.current.then((result) => {
      if (!active) return;
      setPhase(result.phase);
      setMessage(result.message);
    });
    return () => {
      active = false;
      document.body.classList.remove('xiv-desk-active');
    };
  }, []);

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const address = email.trim();
    if (address.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setMessage('Enter a valid email address.');
      return;
    }
    pending.current = true;
    setBusy(true);
    setMessage('Requesting a link…');
    try {
      const response = await deskRequest('reset-start', { email: address });
      if (response.ok) {
        const result = await response.json();
        setMessage(
          typeof result?.message === 'string'
            ? result.message
            : 'If this email belongs to an account, a reset link has been requested. Open it in this same browser.',
        );
        return;
      }
      setMessage(
        response.status === 429
          ? 'Too many requests. Wait a little, then try again.'
          : response.status === 400
            ? 'Enter a valid email address.'
            : unavailableMessage,
      );
    } catch {
      setMessage('The request could not be confirmed. Check your email or try again shortly.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (password.length < 12 || password.length > 1024) {
      setMessage('Use 12–1,024 characters for your new password.');
      return;
    }
    if (password !== confirmation) {
      setMessage('The passwords do not match.');
      return;
    }
    pending.current = true;
    setBusy(true);
    setMessage('Saving your password…');
    try {
      const response = await deskRequest('reset-password', { password });
      if (response.ok) {
        setPassword('');
        setConfirmation('');
        setPhase('complete');
        setMessage('Password changed. Sign in with your new password.');
      } else if (response.status === 401 || response.status === 403) {
        setPassword('');
        setConfirmation('');
        setPhase('request');
        setMessage(expiredMessage);
      } else {
        setMessage(
          response.status === 429
            ? 'Too many attempts. Wait a little, then try again.'
            : response.status === 400
              ? 'That password could not be saved. Choose a different password with 12–1,024 characters.'
              : 'The password change could not be confirmed. Try signing in, or request a new link.',
        );
      }
    } catch {
      setMessage(
        'The password change could not be confirmed. Try signing in, or request a new link.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="desk-root desk-gate" aria-label="Private desk password recovery">
      <Link
        className="desk-back"
        href="/desk"
        aria-disabled={busy}
        onClick={(event) => {
          if (pending.current) event.preventDefault();
        }}
      >
        XIV <span>Back to sign in</span>
      </Link>
      <div className="desk-login-card">
        <p className="desk-eyebrow">YOUR PRIVATE WORKSPACE</p>
        <h1>
          {phase === 'password'
            ? 'Choose a password'
            : phase === 'complete'
              ? 'You’re all set'
              : 'Reset your password'}
          <span>.</span>
        </h1>
        {phase === 'checking' ? (
          <p className="desk-message" role="status">
            Checking your connection…
          </p>
        ) : (
          <>
            {message && (
              <p className="desk-message" role="status">
                {message}
              </p>
            )}
            {phase === 'request' && (
              <form onSubmit={requestLink} aria-busy={busy}>
                <p className="desk-intro">Request a link, then open it in this same browser.</p>
                <label htmlFor="desk-recovery-email">Email</label>
                <input
                  id="desk-recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={320}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
                <button className="desk-primary" type="submit" disabled={busy}>
                  {busy ? 'Requesting…' : 'Send reset link'}
                </button>
              </form>
            )}
            {phase === 'password' && (
              <form onSubmit={changePassword} aria-busy={busy}>
                <p className="desk-intro" id="desk-password-help">
                  Use at least 12 characters.
                </p>
                <label htmlFor="desk-new-password">New password</label>
                <input
                  id="desk-new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="desk-password-help"
                  required
                  minLength={12}
                  maxLength={1024}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
                <label htmlFor="desk-confirm-password">Confirm password</label>
                <input
                  id="desk-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={1024}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={busy}
                />
                <button className="desk-primary" type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Save new password'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setPassword('');
                    setConfirmation('');
                    setMessage('');
                    setPhase('request');
                  }}
                >
                  Request a new link
                </button>
              </form>
            )}
            {phase === 'complete' && <Link href="/desk">Back to sign in</Link>}
          </>
        )}
        <p className="desk-footnote">Owner access only.</p>
      </div>
    </section>
  );
}
