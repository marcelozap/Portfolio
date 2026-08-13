# Status

Last updated: 2026-08-13

## Current State

The portfolio is a Next.js public site deployed through Vercel to `marcelozapata.dev`.

Local source is in:

`C:\Users\Green Machine\Documents\Portfolio`

The local repo currently includes recent edits that may not yet be reflected on the live domain until committed, pushed, and deployed.

## Recent Edits

GATEKPT.AI naming:

- Project display name changed from `GateKPT` to `GATEKPT.AI`.
- Public text now includes `.AI` where the project is named.
- Lowercase `gatekpt.ai` remains only where it is an actual URL.

GATEKPT.AI project card:

- Added a Rally-like animated path treatment to the card art.
- Kept the AI learning-map layer language: power, compute, data, model, app, eval, deploy.

Rally modal:

- Adjusted modal shell to open below the fixed navbar.
- Added a viewport-aware max height.
- Shifted Rally modal visual labels and court artwork downward so the top HUD is not cut off.

## Known Issue

The live screenshot from `marcelozapata.dev` still showed older Rally copy and the top visual clipping.

Interpretation:

- The browser is likely seeing a deployed build that predates the latest local changes, or a cached production build.
- The source fix exists locally, but production needs a deploy to reflect it.

## Validation

Recent local checks passed:

```bash
npm run typecheck
npm run build
```

## Deployment Notes

Production deploys from `main`.

Normal production path:

```bash
git add <changed-files>
git commit -m "Update portfolio project visuals and docs"
git push origin main
```

Then Vercel should build and promote the production deployment.

Default chat behavior:

- If xiv$ asks for a change to `marcelozapata.dev`, assume push/deploy is part of the task.
- Keep the commit scoped.
- Leave unrelated local changes unstaged.
- Use Git history as the previous-version record.

After deploy, verify:

- Rally modal top is visible.
- Rally modal text reflects current local source.
- GATEKPT.AI appears with `.AI` in public labels.
- No project modal content hides behind the fixed nav.
