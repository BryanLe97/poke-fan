# Poke Fan

A fan site for browsing the Pokedex, favouriting Pokemon, and organising
favourites into your own custom groups — built for the MPF Front End
Developer "Site Build" interview exercise.

**Live site:** https://BryanLe97.github.io/poke-fan/

## Requirements checklist

**Minimum requirements**
- Website & framework — 3 routed pages (`src/router.tsx`), Zustand for state (`useFavouritesStore.ts`).
- API usage — PokeAPI, list + detail endpoints (`src/api/pokeapi.ts`).
- Data features — search (`BrowsePage.tsx`), favourite/group (`PokemonCard.tsx`, `GroupPicker.tsx`), delete group/favourite (`FavouritesPage.tsx`).
- Storage — `localStorage` via Zustand's `persist` middleware.
- Hosting & code — GitHub Pages + GitHub Actions; a scaffold commit precedes the feature commits in history.
- Documentation — this file

**Optional**
- Error handling — per-card `<ErrorBoundary>` + retry (`PokemonCardError.tsx`), name-index error (`ErrorState.tsx`), empty search (`EmptyState.tsx`).
- Responsiveness — Tailwind responsive grid, mobile nav (`NavBar.tsx`).
- Accessibility — skip link, `aria-label`/`aria-pressed`/`role="alert"`, `:focus-visible` (`Layout.tsx`, `PokemonCard.tsx`, `index.css`).
- Testing — unit (`useFavouritesStore.test.ts`), component (`BrowsePage.test.tsx`), E2E (`e2e/`).
- CI/CD — `.github/workflows/deploy.yml`, lint → test → E2E → deploy.

## Evaluation factors — how this project addresses them

1. **Architecture & Code Structure** — `pokeapi.ts` (HTTP transport) is separate from `pokemonResource.ts` (cache/Suspense integration); each Browse card fetches independently instead of one shared `Promise.all` (see "Why Browse fetches each card independently" below).
2. **Framework familiarity** — React 19 `use()` + Suspense for data, React Router v7's data router (`loader`/`errorElement`) for the detail page, idiomatic Zustand selectors throughout.
3. **What was built** — real router + nav menu (not a link swap), icons (`lucide-react`) for favourite/group/search rather than text, Poppins/Bangers via Google Fonts rather than the system stack.
4. **State Management & Data Flow** — Zustand holds only favourites/groups; search and page live in the URL (`useSearchParams`) so Back/Forward work; everything else is local `useState`, never lifted further than it needs to be.
5. **UX & Responsiveness** — responsive grid, mobile nav, loading skeletons, debounced search, isolated per-card error/retry, click-outside-to-close group picker.
6. **Type Safety & Code Standards** — `strict: true`, oxlint clean, semantic HTML (`<nav>`, `<button>`, lists) throughout.
7. **Communication & validation** — this README's "Why …" sections explain the non-obvious decisions as they were made, not written after the fact.
8. **AI Usage** — built with Claude Code (Claude Sonnet 5) as a collaborative pair, including catching and fixing real bugs it introduced along the way (documented in the "Why …" sections above where relevant).

## Running locally

Requirements: **Node.js 20+** (any recent LTS works) and npm.

