# Deployment Standard

This is the default operating rule for changes to `marcelozapata.dev`.

## Default Meaning

When xiv asks to change, fix, update, polish, or add something on `marcelozapata.dev`, assume the complete task is:

1. Edit the local portfolio source.
2. Validate the site locally.
3. Commit the scoped portfolio changes.
4. Push to `origin/main`.
5. Let Vercel build production.
6. Report clearly whether production has been pushed and what still needs live verification.

Do not stop at local source unless xiv explicitly says local-only, draft-only, no push, or no deploy.

## Safety Standard

Keep every production change reversible.

Before pushing:

- Check `git status --short`.
- Stage only the files that belong to the requested portfolio change.
- Avoid staging unrelated career-kit, package, generated log, or asset changes unless requested.
- Run validation.
- Use a clear commit message.

Validation for source/UI changes:

```bash
npm run typecheck
npm run build
```

Validation for docs-only changes:

- No build required, but a quick status check is required.

## Previous Versions

Git is the version history.

Every pushed production change should have:

- A commit with a focused message.
- A clean explanation of what changed.
- A note if unrelated local changes were left unstaged.

Rollback path:

```bash
git log --oneline -5
git revert <commit-sha>
git push origin main
```

Use `git revert`, not history rewriting, for production rollbacks.

## Vercel Awareness

The site is linked to Vercel.

Project metadata:

- Vercel project file: `.vercel/project.json`
- Vercel config: `vercel.json`
- Production domain: `marcelozapata.dev`

Normal production deploy comes from pushing `main`.

After push:

- Vercel should build automatically.
- The live site may lag briefly.
- If the live browser still shows old content, check for Vercel build completion or browser cache.

## Live Verification

After deploy, verify the exact user-visible issue:

- For modal/layout changes, open the live page and inspect the affected viewport.
- For copy changes, confirm the live text.
- For links, hover/click the target and confirm it routes correctly.

If browser tooling is not used, say that production was pushed but live visual verification was not performed.
