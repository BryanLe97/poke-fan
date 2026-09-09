import { Suspense, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  // Filtering/pagination/fetching all key off the debounced value, not the
  // raw keystrokes — typing "charizard" re-suspends the grid once, not
  // once per letter.
  const debouncedSearch = useDebouncedValue(search, 1000);
  const [requestedPage, setRequestedPage] = useState(1);

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

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setRequestedPage(1);
        }}
      />

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
          <PokedexResults
            search={debouncedSearch}
            requestedPage={requestedPage}
            onPageChange={setRequestedPage}
          />
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
  // A narrower result set than before can leave requestedPage pointing
  // past the new last page — clamp here, at render time, instead of in an
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