```bash
npm install
cp .env.example .env   # required — fill in the real value, see "Configuration & security" below
npm run dev             # http://localhost:5173/poke-fan/
```

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
npm test          # vitest (store unit tests)
```

## Framework and state management choices

**Vite** — fast dev server and build for a React SPA, minimal config, no
meta-framework overhead since this app has no SSR/auth/SEO need.

**React** — satisfies requirement 1 (Website & Framework) directly;
component-based, large ecosystem (React Router, Zustand, Testing
Library all first-class).

**Zustand over Redux**, chosen specifically to meet requirement 3 (Data
Features — favourite/group entities) and requirement 4 (Storage —
persist groups/favourites):
- No `<Provider>` wrapper, no reducers/action types/dispatch — `create()`
  returns a hook usable anywhere.
- Selector-based subscriptions (`useFavouritesStore((s) => s.favourites)`)
  so a component only re-renders when the exact slice it reads changes —
  same benefit Redux's `useSelector` gives, without the boilerplate.
- The `persist` middleware writes to `localStorage` automatically on
  every state change, satisfying requirement 4 with no manual
  `useEffect`/`localStorage.setItem` code.
- Redux Toolkit's DevTools/time-travel debugging and slice/thunk
  patterns solve problems this project's scope — one small domain model,
  no complex async flows — doesn't actually have.

## Configuration & security

The app talks to [PokeAPI](https://pokeapi.co/docs/v2) (`GET /pokemon`,
`GET /pokemon/{name}`). Its base URL is never hardcoded in source
(`src/api/pokeapi.ts` reads `import.meta.env.VITE_POKEAPI_BASE_URL`) —
even though PokeAPI needs no key and nothing here is technically a
secret, the intent is to treat *any* third-party endpoint as
configuration, not something baked into the repo, so the same pattern
holds the day it's a real credentialed API.

`.env.example` ships with an **empty** value on purpose:

```bash
cp .env.example .env
# then fill in VITE_POKEAPI_BASE_URL yourself
```

Running locally requires you to supply the real value — nothing sensitive
is committed as a "convenience default". Production doesn't need any of
this setup: the live site already works, because CI/CD injects the value
at build time from a GitHub Actions repository **Variable** (Settings →
Secrets and variables → Actions → Variables → `VITE_POKEAPI_BASE_URL`),
not from a hardcoded value in the workflow file — see
`.github/workflows/deploy.yml`. A real credential (an API key, say) would
go through `secrets.*` instead of `vars.*` the exact same way.

## Why the frontend does its own pagination

PokeAPI's list endpoint (`/pokemon?limit=&offset=`) does paginate
server-side — it returns `next`/`previous` page URLs — but each entry is
only `{ name, url }`, and there's no `?search=`/`?name=` filter. Once
the app filters that list by a search term client-side, the result no
longer lines up with PokeAPI's own page boundaries — there's no way to
ask the server for "page 2 of Pokemon matching 'char'". So the app
fetches the full ~1300-entry name index once (cheap — just name+url
pairs, cached for the session) and does its own filtering *and*
pagination against that list on the frontend.

## Why the fetch cache is a plain module-level Map

`detailCache` (in `pokemonResource.ts`) is a `Map` at module scope, not
component state — a singleton shared by every importer, so navigating
away and back resolves from cache instead of re-fetching.

Not worried about unbounded growth: the key is a Pokemon name, capped at
PokeAPI's own ~1300 total — not arbitrary input — so it tops out at a
few MB at most, and a reload clears it entirely anyway. That reasoning
only holds because the key space is fixed; a cache keyed by something
unbounded (a search query, a user id) would need an LRU or TTL cap
instead.

## Why Browse fetches each card independently, but the detail page uses a loader

**Browse** doesn't fetch a page's 24 cards with one `Promise.all` —
`Promise.all` rejects entirely the moment any single request fails,
discarding every result that already succeeded, so one bad Pokemon would
break the whole page. Instead, each grid slot has its own `<Suspense>` +
`<ErrorBoundary>` pair (`PokemonCardSlot` in `BrowsePage.tsx`), fetching
independently via `getPokemonDetail(name)`/`usePokemonDetail(name)`. A
failed card shows its own `PokemonCardError` + Retry in just that slot,
with the rest of the grid unaffected.

**The Pokemon detail page** only ever needs one item, and it's usually
already in the same cache from Browse — so instead of a hand-rolled
Suspense boundary, it uses React Router's own `loader`
(`pokemonDetailLoader` in `router.tsx`), awaited before the route
renders, with `errorElement` for a failed fetch, via `<Outlet>`.

## CI/CD

`.github/workflows/deploy.yml` runs on every push to `main`: install →
lint → unit tests → E2E tests (`npm run test:e2e`, Playwright — see
`e2e/README.md` for why that suite is kept small) → deploy to GitHub
Pages. `deploy` needs `build` to succeed, so any failing step stops the
pipeline before a broken build ever gets deployed. The E2E run already
builds the app to test against; that same `dist/` is what gets deployed,
not a second build.

