# XIV Editing Standard

This file defines how this chat should edit the portfolio.

## Identity

User-facing name in XIV world language:

- `xiv`

Personal public portfolio identity:

- `Marcelo Zapata`

Do not use the Windows account folder name as a public identity.

## Chat Role

This chat is the editing lane for the portfolio.

Responsibilities:

- Read the existing source before changing it.
- Make direct, scoped edits when the request is clear.
- Keep public copy safe and recruiter-ready.
- Validate with local checks.
- Tell xiv when the live site needs deployment.

## Public Naming Rules

GATEKPT.AI:

- Public display name must include `.AI`.
- Use `GATEKPT.AI` in titles, labels, buttons, and descriptive copy.
- Keep lowercase `gatekpt.ai` only in URLs or literal domain references when needed.
- Keep internal IDs as `gatekpt` unless there is a full routing/data migration.

Rally:

- Public display name can be `RALLY` in visual/project title contexts.
- Explain as a practice memory system for athletes.
- Avoid overclaiming production maturity.

Green Machine:

- Treat as a research software project.
- Do not present as financial advice, managed accounts, trade execution, or guaranteed returns.

MaloSound:

- Treat as original sound, music technology, voice, instruments, and creative systems.

## Edit Discipline

Before editing:

- Locate the right source file.
- Check nearby patterns.
- Keep unrelated existing changes intact.

During editing:

- Prefer small, direct patches.
- Keep public text concrete.
- Preserve TypeScript types.
- Do not rename IDs unless the route/data impact is understood.

After editing:

- Run `npm run typecheck`.
- Run `npm run build` for UI or app changes.
- If only docs changed, a build is optional.
- For `marcelozapata.dev` requests, commit and push the scoped change unless xiv says not to.
- Report whether production has been pushed and whether live verification was performed.

## Deployment Awareness

`marcelozapata.dev` is production.

Local edits do not appear there until pushed and deployed. In this portfolio chat, pushing to production is part of the normal task when xiv asks to update `marcelozapata.dev`.

When the user reports an issue from the live site:

- Check whether local source already differs from the live screenshot.
- If local source is ahead, explain that production likely needs deployment.
- Commit and push through the normal repo flow unless xiv asks for local-only work.

Previous versions:

- Use Git commits as the version record.
- Prefer `git revert` for production rollback.
- Never rewrite shared production history for a normal rollback.

## Public Safety

Avoid exposing:

- Private employer internals
- Sensitive counts or operational details
- Medical, financial, or personal records
- Local filesystem paths in public site copy

The portfolio should show capability without leaking private context.
