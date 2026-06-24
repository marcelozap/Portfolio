# Marcelo Zapata Portfolio

Personal portfolio for Marcelo Zapata, a software engineer working across reliable workflow systems, QA automation, data tools, internal tools, product systems, and independent builds.

This repository powers the public portfolio site. The current site is intentionally restrained: project-forward, professional, and focused on engineering range without exposing sensitive employer details.

## Stack

| Layer     | Tech                                                |
| --------- | --------------------------------------------------- |
| Framework | Next.js 14 App Router, React 18, TypeScript         |
| Styling   | Tailwind CSS, CSS variables, reusable UI primitives |
| Motion    | Framer Motion                                       |
| Visuals   | SVG and React-rendered project visuals              |
| Tooling   | ESLint, Prettier, Husky, lint-staged                |
| CI        | GitHub Actions on Node 20 and Node 22               |
| Deploy    | Vercel                                              |

## Project Structure

```text
src/
  app/                   # root layout, metadata, global styles, page composition
  components/
    hero/                # homepage hero and market ticker
    layout/              # navigation, footer, ambient backdrop
    interactive/         # command palette
    projects/            # project cards, modals, and visuals
    sections/            # Experience, Engineering, About, Music
    ui/                  # shared UI primitives
  lib/
    projects.ts          # typed project catalog
    utils.ts             # shared helpers
```

## Run Locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Public Positioning

The site highlights:

- Local Workflow OS: local-first workflow system for structured queues, role packets, and approval-gated automation
- musxiv Artist OS: AI-supported studio system for independent artists
- Green Machine: private market research cockpit, started in Fall 2021
- Rally: practice and activity-data product, started in 2025
- Professional experience framed around production discipline, QA automation, Azure/data workflows, internal tools, modernization, and reliable delivery

Avoid adding private employer details, internal counts, regulated-work specifics, or unsupported claims to public copy.

## Deployment

The site is deployed through Vercel from `main`.

1. Commit and push to `origin/main`.
2. Vercel builds and promotes the production deployment.
3. After deploy, verify the live site for stale public wording.

## CI

`.github/workflows/ci.yml` runs:

- Prettier check
- Next lint
- TypeScript check
- Next build

## License

MIT - see [`LICENSE`](./LICENSE).
