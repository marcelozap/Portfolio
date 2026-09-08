# Dragon Tape: compact trading workspace

September 8, 2026. Applies to `/play` and `/es/play`.

Marcelo's tablet screenshots showed the chart above tall equity and position
cards, with Buy/Sell below the visible screen. Equity and cash now sit in the
top-right account summary. Phones place the chart immediately above the compact
order panel; tablets, desktop and short landscape screens put them side by side.
Position and open P&L stay beside the controls. Fill history, average entry,
closed P&L, unlock progress and help are available under **Position & fills**.

Simulation remains visible. The canvas backing size follows its rendered size,
including redraw while paused, so axis labels keep a readable size after rotation.
There is one set of controls, with selected quantity exposed to assistive tech,
44px minimum touch targets and a status region for order feedback.

## Layout verification (before the sizing update)

Tested the production build through a local, same-origin iframe harness in the
in-app Chromium browser. Measurements used the iframe viewport and actual chart
and button rectangles, plus hit testing at each button's center. The harness
resets the viewport to the page top; measurements taken during an earlier smooth
scroll were discarded. Production security headers are unchanged: only the local
public-game preview proxy omits X-Frame-Options to allow nested app embedding.

| Viewport   | Chart and Buy/Sell visible together | Horizontal overflow |
| ---------- | ----------------------------------- | ------------------- |
| 320 × 568  | Yes                                 | None                |
| 375 × 667  | Yes                                 | None                |
| 390 × 844  | Yes                                 | None                |
| 768 × 1024 | Yes                                 | None                |
| 1024 × 768 | Yes                                 | None                |
| 667 × 375  | Yes                                 | None                |
| 1440 × 900 | Yes                                 | None                |

All order controls fit in the other six sizes. At 320 × 568, secondary
Flatten/Pause/Reset controls can require a short scroll; chart, quantity and
Buy/Sell remain visible. Spanish was also checked at 320 × 568, 375 × 667,
768 × 1024 and 667 × 375 with the same primary-control result.

Browser interaction checks covered quantity selection, Buy, Sell, Flatten,
Pause, Reset and opening fill details. With the generated price paused, a
five-contract buy/sell round trip incurred the existing $10 spread cost. A
subsequent one-contract buy/flatten incurred $2 more; equity and cash were
$9,988, position flat, closed P&L -$12. These are synthetic checks, not trading
results. The chart redrew when the paused viewport changed. Reload renders the
new layout; persistence behavior was not expanded.

`npm run build` passed, including TypeScript and ESLint. The changed files pass
Prettier and `git diff --check`. A second agent reviewed the diff read-only and
reported no actionable regression. No physical iPhone/iPad or Safari run is
claimed; their browser chrome and text-size settings can reduce usable space.

## Original layout scope

This is a layout and canvas-rendering change. The existing generated-price
model, spread, order sizing, unlock rules and browser-only game behavior remain.
At that checkpoint, only best equity and the unlock flag persisted under the existing game key;
positions and fill history still reset on reload. No private-desk login, agent
connection, billing, broker integration or real trading records were changed.

## Long and short from the start

The subsequent September 8 request moves progression to position size. A fresh
run can buy or short immediately. Buttons show **Buy / Short** while flat,
**Cover / Short** while short, and **Buy / Sell** while long. An opposite order
only closes owned quantity; it never flips the position. Flatten remains available.

Sizing uses the saved best marked equity, including unrealized P&L:

| Best equity | Maximum open contracts |
| ----------- | ---------------------- |
| $10,000     | 1                      |
| $10,700     | 5                      |
| $11,400     | 10                     |
| $12,100     | 14                     |

These are initial game-design thresholds, not a claim that reaching a return
target demonstrates trading skill. Tiers remain unlocked after a drawdown,
reset or reload. Clicking and hotkeys 1–4 use the same rules. The entry cap
applies to the entire open position, so repeated small orders cannot bypass it.
Higher quantities can still close an existing larger position when its entry
tier is unavailable. The next entry is checked again.

The existing local-storage key `xiv-dragon-tape-v1` now stores
`{"version":2,"best":12100}`. Existing numeric best-equity records migrate; the
obsolete `unlocked` Boolean is ignored. A Boolean alone grants no larger size.
Malformed, non-finite, string or below-start values return to the first tier.
Only peak progress is saved. There is no device sync; positions and fills reset
on reload, as before.

The price generator is unchanged. Buys/covers fill at mark + $0.01; sells/shorts
fill at mark − $0.01, using a 100× multiplier and no additional fees. A one-contract
flat-price round trip costs $2. Long entries require cash for the ask. New short
exposure cannot exceed equity after the opening spread. Covering remains possible
even after a severe adverse move: virtual cash may end negative. This game does
not add broker margin calls, liquidation or real option-pricing/expiration rules.

Focused verification: `node --import tsx --test tests/dragon-tape-rules.test.ts`
passed 17 deterministic tests, and `npm run typecheck` passed. Tests cover immediate
short/cover P&L, both spreads, threshold boundaries, legacy-save migration, reload
progress, cash/exposure checks, aggregate size limits, hotkeys, partial closes and
refusing accidental reversals. This is a code check, not a physical-device run or
a trading result. The compact layout and chart model are preserved.
