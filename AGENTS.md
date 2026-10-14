This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Web target (GitHub Pages PWA)

The app is shipped as a static web export (`npx expo export -p web`, `web.output: "single"`) on GitHub Pages under the subpath in `experiments.baseUrl`; deploys run from `.github/workflows/deploy-pages.yml`. Do not assume a native build.

- Everything must work in the browser (react-native-web). `Alert.alert` is a no-op there — use `confirmAction` from `src/lib/confirm.ts`. `expo-image-picker`'s `allowsEditing`/`aspect`/`quality` and `RefreshControl` (pull to refresh) have no effect on web. Guard native-only modules with `Platform.OS`, and import them lazily if they don't list web support (see `src/lib/shirt-images.ts`).
- `EXPO_PUBLIC_*` values are inlined at build time. In CI they come from repository **variables** (not the local `.env`), so a new variable must also be added there.
- Auth is Supabase email/password (`src/hooks/use-auth.tsx`). `Stack.Protected` only hides routes on the client; real access control is RLS, so any new table needs RLS policies for `authenticated` only, in a migration.
- Links in `public/index.html` and `public/manifest.json` are not prefixed by Expo; keep them in sync with `experiments.baseUrl`.

## Database changes (Supabase)

The database is changed by hand in the Supabase SQL Editor, so every change must be runnable on its own against the database as it already exists.

- Every database change (tables, columns, functions, RLS policies, storage buckets, seed data) goes in a **new** SQL file in `supabase/migrations/`, named sequentially: `migration01.sql`, `migration02.sql`, `migration03.sql`, … The next number is the highest existing one + 1.
- Never edit a migration that was already applied, and never recreate a single "full schema" file. Fixes and follow-ups are a new migration.
- A migration contains only what changes relative to the previous migrations. Open it with a comment saying what it does and which migration it depends on.
- Make it safe to re-run when possible: `create or replace function`, `if not exists`, `drop policy if exists` before `create policy`, `on conflict ... do update`. `create table if not exists` does **not** add columns to an existing table — use `alter table ... add column if not exists`.
- Keep `src/lib` in sync: only use tables, columns, functions and buckets that exist in a migration.
- When you add a migration, tell the user exactly which file(s) to run (only the new ones) and update the list in `README.md`.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
