# XIV research bridge

This bridge lets an existing authorized Codex or Claude session read a private research request and return a sourced answer. It does not launch an agent, start a model, create a scheduler, place orders or ingest trading history. The desktop session performs the work with its existing tools and authorized scope.

## Current stage

Offline implementation: migration `202609080003_xiv_research_bridges.sql`, a local Node transport in `src/lib/desk/bridge-client.ts`, owner pairing controls and synthetic tests. No live capability has been issued, no owner has paired a session, and no production migration or deployment is established by these files. The website continues to say **No agent connected**. Protected local credential storage, the session adapter and a real end-to-end exchange remain next integration work.

## Owner controls

Open **Connections** inside the private research desk. Drop a descriptor JSON file or paste it into the focusable pairing area. The browser accepts only the four descriptor fields below, at most 4 KB. It does not accept a raw credential bundle, generate a token, copy a browser credential, or save pasted contents in browser storage. Review the session, identity and expiry, then choose **Allow research**. Merely loading a descriptor grants nothing.

The existing owner/member authentication and request-origin checks protect `GET /api/desk/research/bridges`, `POST /api/desk/research/bridges/register` and `POST /api/desk/research/bridges/revoke`. These routes call only the three owner RPCs. Responses contain six allowlisted metadata fields and a server timestamp; no digest, token or owner identity. Browser worker actions remain unavailable. Registration confirmation must match the descriptor's identity, session and exact expiry, including database microseconds.

An uncertain approval keeps the same validated descriptor in the parent screen, including when authentication closes the private controls. **Check approval** resubmits that same identity idempotently. Refreshing metadata cannot prove that a token digest matches, so it never silently clears an uncertain approval. Deliberately discarding local details does not revoke an existing approval; use **Revoke** and its confirmation for that. An expired descriptor is refused before a new attempt is recorded. Previously held uncertain details can still be deliberately dismissed.

Metadata shows approval, expiry, revocation and the age of actual recorded credential use. It never labels a session online. Lists requested before a mutation cannot overwrite its result or erase an uncertainty message. Connection controls stay collapsed until opened, keeping the research question central. Actual owner sign-in, descriptor import on a second device, pairing and delivery remain unverified.

## One deliberate connection

1. The existing session generates a 32-byte cryptographic random secret locally. Its separate pairing descriptor contains a random bridge UUID, the exact existing session label, SHA-256 digest and expiration. The secret is never part of that descriptor.
2. The signed-in, enabled owner reviews and approves this descriptor for their research queue. The server binds its own verified owner identity; a descriptor cannot choose a different owner or grant access itself. No anonymous issuance or browser-token extraction is involved.
3. The same local session retains the secret with a protected storage adapter. That adapter is not implemented by the transport library; do not place a live secret in a prompt, repository file, browser storage, URL, screenshot, log or model result. The current tests use unregistered synthetic credentials only.
4. During an existing authorized pass, the adapter reads the bounded queue, claims a specific version, and records the returned capability ID, claim ID, version and lease. It renews within the live lease while actually working. An expired/lost/revoked claim stops publication. Replacing credentials does not inherit old claims.
5. The session returns plain result text, source URLs and titles, actual retrieval timestamps and limitations. Unknown facts remain unknown. A failed or insufficient-source task is blocked with a reason. The owner reads the saved result on the private website.

The server does not remotely attest a Codex/Claude process. It proves possession of an owner-approved capability associated with the recorded session. A token, claim or recent read alone is not evidence that a model is online or that a result is accurate. Connection UI should show actual recorded checks and their age; never invent activity.

## Scope and fencing

The capability may read queued research plus its own claimed attempts, and may only claim, renew, complete or block. It cannot create, cancel or retry a question, read saved notes, change membership, write Gold or call a broker. Task text is data within Marcelo's authorized research scope; it cannot widen access, authorize spending, publish or execute arbitrary shell commands.

Ownership, session and token digest are immutable at registration. Expiration is bounded to 14 days and never later than the existing development stop, **2026-09-19T23:52:32Z**. Owner revocation blocks subsequent use. Enabled membership is checked independently. Claims and renewals last at most 15 minutes and are clamped to capability expiry. Identity, claim, version and time checks run with database locks; failed transitions leave task and audit unchanged.

Migration 0003 leaves 0001 and 0002 intact. It places the transition body in a private function with explicit trusted owner/actor arguments, then uses two authorization wrappers: the existing owner RPC permits create/cancel/retry; capability RPCs permit the four worker actions. Neither wrapper changes JWT context. Clients cannot call the private core or access the registry directly. The shared core preserves exact inputs, source validation and atomic resulting-task audit snapshots. Each claimed task records its bridge ID; retry clears the active binding while history retains prior attempts.

