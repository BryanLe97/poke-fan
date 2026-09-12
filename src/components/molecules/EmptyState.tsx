import type { ReactNode } from "react";
import { Ghost } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
      <Ghost className="text-slate-300 dark:text-slate-600" size={32} aria-hidden="true" />
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
