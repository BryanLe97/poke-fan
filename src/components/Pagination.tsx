import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-3 py-6"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="rounded-full border border-slate-300 p-2 text-slate-600 transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Page <span className="font-semibold">{page}</span> of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="rounded-full border border-slate-300 p-2 text-slate-600 transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
