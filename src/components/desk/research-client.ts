import type { ResearchTaskSummary } from '../../lib/desk/research';

export type ResearchDraft = {
  question: string;
  pending: { id: string; question: string } | null;
};

export const emptyResearchDraft = (): ResearchDraft => ({ question: '', pending: null });

/** Keep the identity after an uncertain response: retrying must not create another task. */
export function prepareResearch(draft: ResearchDraft, newId: () => string): ResearchDraft {
  if (draft.pending) return draft;
  if (!draft.question.trim() || [...draft.question].length > 12000)
    throw new Error('Enter a question, up to 12,000 characters.');
  return { question: draft.question, pending: { id: newId(), question: draft.question } };
}

export function acknowledgeResearch(draft: ResearchDraft, id: string): ResearchDraft {
  return draft.pending?.id === id ? emptyResearchDraft() : draft;
}

export function researchRecovery(draft: ResearchDraft) {
  if (!draft.question && !draft.pending) return null;
  return {
    filename: `xiv-desk-${new Date().toISOString().slice(0, 10)}-recovery.txt`,
    text: JSON.stringify(
      {
        kind: 'XIV research request recovery',
        question: draft.question,
        pending: draft.pending,
        note: draft.pending
          ? 'Submission is unconfirmed. Check this task ID before submitting another request.'
          : 'Unsent question. No agent has received it.',
      },
      null,
      2,
    ),
  };
}

export function taskState(task: ResearchTaskSummary, serverNow: number) {
  if (task.status === 'running') {
    const expiry = Date.parse(task.lease_expires_at || '');
    if (!Number.isFinite(expiry)) return 'Status unavailable';
    return expiry <= serverNow ? 'Claim expired' : 'Claimed';
  }
  return {
    queued: 'Waiting for an agent',
    completed: 'Result saved',
    blocked: 'Needs attention',
    cancelled: 'Cancelled',
  }[task.status];
}

export function safeSourceHref(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export class ResearchRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function researchRequest<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/desk/research${path}`, {
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
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ResearchRequestError(response.status, 'The desk returned an unreadable response.');
  }
  if (!response.ok)
    throw new ResearchRequestError(
      response.status,
      typeof data?.error === 'string' ? data.error : 'The request could not be completed.',
    );
  return data as T;
}
