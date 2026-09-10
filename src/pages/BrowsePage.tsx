import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAllPokemonNames } from "../hooks/useAllPokemonNames";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { resetAllPokemonNames, resetPokemonDetails } from "../api/pokemonResource";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";
import { PokemonCard } from "../components/PokemonCard";
import { LoadingSkeletonGrid } from "../components/LoadingSkeletonGrid";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { ErrorBoundary } from "../components/ErrorBoundary";

const PAGE_SIZE = 24;

export function BrowsePage() {
  // Search + page live in the URL (?q=&page=), not local state, so the
  // browser's Back/Forward actually restores what you were looking at —
  // and the page unmounting/remounting (e.g. after visiting a Pokemon's
  // detail page) doesn't wipe them back to defaults.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // The text box still needs its own fast-typing local state — writing to
  // the URL on every keystroke would spam browser history and re-suspend
  // the grid per letter. Only the *debounced* value is committed to the URL.
  const [inputValue, setInputValue] = useState(search);
  const debouncedInput = useDebouncedValue(inputValue, 1000);

  // Keep the box in sync when `search` changes from outside typing — e.g.
  // Back/Forward navigation, or landing on a shared/bookmarked URL.
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // Commit the debounced text to the URL once it actually differs from
  // what's there — guards both the initial mount (debouncedInput and
  // search start equal) and the round-trip after our own write below
  // updates `search` to match, which would otherwise loop.
  useEffect(() => {
    if (debouncedInput === search) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedInput) next.set("q", debouncedInput);
        else next.delete("q");
        next.set("page", "1"); // a new search always starts back at page 1
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl text-slate-900 dark:text-slate-100">
          Browse the Pokedex
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search for a Pokemon, favourite it, and sort it into your own
          groups.
        </p>
      </div>

      <SearchBar value={inputValue} onChange={setInputValue} />

      {/* Catches a failed name-index fetch — the one thing that would
          otherwise take down the whole results area. */}
      <ErrorBoundary
        fallback={(error, retry) => (
          <ErrorState
            message={error.message}
            onRetry={() => {
              resetAllPokemonNames();
              retry();
            }}
          />
        )}
      >
        <Suspense fallback={<LoadingSkeletonGrid />}>
          <PokedexResults search={search} requestedPage={page} onPageChange={goToPage} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function PokedexResults({
  search,
  requestedPage,
  onPageChange,
}: {
  search: string;
  requestedPage: number;
  onPageChange: (page: number) => void;
}) {
  const names = useAllPokemonNames(); // suspends once, ever

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? names.filter((n) => n.name.includes(term)) : names;
  }, [names, search]);

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="No Pokemon found"
        description={`Nothing matches "${search}". Try a different name.`}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // A stale/shared URL (or a narrower result set than before) can point
  // past the last page — clamp here, at render time, instead of in an
  // effect that would need an extra render to correct itself.
  const page = Math.min(requestedPage, pageCount);
  const pageNames = filtered
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((n) => n.name);

  return (
    <>
      {/* Scoped to just the grid so a failed detail fetch for one page
          doesn't take Pagination down with it — you can still page away
          from whatever broke. */}
      <ErrorBoundary
        fallback={(error, retry) => (
          <ErrorState
            message={error.message}
            onRetry={() => {
              resetPokemonDetails(pageNames);
              retry();
            }}
          />
        )}
      >
        <Suspense fallback={<LoadingSkeletonGrid count={pageNames.length} />}>
          <PokedexGrid names={pageNames} />
        </Suspense>
      </ErrorBoundary>
      <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />
    </>
  );
}

function PokedexGrid({ names }: { names: string[] }) {
  const pokemon = usePokemonDetails(names); // suspends per page/search batch

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </ul>
  );
}
