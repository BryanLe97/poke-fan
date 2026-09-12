import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30"
    >
      <AlertTriangle className="text-red-500" size={28} aria-hidden="true" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
