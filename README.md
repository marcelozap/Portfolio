# XIV_OS

> A cinematic operating system for a developer, builder, creator, and systems thinker.

XIV_OS is the portfolio + interactive digital identity of **XIV** — a developer
and creative technologist building tools, experiences, and ideas at the
intersection of engineering, markets, and music.

The site is not a template. It is built as a tiny operating system: a hero
"boot screen", a command palette, a persistent terminal, an architecture
diagram, and three deeply-themed project surfaces (GATEKPT · GREEN MACHINE ·
RALLY).

---

## Stack

| Layer            | Tech                                                          |
| ---------------- | ------------------------------------------------------------- |
| Framework        | [Next.js 14 (App Router)](https://nextjs.org) · React 18 · TS |
| Styling          | Tailwind CSS · CSS variables · glassmorphism system           |
| Motion           | Framer Motion · GSAP                                          |
| 3D / Interactive | React Three Fiber · Three.js · GLSL shaders                   |
| Tooling          | ESLint · Prettier (+Tailwind plugin) · Husky + lint-staged    |
| CI               | GitHub Actions (Node 20 · 22)                                 |
| Deploy           | Vercel                                                        |

---

## Project structure

```
src/
├── app/
│   ├── globals.css            # design tokens + utilities (glass, glow, etc.)
│   ├── layout.tsx             # root layout: fonts, providers, persistent shells
│   └── page.tsx               # section composition
├── components/
│   ├── layout/                # AmbientBackdrop, Navbar, Footer
│   ├── interactive/           # CustomCursor, CommandPalette, TerminalDock
│   ├── hero/                  # Hero, ParticleField (R3F), Typewriter, etc.
│   ├── sections/              # About, Experience, Engineering, Music
│   ├── projects/              # ProjectCard, ProjectModal, ProjectVisual
│   └── ui/                    # GlassCard, GlowButton, SectionHeader
└── lib/
    ├── projects.ts            # typed project catalog
    └── utils.ts               # cn(), clamp(), lerp(), …
```

---

## Run it locally

```bash
nvm use            # picks up .nvmrc → node 22
npm install
npm run dev        # http://localhost:3000
```

Useful scripts:

```bash
npm run lint           # next lint
npm run typecheck      # tsc --noEmit
npm run format         # prettier --write
npm run format:check   # CI gate
npm run build          # production build
npm run start          # serve build
```

---

## Interactive features

| Surface         | Trigger                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| Command palette | `⌘K` / `Ctrl K` — fuzzy search nav, projects, actions                            |
| Terminal dock   | backtick \`\` ` \`\` or the dock pill — try `help`, `open gatekpt`, `goto music` |
| Project modals  | click any project card · or `open <id>` in the terminal                          |
| Custom cursor   | two-layer cursor with hover-aware scaling, fine-pointer only                     |
| Reactive hero   | R3F particle field with parallax-to-cursor + drifting code fragments             |

All interactions respect `prefers-reduced-motion`.

---

## Design system

CSS variables in `globals.css` define the whole palette:

```css
--bg: 222 24% 4% --ink: 210 30% 96% --accent: 188 95% 62% /* electric cyan */ --accent-warm: 28 95%
  62% /* late-night amber */ --accent-cool: 268 80% 70% /* violet */ --signal- *: success / danger /
  warning;
```

Surfaces are composed via the `.glass`, `.glass-strong`, and `.scanline`
utilities defined in `globals.css`. Buttons go through `<GlowButton />` to keep
the chrome consistent.

---

## Deployment

The site is wired for **Vercel**:

1. Push to GitHub (`origin/main`).
2. Import the repository on [vercel.com/new](https://vercel.com/new).
3. Framework preset auto-detects **Next.js**. No env vars are required for the
   public site.
4. Subsequent pushes to `main` deploy production · feature branches deploy
   previews.

Optional manual deploy:

```bash
npm i -g vercel
vercel link
vercel --prod
```

---

## CI

`.github/workflows/ci.yml` runs on every push and PR against `main`:

- `prettier --check`
- `next lint`
- `tsc --noEmit`
- `next build`

Both Node 20.x and Node 22.x are exercised so the project stays portable.

---

## Roadmap

A live, opinionated roadmap. Items move from `concept` → `building` → `shipped`
as XIV_OS evolves.

| Item                                | State   | Notes                                              |
| ----------------------------------- | ------- | -------------------------------------------------- |
| AI assistant terminal (LLM-backed)  | concept | extend `TerminalDock` with an `ask` command        |
| Ambient audio system                | concept | small Web Audio mixer wired to mouse + scroll      |
| Interactive workstation scene (3D)  | concept | dedicated R3F scene for the engineering section    |
| MDX project CMS                     | concept | move `lib/projects.ts` into MDX with frontmatter   |
| Dedicated `/projects/[slug]` routes | concept | deep-linkable project pages w/ shared element anim |
| Per-project shader backdrops        | concept | each modal gets its own GLSL "weather"             |
| Bedroom covers audio player         | concept | actual audio with waveform-synced visuals          |
| Easter-egg key combos               | concept | `xiv-up-up-down…` etc.                             |

---

## License

MIT — see [`LICENSE`](./LICENSE).

> Crafted in the dark hours. Systems over noise.