Registry/lifecycle records retain only credential digests and public metadata; task results and public metadata contain neither secret nor digest. The lifecycle audit records registration and revocation. Successful reads/writes update the last recorded check, but that timestamp is not a continuous worker heartbeat.

## Database interface

| Caller                      | Function                       | Inputs / outcome                                                                                 |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Authenticated enabled owner | `xiv_research_bridge_register` | Bridge UUID, exact session label, token SHA-256 and expiry; identical registration is idempotent |
| Authenticated enabled owner | `xiv_research_bridge_revoke`   | Bridge UUID; repeated revocation is idempotent                                                   |
| Authenticated enabled owner | `xiv_research_bridge_list`     | Own metadata only                                                                                |
| Capability holder           | `xiv_research_bridge_read`     | Bridge UUID, secret token and optional task UUID; bounded queue or permitted task                |
| Capability holder           | `xiv_research_bridge_apply`    | Bridge UUID, secret token, task UUID, expected version, allowed action, exact payload            |

Owner metadata contains `id`, `session`, `created_at`, `expires_at`, `revoked_at` and `last_seen_at`. Worker read returns `{tasks: [...]}` or `{task: ...}`; worker apply returns the task row. Rows include owner, bridge and claim identities so the local transport can verify the expected owner and actor before returning a safe task shape. Worker claim payload is `{}`: its session label comes from the registry, never from a worker-supplied field. Other worker payloads use the queue's existing `claim_id`, `result` or `reason` fields.

## Local transport

`ResearchBridgeClient` takes an explicit trusted project origin, publishable key, approved owner/bridge/session, secret and expiry. It reads no environment file or browser credential. It accepts only HTTPS Supabase project origins and publishable keys. RPC names are fixed; it never builds an arbitrary endpoint from task text. The publishable key travels in `apikey`, with no owner JWT or service-role key. This follows Supabase's [API key guidance](https://supabase.com/docs/guides/getting-started/api-keys); the scoped capability provides the separate research authorization.

The secret is sent only in a POST body over HTTPS to the configured project. Redirects are refused, browser cookies omitted, responses bounded to 4 MiB, requests timed out after 20 seconds, and provider diagnostics are not reflected. There is no automatic retry. Denial stops credential use; conflicts require a new read. An uncertain write requires reading the saved task before deciding what to do next, including after a malformed success response. The client requires the returned owner/task identity, capability/session, expected next version and action state to match.

Creating an identity or constructing a client makes no network call. Listing, reading or an explicit worker action is the only transport invocation. The library does not execute the research question, continuously poll, infer a claimant from a role label, or report connection success before a real response.

## Acceptance before live use

Run `npm run test:research-bridge` for the focused suites, or `npm run test:desk` for all desk checks. Synthetic tests establish owner privacy, private-core denial, safe registration, revocation/expiry, worker scope, capability-bound claims, stale/expired fencing, lease clamping, source rules, rollback and secret-free responses. Transport tests cover exact RPC envelopes, no redirects/cookies, configuration validation, response ownership and uncertainty without duplicate writes. PGlite has one connection; these tests cannot prove real concurrent connection scheduling or a production deployment.

September 8 offline verification: all 158 desk tests passed, including 20 bridge database, 15 bridge transport, 18 owner pairing API and 15 pairing helper tests. Type checking, lint, formatting and production build passed. Reviews caught a denial assertion with a missing task, expiry matching that lost microseconds, fractional display clocks, an expired-review dead end and a stale-list race around uncertain revocation. Each was corrected. The database denial test now starts with real queued and successfully claimed synthetic tasks, checks all worker actions after invalidation, and verifies task, audit and last-seen state remain unchanged.

An isolated browser fixture rendered the real research/pairing components with synthetic in-memory responses. It verified a lost approval response followed by access loss and same-identity recovery, one saved approval across three requests, an older list released after uncertain revocation retaining the warning, a fresh refresh showing revocation, and expiry during review producing no additional POST while leaving Discard available. A fixture parent held the nonsecret descriptor across unmount. These checks do not prove the actual auth gate, a file/clipboard import, cloud persistence, live capability use or a second device. No account or model was connected.

The temporary bridge database issuance tests require the actual clock to precede the September 19 stop. After that date, new registrations correctly fail: retire this bridge or deliberately revise its authorization and tests before resuming development. Do not bypass the deadline or spoof authentication to make issuance pass.

Before calling the bridge connected: complete the local protected adapter, verify the owner controls, apply only the new reviewed migrations, pair the actual existing session, and demonstrate one real request from the private website through claim/research/result back to the same task. Owner sign-in is still pending password recovery; independent offline implementation can proceed while Marcelo sleeps. Do not resend email or treat elapsed time as authorization. Add reviewed Gold-memory retrieval only after this basic exchange works, preserving decision-time versus retrospective evidence.
