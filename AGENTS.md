This is a React + Vite + TypeScript PWA (mobile-first web app), published as a static site on GitHub Pages. There is no native app: everything runs in the browser.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server (http://localhost:5173/app_ponto_central/)
npm run build        # typecheck (tsc -b) + production build to dist/
npm run preview      # serve the production build locally
npm run typecheck    # typecheck only
npm run lint         # lint (oxlint)
```

Run lint and build before declaring any task done.

## Stack

- React 19, Vite 8, TypeScript (strict). Import alias `@/` → `src/`.
- Routing: **React Router** (`react-router`, declarative mode with `<BrowserRouter>`). All routes are declared in `src/App.tsx`; screens live in `src/pages/`, shared UI in `src/components/`, state in `src/hooks/`, data access in `src/lib/`.
- Styling: CSS Modules (`*.module.css` next to the component). Design tokens (colors, spacing, radius) are CSS variables in `src/index.css`; use them instead of hard-coded values. Join classes with `cx` from `src/lib/cx.ts`.
- Icons: `react-icons/io5` (Ionicons).
- Data/auth: Supabase (`@supabase/supabase-js`).

## Web target (GitHub Pages PWA)

The app is served from a subpath: `base` in `vite.config.ts` (`/app_ponto_central/`). Deploys run from `.github/workflows/deploy-pages.yml` on push to `main`.

- Never hard-code the subpath. Router links are relative to the `basename` (`import.meta.env.BASE_URL`); files in `public/` referenced from `index.html` with a leading `/` are prefixed by Vite automatically. `public/manifest.json` uses relative paths.
- GitHub Pages has no SPA fallback: the workflow copies `index.html` to `404.html` so deep links work.
- Use `confirmAction` from `src/lib/confirm.ts` for confirmations. To go back, use `useGoBack(fallback)` (handles screens opened directly by URL, where there's no in-app history).
- Mobile-first: layouts must work at phone width, respect `env(safe-area-inset-*)`, and keep touch targets ≥ 40px.
- `VITE_*` values are inlined at build time. In CI they come from repository **variables** (not the local `.env`), so a new variable must also be added there and in `.env.example`.
- Auth is Supabase email/password (`src/hooks/use-auth.tsx`). The route guards in `src/App.tsx` only hide screens on the client; real access control is RLS, so any new table needs RLS policies for `authenticated` only, in a migration.

## Database changes (Supabase)

The database is changed by hand in the Supabase SQL Editor, so every change must be runnable on its own against the database as it already exists.

- Every database change (tables, columns, functions, RLS policies, storage buckets, seed data) goes in a **new** SQL file in `supabase/migrations/`, named sequentially: `migration01.sql`, `migration02.sql`, `migration03.sql`, … The next number is the highest existing one + 1.
- Never edit a migration that was already applied, and never recreate a single "full schema" file. Fixes and follow-ups are a new migration.
- A migration contains only what changes relative to the previous migrations. Open it with a comment saying what it does and which migration it depends on.
- Make it safe to re-run when possible: `create or replace function`, `if not exists`, `drop policy if exists` before `create policy`, `on conflict ... do update`. `create table if not exists` does **not** add columns to an existing table — use `alter table ... add column if not exists`.
- Keep `src/lib` in sync: only use tables, columns, functions and buckets that exist in a migration.
- When you add a migration, tell the user exactly which file(s) to run (only the new ones) and update the list in `README.md`.
