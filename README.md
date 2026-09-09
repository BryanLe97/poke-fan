# Poke Fan

A fan site for browsing the Pokedex, favouriting Pokemon, and organising
favourites into your own custom groups — built for the MPF Front End
Developer "Site Build" interview exercise.

**Live site:** https://BryanLe97.github.io/poke-fan/

## Running locally

Requirements: **Node.js 20+** (any recent LTS works) and npm.

```bash
npm install
cp .env.example .env   # optional — see "Configuration" below
npm run dev             # http://localhost:5173/poke-fan/
```

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
npm test          # vitest (store unit tests)
```

### Configuration

| Variable                  | Required | Default                        |
| -------------------------- | -------- | ------------------------------- |
| `VITE_POKEAPI_BASE_URL`    | No       | `https://pokeapi.co/api/v2`     |

The API base URL isn't hardcoded in `src/api/pokeapi.ts` — it reads
`import.meta.env.VITE_POKEAPI_BASE_URL`, falling back to the public
PokeAPI instance so a fresh clone works with zero setup. Copy
`.env.example` to `.env` to override it locally (e.g. against a proxy or
mock server). PokeAPI needs no API key, so nothing here is actually a
secret, but keeping the endpoint out of source is what lets it change per
environment without a code change or a redeploy of different source.
CI/CD supplies the same variable at build time via a GitHub Actions repo
**Variable** (Settings → Secrets and variables → Actions → Variables →
`VITE_POKEAPI_BASE_URL`) rather than hardcoding it in the workflow file —
see `.github/workflows/deploy.yml`. A real secret (an API key, say) would
go through `secrets.*` instead of `vars.*` the same way.

## What it does

- **Browse** (`/`) — the full Pokedex (via [PokeAPI](https://pokeapi.co)),
  searchable by name, paginated, with a favourite toggle and type badges on
  every card.
- **Favourites** (`/favourites`) — everything you've starred, with a
  sidebar to filter by group, create new groups, and delete groups.
- **Pokemon detail** (`/pokemon/:name`) — stats, abilities, height/weight,
  and the same favourite/group controls, reachable by clicking any card.

Favouriting, grouping, and un-favouriting all persist to `localStorage`, so
your collection is still there next time you open the site.

## Architectural decisions

**Vite + React + TypeScript**, no meta-framework. This is a client-only app
against a public, unauthenticated API — there's no server-rendering,
auth, or SEO need that would justify Next.js's extra surface area for a
2-hour exercise. React Router handles the two-and-a-bit real pages
(Browse, Favourites, Pokemon detail) with an actual `<Routes>` tree and a
shared `Layout` (nav + skip link + footer), not a manual show/hide toggle.

**Zustand** for the one piece of real app state — favourites and groups
(`src/store/useFavouritesStore.ts`) — via a single store with the
`persist` middleware writing to `localStorage`. Everything else (search
text, current page, which group is selected) is local `useState` in the
component that owns it; it never needed to be global, so it isn't. Store
actions never mutate in place — every action returns a new object via
spread, which is what makes the array of unit tests in
`useFavouritesStore.test.ts` straightforward to write and trust.

**Data layer separation.** `src/api/pokeapi.ts` is the only file that
knows about PokeAPI's URLs and shapes; `src/hooks/` wraps it in two small
hooks (`useAllPokemonNames`, `usePokemonDetails`) that own loading/error
state and an in-memory cache; components and pages never call `fetch`
directly. PokeAPI has no text-search endpoint, so search is implemented by
fetching the ~1300-entry name index once (cached at module scope) and
filtering it client-side — far cheaper than any alternative that hits the
network per keystroke.

**Card component reuse.** `PokemonCard` takes only the four fields
(`id`, `name`, `sprite`, `types`) it actually renders, so the same
component works against a full `Pokemon` detail (Browse page) and the
trimmed `FavouritePokemon` record persisted to storage (Favourites page)
with no adapter code.

**Tailwind CSS v4** for styling — fast to write, keeps responsive
breakpoints and dark mode inline with the markup, and needs no separate
design system for a UI this size. **lucide-react** for icons (star,
search, folder, trash, chevrons) rather than text labels, and Google
Fonts (Poppins for body text, Bangers for headings) rather than the
system font stack.

## Trade-offs made for the 2-hour scope

- **No virtualization** on the Pokedex grid — pagination (24 per page)
  keeps the DOM small instead. Fine for ~1300 Pokemon; would revisit for a
  much larger dataset.
- **Groups are flat, unnamed-uniqueness-unchecked** — you can create two
  groups called "Team", and a group is just a list of Pokemon names (no
  nesting, no reordering, no editing a group's Pokemon from the group
  itself beyond the per-card picker).
- **Testing is store-only.** Five Vitest unit tests cover the
  favourites/groups store's logic (the highest-value, lowest-effort
  target), but there are no component or E2E tests yet.
- **No optimistic/offline handling beyond localStorage** — if PokeAPI is
  down, Browse shows a retry-able error state, but there's no offline
  cache of previously-viewed Pokemon beyond what's already favourited.

## What I'd do with more time

- Component tests (React Testing Library, already installed) for
  `PokemonCard`, `GroupPicker`, and the search/pagination interaction on
  `BrowsePage`; a couple of Playwright E2E flows (favourite → group →
  reload → still there).
- Debounce the search input and move filtering into a memoized selector
  if the name index ever grows enough to matter.
- Renaming/reordering groups from the Favourites sidebar, drag-and-drop
  between groups, and duplicate-name prevention.
- Infinite scroll (or a virtualized grid) as an alternative to numbered
  pagination.
- A proper 404/offline illustration and a service worker for true offline
  support, since the data is otherwise static and cacheable.
- Move the Pokemon type→colour map into design tokens shared with a
  proper light/dark theme toggle (currently dark mode only follows the OS
  setting).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) lints, tests, and builds
the app on every push to `main`, then deploys `dist/` to GitHub Pages via
`actions/deploy-pages`. The Vite `base` and the router's `basename` are
both set to `/poke-fan/` to match the project-pages URL. The build step
injects `VITE_POKEAPI_BASE_URL` from a repo Variable — see
[Configuration](#configuration) above.
