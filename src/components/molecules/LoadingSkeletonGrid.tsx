import { PokemonCardSkeleton } from "../atoms/PokemonCardSkeleton";

/** Used only where we don't have individual Pokemon to key skeletons by
 *  yet — i.e. the very first load, before the name index has arrived. Once
 *  we know which names we're fetching, each PokemonCardSlot shows its own
 *  PokemonCardSkeleton instead (see BrowsePage.tsx). */
export function LoadingSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </ul>
  );
}
