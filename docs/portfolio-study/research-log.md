# Research Log

## 2026-08-13

Focus:

- Portfolio project section.
- GATEKPT.AI naming.
- Rally modal top clipping.
- Durable portfolio study packet.

Observations:

- Portfolio repo is separate from the XIV OS folder.
- Portfolio root is `C:\Users\Green Machine\Documents\Portfolio`.
- The site deploys through Vercel from `main`.
- The live screenshot showed older Rally copy than local source, which suggests production was behind local edits.

Decisions:

- Public AI project name should be `GATEKPT.AI`, not `GateKPT`.
- Internal project ID can remain `gatekpt`.
- Rally and GATEKPT.AI should share a family resemblance in motion: path, signal, motion loop.
- Modal content should not begin under the fixed navbar.

Edits made:

- Updated GATEKPT.AI public naming in source files.
- Added Rally-like animated path to the GATEKPT.AI card art.
- Adjusted project modal position and height.
- Shifted Rally modal visual content downward.
- Created `docs/portfolio-study/` documentation packet.

Open follow-up:

- Commit and push as the default when xiv asks to update `marcelozapata.dev`.
- Verify `marcelozapata.dev` after Vercel deploy.
- Consider adding screenshots to this study packet after final visual QA.

Additional decision:

- This portfolio chat should treat production delivery as part of the work, not as a separate reminder. Local-only changes must be explicitly requested.
