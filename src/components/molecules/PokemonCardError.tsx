import { AlertTriangle, RotateCw } from "lucide-react";

/** Compact, card-shaped error for one failed Pokemon fetch — sized like a
 *  real PokemonCard so the grid doesn't reflow, and scoped to just this
 *  slot so one bad request doesn't take the rest of the page down with it. */
export function PokemonCardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <li
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-950/30"
    >
      <AlertTriangle className="text-red-500" size={20} aria-hidden="true" />
      <p className="text-xs font-medium text-red-700 dark:text-red-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
      >
        <RotateCw size={12} aria-hidden="true" />
        Retry
      </button>
    </li>
  );
}
