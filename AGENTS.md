# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Astro static site** (`apps`) that generates per-app landing pages plus shared privacy/terms/support legal pages. There is no backend, database, or external service, and no secrets/`.env` are required.

### Services

There is one service: the Astro dev server. Standard commands live in `package.json` and are documented in `README.md`; notable ones:

- `npm run dev` — dev server on `http://localhost:4321/` (host `localhost` only; add `--host` to expose).
- `npm run lint`, `npm run test`, and `npm run check` are all aliases that run `astro check` (type/content diagnostics). There is no separate unit-test runner.
- `npm run build` — static output to `dist/`; `npm run preview` serves the built output.

### Non-obvious notes

- Requires Node.js 22 (CI pins Node 22). The environment already has a compatible Node.

- Apps are registered by presence of `src/apps/<slug>/config.ts` (see `src/apps/index.ts`). The dev server hot-reloads newly scaffolded apps automatically — no restart needed after `npm run new-app`.
- Scaffold a new app with `npm run new-app <slug> "<Display Name>" [support-email]`; slugs `support`/`privacy`/`terms`/`index` are reserved.
- OG images (1200×630, per app × locale) are generated at build time by `src/pages/og/[locale]/[slug].png.ts` (Satori + resvg, fonts from `@fontsource/noto-sans-jp`). Keep box-shadow blur ≤ ~60px there — larger blurs make resvg panic and kill the build.
- Routes: `/<slug>/` (landing), `/<slug>/privacy/`, `/<slug>/terms/`, `/<slug>/support/`. Legal pages share `LegalLayout` and apply per-app theme colors from `config.ts`.
