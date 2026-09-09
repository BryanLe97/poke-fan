export function LoadingSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-square bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}
