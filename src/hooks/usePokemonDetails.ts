import { use } from "react";
import { getPokemonDetails } from "../api/pokemonResource";
import type { Pokemon } from "../types/pokemon";

/**
 * Suspends until every named Pokemon's full detail has loaded, resolving to
 * an array in the same order as `names`. Must be rendered inside a
 * <Suspense> boundary, with an ErrorBoundary nearby to catch a failed fetch.
 */
export function usePokemonDetails(names: string[]): Pokemon[] {
  return use(getPokemonDetails(names));
}
