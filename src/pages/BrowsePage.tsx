import { useMemo, useState } from "react";
import { useAllPokemonNames } from "../hooks/useAllPokemonNames";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";
import { PokemonCard } from "../components/PokemonCard";
import { LoadingSkeletonGrid } from "../components/LoadingSkeletonGrid";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

const PAGE_SIZE = 24;

export function BrowsePage() {
  const { names, loading, error, retry } = useAllPokemonNames();
  const [search, setSearch] = useState("");
  const [requestedPage, setRequestedPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? names.filter((n) => n.name.includes(term))
      : names;
    return list;
  }, [names, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Search (or any change to the underlying list) can leave requestedPage
  // pointing past the new last page — clamp it here, at render time, rather
  // than in an effect that would need an extra render to correct itself.
  const page = Math.min(requestedPage, pageCount);

  const pageNames = filtered
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((n) => n.name);

  const { pokemon, loading: detailsLoading, error: detailsError } =
    usePokemonDetails(pageNames);

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

      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && <LoadingSkeletonGrid />}

      {!error && !loading && filtered.length === 0 && (
        <EmptyState
          title="No Pokemon found"
          description={`Nothing matches "${search}". Try a different name.`}
        />
      )}

      {!error && !loading && filtered.length > 0 && (
        <>
          {detailsError ? (
            <ErrorState message={detailsError} />
          ) : detailsLoading ? (
            <LoadingSkeletonGrid count={pageNames.length} />
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {pokemon
                .slice()
                .sort(
                  (a, b) =>
                    idFromPageOrder(a.name, pageNames) -
                    idFromPageOrder(b.name, pageNames),
                )
                .map((p) => (
                  <PokemonCard key={p.id} pokemon={p} />
                ))}
            </ul>
          )}
          <Pagination page={page} pageCount={pageCount} onChange={setRequestedPage} />
        </>
      )}
    </div>
  );
}

// usePokemonDetails resolves in parallel, so results can arrive out of
// order; re-sort by each name's position in the requested page so the grid
// stays in the API's natural (roughly numerical) order rather than jumping
// around on every fetch.
function idFromPageOrder(name: string, pageNames: string[]): number {
  const index = pageNames.indexOf(name);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
