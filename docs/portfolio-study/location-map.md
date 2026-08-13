# Location Map

This map explains where the portfolio work lives and which files should be edited for common changes.

## Root

`C:\Users\Green Machine\Documents\Portfolio`

Key root files:

- `README.md`: repo overview, stack, and deployment notes.
- `package.json`: scripts and dependencies.
- `vercel.json`: Vercel project framework settings.
- `.vercel/project.json`: linked Vercel project metadata.
- `.github/workflows/ci.yml`: CI checks for formatting, lint, typecheck, and build.

## App Routes

- `src/app/page.tsx`: homepage composition.
- `src/app/layout.tsx`: metadata, fonts, global shell.
- `src/app/globals.css`: design tokens, component utilities, base CSS.
- `src/app/rally/page.tsx`: Rally project page.
- `src/app/fsu-options-research/page.tsx`: Green Machine project page.

## Project Data

- `src/lib/projects.ts`: typed project catalog used by the project grid and modal.

Edit this when changing:

- Project names
- Taglines
- Project descriptions
- Metrics
- Stack pills
- Modal features
- Project URLs

Current naming rule:

- The public AI project name is `GATEKPT.AI`.
- Keep internal IDs and URLs lowercase, such as `gatekpt` and `https://www.gatekpt.ai`.

## Project UI

- `src/components/projects/Projects.tsx`: project grid and active modal state.
- `src/components/projects/ProjectCard.tsx`: homepage project cards and small animated card art.
- `src/components/projects/ProjectModal.tsx`: click-open project modal layout.
- `src/components/projects/ProjectVisual.tsx`: large modal visuals for project categories.

Recent issue area:

- Rally modal top clipping lives in `ProjectModal.tsx` and `ProjectVisual.tsx`.
- If live `marcelozapata.dev` still shows old text or clipping, the local repo may be ahead of production and needs deploy.

## Homepage Sections

- `src/components/hero/Hero.tsx`: first viewport, featured work, main positioning.
- `src/components/hero/MarketTicker.tsx`: ticker-style visual element.
- `src/components/sections/Experience.tsx`: experience section.
- `src/components/sections/About.tsx`: about section and public positioning copy.
- `src/components/sections/MaloSound.tsx`: sound/music layer.
- `src/components/sections/Music.tsx`: music section.

## Layout

- `src/components/layout/Navbar.tsx`: fixed top navigation.
- `src/components/layout/Footer.tsx`: footer links and closing copy.
- `src/components/layout/AmbientBackdrop.tsx`: background atmosphere.
- `src/components/layout/PersistentAudioPlayer.tsx`: bottom audio player.

## Shared UI

- `src/components/ui/GlassCard.tsx`
- `src/components/ui/GlowButton.tsx`
- `src/components/ui/SectionHeader.tsx`

## Career Kit

- `career-kit/`: resumes, LinkedIn copy, recruiter messages, interview prep, and related assets.

Keep career-kit changes separate from visual portfolio changes when possible.
