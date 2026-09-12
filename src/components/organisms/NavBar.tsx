import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Sparkles, Star, X } from "lucide-react";
import { useFavouritesStore } from "../store/useFavouritesStore";

const links = [
  { to: "/", label: "Browse", end: true },
  { to: "/favourites", label: "Favourites", end: false },
];

function linkClasses({ isActive }: { isActive: boolean }) {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-red-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;
}

export function NavBar() {
  const [open, setOpen] = useState(false);
  const favouriteCount = useFavouritesStore(
    (s) => Object.keys(s.favourites).length,
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-display text-2xl text-red-600">
          <Sparkles size={22} aria-hidden="true" />
          Poke Fan
        </NavLink>

        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {link.label === "Favourites" ? (
                <span className="inline-flex items-center gap-1">
                  <Star size={14} aria-hidden="true" />
                  {link.label}
                  {favouriteCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/10">
                      {favouriteCount}
                    </span>
                  )}
                </span>
              ) : (
                link.label
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 sm:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 sm:hidden dark:border-slate-800"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClasses}
              onClick={() => setOpen(false)}
            >
              {link.label}
              {link.label === "Favourites" && favouriteCount > 0
                ? ` (${favouriteCount})`
                : ""}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
