import type { LoaderFunctionArgs } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/organisms/Layout";
import { BrowsePage } from "./pages/BrowsePage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { PokemonDetailError, PokemonDetailPage } from "./pages/PokemonDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { getPokemonDetail } from "./api/pokemonResource";

// Kept here rather than in PokemonDetailPage.tsx: a loader is a plain
// function, not a component, and co-locating it there breaks Fast Refresh
// (oxlint's react(only-export-components) rule) for that file.
function pokemonDetailLoader({ params }: LoaderFunctionArgs) {
  return getPokemonDetail(params.name!);
}

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <BrowsePage /> },
        { path: "favourites", element: <FavouritesPage /> },
        {
          path: "pokemon/:name",
          element: <PokemonDetailPage />,
          loader: pokemonDetailLoader,
          errorElement: <PokemonDetailError />,
        },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    // GitHub Pages serves this project from /poke-fan — see vite.config.ts.
    basename: "/poke-fan",
  },
);
