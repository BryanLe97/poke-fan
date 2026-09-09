import { useEffect, useState } from "react";
import { ApiError, fetchAllPokemonNames } from "../api/pokeapi";
import type { NamedApiResource } from "../types/pokemon";

// Module-level cache: the full ~1300-entry name index never changes within a
// session, so every component sharing this hook reuses one network request
// instead of re-fetching on every mount.
let cache: NamedApiResource[] | null = null;
let inflight: Promise<NamedApiResource[]> | null = null;

interface State {
  names: NamedApiResource[];
  loading: boolean;
  error: string | null;
}

export function useAllPokemonNames(): State & { retry: () => void } {
  const [state, setState] = useState<State>({
    names: cache ?? [],
    loading: cache === null,
    error: null,
  });
  // Bumped only by retry(), which also resets loading/error itself — the
  // effect below never needs to set "loading" synchronously on its own.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache) return; // already resolved by a previous mount

    // Deliberately NOT tied to an AbortController: `inflight` is a single
    // request shared by every mounted consumer of this hook (including
    // React 18 StrictMode's mount->unmount->mount dev cycle), so one
    // consumer unmounting must not cancel the fetch out from under the
    // others. We only guard the *state update* below, not the network call.
    let cancelled = false;
    inflight ??= fetchAllPokemonNames();

    inflight
      .then((names) => {
        cache = names;
        if (!cancelled) setState({ names, loading: false, error: null });
      })
      .catch((err: unknown) => {
        inflight = null;
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load Pokemon.";
        setState({ names: [], loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ names: [], loading: true, error: null });
    setAttempt((a) => a + 1);
  };

  return { ...state, retry };
}
