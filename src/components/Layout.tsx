import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
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
