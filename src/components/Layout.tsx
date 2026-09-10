import { Outlet, useNavigation } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  // pokemon/:name's loader has no local fallback of its own the way our
  // Suspense-based pages do (see PokemonDetailPage.tsx) — the router just
  // keeps showing the previous page until the loader resolves. This thin
  // bar is the only feedback that a navigation is in flight.
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div className="flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className={`fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-red-600 transition-all duration-300 ${
          isNavigating ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        }`}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-red-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <NavBar />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
        Data from{" "}
        <a
          href="https://pokeapi.co"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-600 dark:hover:text-slate-300"
        >
          PokeAPI
        </a>
        . Built for the MPF front-end interview exercise.
      </footer>
    </div>
  );
}
