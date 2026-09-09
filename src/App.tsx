import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BrowsePage } from "./pages/BrowsePage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { PokemonDetailPage } from "./pages/PokemonDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BrowsePage />} />
        <Route path="favourites" element={<FavouritesPage />} />
        <Route path="pokemon/:name" element={<PokemonDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
