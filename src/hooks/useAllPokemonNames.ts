import { use } from "react";
import { getAllPokemonNames } from "../api/pokemonResource";
import type { NamedApiResource } from "../types/pokemon";

/**
 * Suspends until the full Pokemon name index has loaded (once, ever — see
 * getAllPokemonNames). Must be rendered inside a <Suspense> boundary, with
 * an ErrorBoundary nearby to catch a failed fetch.
 */
export function useAllPokemonNames(): NamedApiResource[] {
  return use(getAllPokemonNames());
}
