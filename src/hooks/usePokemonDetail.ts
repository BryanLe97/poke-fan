import { use } from "react";
import { getPokemonDetail } from "../api/pokemonResource";
import type { Pokemon } from "../types/pokemon";

/**
 * Suspends until this one Pokemon's full detail has loaded. Must be
 * rendered inside a <Suspense> boundary, with an ErrorBoundary nearby to
 * catch a failed fetch — see PokemonCardSlot in BrowsePage.tsx for the
 * per-card version of that pairing.
 */
export function usePokemonDetail(name: string): Pokemon {
  return use(getPokemonDetail(name));
}
