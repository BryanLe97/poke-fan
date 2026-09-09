import { useEffect, useState } from "react";
import { ApiError, fetchPokemonByName } from "../api/pokeapi";
import { toPokemon, type Pokemon } from "../types/pokemon";

// Detail lookups are cheap and immutable, so cache them across the whole app
// — flipping between pages or revisiting search results shouldn't re-fetch
// Pokemon we've already seen.
const detailCache = new Map<string, Pokemon>();

interface State {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
}

/** Fetches full details for a page of Pokemon names, in parallel. */
export function usePokemonDetails(names: string[]): State {
  const key = names.join(",");
  const [state, setState] = useState<State>({
    pokemon: [],
    loading: names.length > 0,
    error: null,
  });

  useEffect(() => {
    if (names.length === 0) {
      setState({ pokemon: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all(
      names.map(async (name) => {
        const cached = detailCache.get(name);
        if (cached) return cached;
        const detail = await fetchPokemonByName(name);
        const pokemon = toPokemon(detail);
        detailCache.set(name, pokemon);
        return pokemon;
      }),
    )
      .then((pokemon) => {
        if (!cancelled) setState({ pokemon, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load Pokemon details.";
        setState({ pokemon: [], loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
