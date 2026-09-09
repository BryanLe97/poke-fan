import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-6xl text-red-600">404</p>
      <p className="text-slate-600 dark:text-slate-300">
        This page fainted. It's not here.
      </p>
      <Link
        to="/"
        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Back to Browse
      </Link>
    </div>
  );
}
