'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import type { ResearchTask, ResearchTaskSummary } from '../../lib/desk/research';
import {
  acknowledgeResearch,
  prepareResearch,
  researchRequest,
  ResearchRequestError,
  safeSourceHref,
  taskState,
  type ResearchDraft,
} from './research-client';

type Envelope = { server_time: string; connection: { state: 'disconnected' } };
type TaskResponse = Envelope & { task: ResearchTask };
type ListResponse = Envelope & { tasks: ResearchTaskSummary[]; next_offset: number | null };
type Props = {
  draft: ResearchDraft;
  heldRecoveries: number;
  onDraft: (draft: ResearchDraft) => void;
  onAuthLost: (status: number) => void;
  onLogout: () => void;
};

export function ResearchDesk({ draft, heldRecoveries, onDraft, onAuthLost, onLogout }: Props) {
  const [tasks, setTasks] = useState<ResearchTaskSummary[]>([]);
  const [selected, setSelected] = useState<ResearchTask | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [listMessage, setListMessage] = useState('');
  const [action, setAction] = useState<'cancel' | null>(null);
  const [reason, setReason] = useState('');
  const [clock, setClock] = useState({ server: Date.now(), local: 0 });
  const [elapsed, setElapsed] = useState(0);
  const active = useRef(true);
  const listVersion = useRef(0);
  const detailVersion = useRef(0);
  const mutationBusy = useRef(false);
  const now = clock.server + elapsed;

  const updateClock = useCallback((response: Envelope) => {
    const server = Date.parse(response.server_time);
    if (!Number.isFinite(server) || response.connection?.state !== 'disconnected')
      throw new Error('The connection status could not be verified.');
    setClock({ server, local: performance.now() });
    setElapsed(0);
  }, []);

  const failed = useCallback(
    (error: unknown) => {
      if (error instanceof ResearchRequestError && [401, 403].includes(error.status)) {
        onAuthLost(error.status);
        return 'Sign in again to continue.';
      }
      return error instanceof Error ? error.message : 'Connection unavailable. Try again.';
    },
    [onAuthLost],
  );

  const load = useCallback(
    async (offset = 0) => {
      const current = ++listVersion.current;
      setLoading(true);
      setListMessage('');
      try {
        const data = await researchRequest<ListResponse>(offset ? `?offset=${offset}` : '');
        if (!active.current || current !== listVersion.current) return;
        updateClock(data);
        if (!Array.isArray(data.tasks)) throw new Error('Requests could not be read.');
        setTasks((previous) =>
          offset === 0
            ? data.tasks
            : [...new Map([...previous, ...data.tasks].map((task) => [task.id, task])).values()],
        );
        setNextOffset(data.next_offset);
      } catch (error) {
        if (active.current && current === listVersion.current) setListMessage(failed(error));
      } finally {
        if (active.current && current === listVersion.current) setLoading(false);
      }
    },
    [failed, updateClock],
  );

  useEffect(() => {
    const listCounter = listVersion;
    const detailCounter = detailVersion;
    active.current = true;
    void load();
    return () => {
      active.current = false;
      listCounter.current++;
      detailCounter.current++;
    };
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (clock.local) setElapsed(Math.max(0, performance.now() - clock.local));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clock]);

  async function openTask(id: string) {
    const current = ++detailVersion.current;
    setSelected(null);
    setAction(null);
    setReason('');
    setMessage('Opening request…');
    try {
      const data = await researchRequest<TaskResponse>(`/${id}`);
      if (!active.current || current !== detailVersion.current) return;
      updateClock(data);
      setSelected(data.task);
      setMessage('');
    } catch (error) {
      if (active.current && current === detailVersion.current) setMessage(failed(error));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mutationBusy.current) return;
    let submission: ResearchDraft;
    try {
      submission = prepareResearch(draft, () => crypto.randomUUID());
    } catch (error) {
      setMessage(failed(error));
      return;
    }
    onDraft(submission);
    mutationBusy.current = true;
    setBusy(true);
    setMessage('Saving request…');
    const current = ++detailVersion.current;
    try {
      const data = await researchRequest<TaskResponse>('/create', submission.pending!);
      if (!active.current) return;
      if (data.task.id !== submission.pending!.id)
        throw new Error('Request identity could not be confirmed. Check this request again.');
      updateClock(data);
      onDraft(acknowledgeResearch(submission, data.task.id));
      if (detailVersion.current === current) setSelected(data.task);
      setMessage(
        data.task.status === 'queued'
          ? 'Saved. Waiting for an agent connection.'
          : `Request recovered. ${taskState(data.task, Date.parse(data.server_time))}.`,
      );
      void load();
    } catch (error) {
      if (!active.current) return;
      // Only a definite validation refusal permits editing a new submission.
      // Network/provider/auth uncertainty retains the original task ID and input.
      if (error instanceof ResearchRequestError && error.status === 400)
        onDraft({ question: submission.question, pending: null });
      setMessage(failed(error));
    } finally {
      mutationBusy.current = false;
      if (active.current) setBusy(false);
    }
  }

  async function changeTask(kind: 'cancel' | 'retry') {
    if (!selected || mutationBusy.current) return;
    mutationBusy.current = true;
    setBusy(true);
    setMessage('Saving change…');
    const current = ++detailVersion.current;
    try {
      const body = {
        id: selected.id,
        version: selected.version,
        ...(kind === 'cancel' ? { reason } : {}),
      };
      const data = await researchRequest<TaskResponse>(`/${kind}`, body);
      if (!active.current || detailVersion.current !== current) return;
      updateClock(data);
      setSelected(data.task);
      setAction(null);
      setReason('');
      setMessage(
        kind === 'retry' ? 'Queued again. Waiting for an agent connection.' : 'Cancelled.',
      );
      void load();
    } catch (error) {
      if (active.current && detailVersion.current === current)
        setMessage(`${failed(error)} Reopen the request to check its saved state before retrying.`);
    } finally {
      mutationBusy.current = false;
      if (active.current) setBusy(false);
    }
  }

  const cancelAllowed = selected && ['queued', 'running', 'blocked'].includes(selected.status);
  const retryAllowed =
    selected &&
    (selected.status === 'blocked' ||
      (selected.status === 'running' && taskState(selected, now) === 'Claim expired'));

  function navigateAway(event: MouseEvent<HTMLAnchorElement>) {
    if (
      (draft.question || draft.pending || heldRecoveries > 0) &&
      !window.confirm(
        'This tab holds unsaved requests or recovery text. Leave and discard those local copies? Cancel to save or download them first.',
      )
    )
      event.preventDefault();
  }

  return (
    <div className="research-desk">
      <header className="research-header">
        <Link
          href="/"
          className="research-wordmark"
          aria-label="XIV website"
          onClick={navigateAway}
        >
          XIV
        </Link>
        <span className="research-private">PRIVATE AGENT DESK</span>
        <nav aria-label="Desk navigation">
          <a href="https://malosound.ai/" target="_blank" rel="noopener noreferrer">
            Journal ↗
          </a>
          <Link href="/desk/notes" onClick={navigateAway}>
            Saved notes
          </Link>
          <button type="button" onClick={onLogout} disabled={busy}>
            Sign out
          </button>
        </nav>
      </header>

      <main className="research-main">
        <div className="research-heading">
          <div>
            <p className="desk-eyebrow">RESEARCH ANALYST</p>
            <h1>Ask. Review. Prepare.</h1>
          </div>
          <span className="research-connection">
            <span aria-hidden="true" />
            No agent connected
          </span>
        </div>
        <form className="research-compose" onSubmit={submit}>
          <label htmlFor="research-question">What should we research?</label>
          <textarea
            id="research-question"
            value={draft.question}
            onChange={(event) => onDraft({ question: event.target.value, pending: null })}
            placeholder="Compare this week’s catalysts for my watchlist."
            rows={3}
            required
            disabled={busy || !!draft.pending}
          />
          <div className="research-compose-bottom">
            <p>
              {draft.pending
                ? 'Submission unconfirmed. Check again with the same request ID.'
                : 'Public sources. Saved requests wait until an agent is connected.'}
            </p>
            <button
              className="research-primary"
              type="submit"
              disabled={busy || !draft.question.trim()}
            >
              {busy ? 'Saving…' : draft.pending ? 'Check request' : 'Queue research'}
            </button>
          </div>
        </form>
        <p role="status" className="research-message">
          {message}
        </p>

        <div className="research-workspace">
          <section className="research-requests" aria-labelledby="research-requests-title">
            <div className="research-section-heading">
              <h2 id="research-requests-title">Requests</h2>
              <button
                type="button"
                disabled={loading || busy}
                onClick={() => {
                  void load();
                  if (selected) void openTask(selected.id);
                }}
              >
                Refresh
              </button>
            </div>
            {listMessage && (
              <p role="status" className="research-message">
                {listMessage}
              </p>
            )}
            {!tasks.length && (
              <p className="research-empty">
                {loading
                  ? 'Loading requests…'
                  : listMessage
                    ? 'Saved requests are unavailable.'
                    : 'Your first question starts here.'}
              </p>
            )}
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="research-task"
                    aria-pressed={selected?.id === task.id}
                    disabled={busy}
                    onClick={() => void openTask(task.id)}
                  >
                    <span className="research-task-question">{task.question}</span>
                    <span className={`research-state research-state-${task.status}`}>
                      {taskState(task, now)}
                    </span>
                    <time dateTime={task.created_at}>
                      {new Date(task.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
            {nextOffset !== null && (
              <button
                type="button"
                className="research-more"
                disabled={loading || busy}
                onClick={() => void load(nextOffset)}
              >
                {loading ? 'Loading…' : 'Older requests'}
              </button>
            )}
          </section>

          <section className="research-result" aria-label="Research request and result">
            {!selected ? (
              <div className="research-result-empty">
                <span aria-hidden="true">↗</span>
                <h2>Give your research a place.</h2>
                <p>Select a request to see its state, answer, and sources.</p>
              </div>
            ) : (
              <>
                <div className="research-section-heading">
                  <span className={`research-state research-state-${selected.status}`}>
                    {taskState(selected, now)}
                  </span>
                  <span className="research-version">v{selected.version}</span>
                </div>
                <h2 className="research-question">{selected.question}</h2>
                {selected.status === 'queued' && (
                  <p className="research-empty">
                    Saved privately. No agent has claimed this request.
                  </p>
                )}
                {selected.status === 'running' && (
                  <p className="research-empty">
                    {taskState(selected, now) === 'Claim expired'
                      ? 'The last claim expired. Its worker cannot save a result without a new claim.'
                      : 'A claim is recorded. This screen does not establish that a worker is currently online.'}
                  </p>
                )}
                {selected.status === 'blocked' && (
                  <p className="research-reason">{selected.blocked_reason}</p>
                )}
                {selected.status === 'cancelled' && (
                  <p className="research-reason">{selected.cancel_reason}</p>
                )}
                {selected.result && (
                  <div className="research-answer">
                    <p className="research-answer-text">{selected.result.text}</p>
                    <h3>Sources</h3>
                    <ul className="research-sources">
                      {selected.result.sources.map((source, index) => {
                        const href = safeSourceHref(source.url);
                        return (
                          <li key={`${index}-${source.url}`}>
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {source.title} ↗
                              </a>
                            ) : (
                              <span>{source.title} · link unavailable</span>
                            )}
                            <small>
                              Retrieved {new Date(source.retrieved_at).toLocaleString()}
                            </small>
                          </li>
                        );
                      })}
                    </ul>
                    {selected.result.limitations && (
                      <div className="research-limitations">
                        <h3>Limits</h3>
                        <p>{selected.result.limitations}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="research-actions">
                  {retryAllowed && (
                    <button type="button" disabled={busy} onClick={() => void changeTask('retry')}>
                      Queue again
                    </button>
                  )}
                  {cancelAllowed && !action && (
                    <button type="button" disabled={busy} onClick={() => setAction('cancel')}>
                      Cancel request
                    </button>
                  )}
                </div>
                {action === 'cancel' && (
                  <form
                    className="research-cancel"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void changeTask('cancel');
                    }}
                  >
                    <label htmlFor="research-cancel-reason">Reason for cancellation</label>
                    <input
                      id="research-cancel-reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      required
                      disabled={busy}
                      maxLength={4000}
                    />
                    <button type="submit" disabled={busy || !reason.trim()}>
                      Confirm cancellation
                    </button>
                    <button type="button" disabled={busy} onClick={() => setAction(null)}>
                      Keep request
                    </button>
                  </form>
                )}
                <details className="research-provenance">
                  <summary>Request details</summary>
                  <dl>
                    <dt>Request</dt>
                    <dd>{selected.id}</dd>
                    <dt>Created</dt>
                    <dd>{new Date(selected.created_at).toLocaleString()}</dd>
                    <dt>Updated</dt>
                    <dd>{new Date(selected.updated_at).toLocaleString()}</dd>
                    <dt>Scope</dt>
                    <dd>Public primary sources</dd>
                    {selected.worker_session && (
                      <>
                        <dt>Recorded claimant</dt>
                        <dd>{selected.worker_session}</dd>
                      </>
                    )}
                  </dl>
                </details>
              </>
            )}
          </section>
        </div>
        <footer className="research-footer">
          Private research · Agent connection in progress · No orders
        </footer>
      </main>
    </div>
  );
}
