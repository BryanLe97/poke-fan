import { fetchAllPokemonNames, fetchPokemonByName } from "./pokeapi";
import type { NamedApiResource, Pokemon } from "../types/pokemon";
import { toPokemon } from "../utils/toPokemon";

// Suspense reads state out of a *promise*, not a hook — `use()` suspends
// while it's pending, returns its value once resolved, and re-throws its
// rejection as a render error (for the nearest ErrorBoundary to catch). So
// instead of hooks that track { data, loading, error } themselves, this
// module just hands out cached promises; the hooks in src/hooks/ are thin
// `use()` wrappers around them.
//
// Rejected promises are deliberately left in the cache rather than evicted
// the instant they reject: React's own Suspense machinery re-renders a
// suspended component as soon as its promise settles, and that re-render
// must see the *same* (now-rejected) promise so `use()` re-throws it as a
// real error for the ErrorBoundary to catch. Evicting eagerly races that
// retry — the re-render would instead see a cache miss, kick off a brand
// new fetch, suspend again, and repeat forever without ever surfacing the
// error. Retrying is instead explicit: each ErrorBoundary's `onRetry` calls
// the matching `reset*` function below before clearing the boundary, so a
// stale rejection is only ever cleared on a user-initiated retry.

// --- Full name index -----------------------------------------------------

let namesPromise: Promise<NamedApiResource[]> | null = null;

/**
 * The full name+url index of every Pokemon, fetched once and cached for
 * the life of the session (PokeAPI has no text-search endpoint, so this is
 * what search filters client-side).
 */
export function getAllPokemonNames(): Promise<NamedApiResource[]> {
  namesPromise ??= fetchAllPokemonNames();
  return namesPromise;
}

/** Clears the cached name index so the next call re-fetches. */
export function resetAllPokemonNames(): void {
  namesPromise = null;
}

// --- Per-Pokemon detail ----------------------------------------------------

const detailCache = new Map<string, Promise<Pokemon>>();

/**
 * A single Pokemon's full detail, cached by name. Each Browse card and the
 * Pokemon detail page suspend on this individually — one card's fetch
 * being slow (or failing) never blocks or breaks the others, since there's
 * no combined Promise.all forcing everyone to wait for the same result.
 */
export function getPokemonDetail(name: string): Promise<Pokemon> {
  let promise = detailCache.get(name);
  if (!promise) {
    promise = fetchPokemonByName(name).then(toPokemon);
    detailCache.set(name, promise);
  }
  return promise;
}

/** Clears one cached detail so the next call re-fetches instead of
 *  replaying a stale rejection. */
export function resetPokemonDetail(name: string): void {
  detailCache.delete(name);
}
