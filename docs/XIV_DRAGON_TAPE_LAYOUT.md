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

## Verification

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

## Scope

This is a layout and canvas-rendering change. The existing generated-price
model, spread, order sizing, unlock rules and browser-only game behavior remain.
Only the best equity and unlock flag persist under the existing game key;
positions and fill history still reset on reload. No private-desk login, agent
connection, billing, broker integration or real trading records were changed.
