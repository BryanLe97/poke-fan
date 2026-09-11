/** One card-shaped placeholder — the <Suspense> fallback for a single
 *  PokemonCardLoader slot, and what LoadingSkeletonGrid tiles to fill a
 *  whole grid before we even know which Pokemon we're loading. */
export function PokemonCardSkeleton() {
  return (
    <li className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-square bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </li>
  );
}
