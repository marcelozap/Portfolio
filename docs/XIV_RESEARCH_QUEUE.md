# XIV private research queue

XIV is where Marcelo directs his agents. End-of-day journaling belongs on MaloSound.ai. This queue stores research assignments and evidence separately from the existing day/card storage.

## Delivery stage

The database foundation, private API and agent screen are implemented. Migrations0002 and0003 were applied once, in order, to the existing production database on September 8; catalog checks confirmed permissions, empty research tables and unchanged existing membership/note data. The matching website release is prepared for the existing Vercel project; verify its deployment separately. No worker, model or scheduler is connected by these additions. The existing Codex/Claude development loops do not consume this queue yet. Owner sign-in and one real request-to-result exchange still need verification.

The migration is `supabase/migrations/202609080002_xiv_research_tasks.sql`; the capability additions are in0003. Both are already applied to the configured production project and are deliberately non-idempotent. Inspect the actual catalog before retrying an uncertain application. Do not rerun0001, recreate membership or import local trading history.

## Request and state

Each request preserves its exact question, including whitespace, under an owner-scoped UUID. Version 1 has one role, `research_analyst`, and one scope, `public_primary_sources`. Task text is data within the owner's authorized research scope; it does not authorize orders, spending, publishing, new access or arbitrary commands.

Creation uses a client-generated task UUID and expected version 0. An identical create retry returns the existing task without another event, including when that task has since advanced. Reusing the UUID for a different question or scope is a conflict.

| Action     | Required state                                 | Result                                                         |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `create`   | No task; expected version 0                    | `queued`; no worker identity or invented activity              |
| `claim`    | `queued`, exact version                        | `running`, a fresh claim UUID and server-timed 15-minute lease |
| `renew`    | Running, matching live claim and exact version | Same worker; lease extended from the server clock              |
| `complete` | Running, matching live claim and exact version | Immutable completed result with source references              |
| `block`    | Running, matching live claim and exact version | `blocked`, with a required reason                              |
| `cancel`   | Queued, running or blocked; exact version      | Terminal `cancelled`, with a required reason                   |
| `retry`    | Blocked or a running task whose lease expired  | `queued` with the prior attempt preserved in history           |

Every mutation advances the version and appends one immutable event with a full resulting-task snapshot in the same transaction. Failed validation, stale versions and lost claims change neither task nor event history. Completed/cancelled tasks cannot be rewritten. A new question needs a new task ID.

A lease prevents an expired worker from later publishing a result into a reclaimed task. It does not stop that worker's process or prove that it is alive. There is no automatic reclaim, retry or dispatch. A future bridge must stop work after losing its claim, renew while working and check actual state after an uncertain response before doing anything twice.

## Storage and interface

`xiv_research_tasks` stores current state. `xiv_research_events` stores immutable transitions. Both restrict reads to the authenticated owner with enabled membership. Authenticated clients have no direct insert, update or delete permission.

All mutations use `xiv_research_apply(p_task_id, p_expected_version, p_action, p_payload)`, returning the full resulting task as JSON. The function derives ownership from `auth.uid()`; no caller-supplied owner or timestamp is accepted. It locks owner/task identity, checks enabled membership, validates exact payload fields and records the transition atomically. Its search path is fixed.

| Action     | Exact payload fields |
| ---------- | -------------------- |
| `create`   | `question`, `scope`  |
| `claim`    | `worker_session`     |
| `renew`    | `claim_id`           |
| `complete` | `claim_id`, `result` |
| `block`    | `claim_id`, `reason` |
| `cancel`   | `reason`             |
| `retry`    | None; `{}`           |

Question text is nonblank and at most 12,000 characters. Result objects contain exactly `text`, `sources` and `limitations`: nonblank text up to 20,000 characters; 1–30 bounded HTTPS source references with `url`, `title`, and a valid UTC `retrieved_at`; and limitations up to 4,000 characters. The complete result is limited to 100,000 bytes of PostgreSQL JSONB text serialization. Source URLs use a conservative ASCII HTTPS subset with dotted DNS names, no credentials, up to 2,000 characters; titles are nonblank and up to 300 characters. Retrieval timestamps require an actual calendar date and UTC `Z`, with optional 1–6 fractional second digits. Inability to obtain sources belongs in a blocked reason, not an invented citation.

Worker session labels and source references are assertions made by the future authenticated bridge. Database validation does not prove that an agent ran, a URL is authoritative, the linked source supports the answer, or financial data are correct. The bridge must derive the actual known session identity itself, preserve evidence and keep unavailable values explicit. Nothing is promoted to Gold by completion.

Expected database errors are `42501` for unauthorized/missing-owner access, `22023` for invalid input and `40001` for stale versions or invalid transitions. A future API must map them to appropriate access, validation and conflict responses without exposing other owners' records.

## Validation and next integration

`npm run test:research-queue` exercises the actual SQL in isolated PGlite with synthetic identities. The same suite is included in `npm run test:desk`. The 19 queue tests cover ownership, membership revocation, direct-write denial, exact/idempotent creation, exclusive claims, expiry fencing, atomic history, sourced results, retry/cancel behavior and persistence after database reopening. PGlite uses one database session: lock inspection and sequential conflicting claims do not prove live multi-connection contention behavior. Audit immutability applies to authenticated/anonymous client privileges; database administrators retain their normal authority.

The API tests use an injected synthetic SDK and the screen was exercised in an isolated synthetic browser fixture. These checks do not prove a live owner session or actual research-agent execution. Before enabling this in production, review and apply only the second migration, publish the tested private integration, then connect one existing authorized session through a deliberate private bridge. Do not extract browser credentials, create a public control endpoint, silently start paid API calls or display fabricated running status. Pending password recovery does not prevent these offline implementation steps.

## Website interface

`/desk` now opens the research screen after the existing owner gate. `/desk/notes` preserves the earlier notes interface and its saved data. The research screen offers a question, saved requests, actual recorded state, sources and limitations. Its connection indicator explicitly says **No agent connected**. A running database row is shown as a recorded claim, with expiry derived from the server clock, not proof of an online worker. Refresh is manual.

All routes below share the existing owner/member verification, same-origin request marker, HttpOnly session handling and private no-store responses:

| Route                            | Input                                         | Response                                                       |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `GET /api/desk/research`         | Optional single `offset`, integer 0–1,000,000 | Up to 20 summaries, `next_offset`, `server_time`, `connection` |
| `GET /api/desk/research/:id`     | Canonical UUID; no query fields               | Full `task`, `server_time`, `connection`                       |
| `POST /api/desk/research/create` | Exact `{id, question}`                        | Saved or recovered task; scope fixed by server                 |
| `POST /api/desk/research/cancel` | Exact `{id, version, reason}`                 | Version-checked cancelled task                                 |
| `POST /api/desk/research/retry`  | Exact `{id, version}`                         | Version-checked queued task                                    |

Worker claim, renew, complete and block actions have no browser API route. Responses omit database owner and claim IDs, validate stored shape and never expose provider diagnostics. Ordering is creation time then UUID, newest first. Offset pages are a bounded view, not a frozen snapshot: new requests can shift later pages; refresh starts again, and the screen deduplicates loaded identities.

If a create response is uncertain, the screen locks the original question and retries the same UUID. It clears input only after the matching saved identity returns. Auth loss closes the private screen while retaining the draft and its pending identity in the same tab; text export includes that identity so it can be checked before another submission. Unsent and recovery text remain local until successfully queued. Leaving the tab can lose them: navigation guards and exports help preserve them, but this is not browser-restart recovery. Completed results are rendered as plain text with HTTPS source links; no generated HTML executes.
