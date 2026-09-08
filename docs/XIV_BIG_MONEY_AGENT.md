# XIV Big Money Agent

September 8, 2026 direction: add public politician disclosures and institutional
filings to Marcelo's private preparation. They draft; Marcelo decides.

## What the desk offers

Four role cards link to `/desk?role=research`, `quant`, `journal` or `big-money`.
After owner login, available starters fill an editable question. Nothing queues
until the owner selects **Queue research**. Existing custom drafts and uncertain
submissions keep their text and request identity.

Research Analyst, public-company Quant and Big Money use the existing
`research_analyst` / `public_primary_sources` queue and approved session bridge.
These are question presets, not four independently connected workers. Connections
shows recorded approval, expiry and last contact; approval alone does not prove
that a worker is online. Owner approval and a real completed request/reload are
still required before claiming end-to-end availability.

Journal Coach remains unavailable until selected private journal evidence has a
separate permitted scope. No local Gold, trading history or MaloSound writing is
automatically uploaded. Existing login, task ownership and server checks apply.

## Evidence rules

- **Congress:** distinguish filer from owner (self, spouse, joint or dependent).
  Keep transaction date, public filing date and retrieval time separate. Amounts
  often are ranges; unknown dates and option details remain unknown. A signature
  date does not establish public availability. Transaction types such as exercise
  or donation must not become a new market buy.
- **Institutional filings:** Form 13F reports selected quarter-end holdings, not
  an execution tape. Filing managers are not necessarily hedge funds. Preserve
  CIK, accession, period, filing date and amendment relation. A restatement must
  not be summed with the original. Short positions and written options are not
  included; reported option values are not premiums paid.
- **Output:** who, instrument as disclosed, transaction or holdings period,
  filing date, size/range, evidence and gaps. A filing change is not proof of
  today's buying, conviction or total exposure. Historical context stays dated.
- **Coverage:** list exactly which people, managers and filings were checked.
  No claim to all politicians, funds, transactions or real-time movement. Senate
  access is unverified while its agreement screen awaits a deliberate decision.

Primary references: [House disclosures](https://disclosures-clerk.house.gov/FinancialDisclosure),
[House ethics guidance](https://ethics.house.gov/financial-disclosure/),
[Senate search](https://efdsearch.senate.gov/search/home/),
[SEC Form 13F FAQ](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/frequently-asked-questions-about-form-13f).

## Local record and scheduled work

`C:/XIV/trading/tools/xiv_big_money_ledger.py` maintains a dedicated, offline
SQLite receipt ledger under `C:/XIV/trading/research/big-money/`. It verifies
downloaded-byte hashes, records exact receipts and bounded coverage checks, and
keeps late imports out of earlier as-of views. It does not parse or prove the
claims inside a source, monitor independently, train a model or promote Gold.
Retained source files and draft briefs remain separate from actual trade records.

The same existing Codex heartbeat can inspect public sources when the saved
`next_due_at` is reached and checkpoint findings. It requires this computer and
the app to be running. No new scheduler or paid data/model service is added;
the existing September 19, 2026 at 23:52:32 UTC development stop remains.
SEC requests use an identifying User-Agent, bounded requests and caching; denied
sources become coverage gaps. See [SEC developer resources](https://www.sec.gov/about/developer-resources).

The first local source set is a historical Pelosi household PTR plus Citadel
filing metadata. It is a starting evidence record, not a watchlist-wide holdings
comparison or a completed cloud agent exchange. Read the dated local brief for
the exact scope and next due time.

## Verification

`npm run test:game` checks immediate short/cover behavior, spread and multiplier,
cash limits, aggregate sizing tiers and saved peak migration. `npm run test:desk`
includes role-starter guards alongside the existing access/bridge tests. The
offline ledger has separate temporary-fixture tests in XIV. Browser checks use
an isolated synthetic API fixture until the owner has approved the real session.
