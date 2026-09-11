import { act, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowsePage } from "./BrowsePage";
import { useFavouritesStore } from "../store/useFavouritesStore";
import { getAllPokemonNames, getPokemonDetail } from "../api/pokemonResource";
import type { NamedApiResource, Pokemon } from "../types/pokemon";

// Component test: renders the real BrowsePage tree (Suspense, per-card
// error boundaries, filtering/pagination logic all included) but stubs
// out the network-touching resource layer, so this stays a fast unit
// test rather than an E2E one — no real fetch, no real browser.
vi.mock("../api/pokemonResource", () => ({
  getAllPokemonNames: vi.fn(),
  getPokemonDetail: vi.fn(),
  resetAllPokemonNames: vi.fn(),
  resetPokemonDetail: vi.fn(),
}));

const NAMES: NamedApiResource[] = ["bulbasaur", "charmander", "squirtle"].map(
  (name) => ({ name, url: `https://pokeapi.co/api/v2/pokemon/${name}/` }),
);

function fakePokemon(name: string): Pokemon {
  return {
    id: NAMES.findIndex((n) => n.name === name) + 1,
    name,
    sprite: null,
    types: ["normal"],
    height: 1,
    weight: 1,
    abilities: [],
    stats: [],
  };
}

let namesPromise: Promise<NamedApiResource[]>;
let detailPromises: Map<string, Promise<Pokemon>>;

beforeEach(() => {
  useFavouritesStore.setState({ favourites: {}, groups: {} });

  // `use()` only bails out of suspending once it sees the *same* promise
  // object across renders — a fresh Promise.resolve(...) per call (what
  // mockResolvedValue would give you) suspends forever, exactly like the
  // real pokemonResource.ts would if it didn't cache the promise itself.
  namesPromise = Promise.resolve(NAMES);
  vi.mocked(getAllPokemonNames).mockReturnValue(namesPromise);

  detailPromises = new Map();
  vi.mocked(getPokemonDetail).mockImplementation((name: string) => {
    let promise = detailPromises.get(name);
    if (!promise) {
      promise = Promise.resolve(fakePokemon(name));
      detailPromises.set(name, promise);
    }
    return promise;
  });
});

/**
 * Renders BrowsePage and flushes both Suspense levels it suspends on (the
 * name index, then each visible card's own detail fetch). The render call
 * itself has to happen *inside* the first `act`, awaiting the promise it
 * suspends on from there — flushing via a separate `act` afterwards (the
 * pattern that works for a plain `await`-ed effect) never lets a `use()`
 * suspension's retry actually commit in this jsdom/RTL setup.
 */
async function renderBrowsePage(initialPath = "/") {
  const router = createMemoryRouter([{ path: "/", element: <BrowsePage /> }], {
    initialEntries: [initialPath],
  });

  await act(async () => {
    render(<RouterProvider router={router} />);
    await namesPromise; // lets the outer (name index) Suspense settle
  });
  await act(async () => {
    // Rendering with resolved names just created each visible card's
    // detail promise (see getPokemonDetail's mock above) — flush those.
    await Promise.all(detailPromises.values());
  });
}

describe("BrowsePage", () => {
  it("renders every Pokemon from the name index on first load", async () => {
    await renderBrowsePage();

    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("charmander")).toBeInTheDocument();
    expect(screen.getByText("squirtle")).toBeInTheDocument();
  });

  it("filters the grid by the ?q= URL param already present on load", async () => {
    await renderBrowsePage("/?q=char");

    await waitFor(() =>
      expect(screen.getByText("charmander")).toBeInTheDocument(),
    );
    expect(screen.queryByText("bulbasaur")).not.toBeInTheDocument();
    expect(screen.queryByText("squirtle")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing matches the search", async () => {
    await renderBrowsePage("/?q=zzznotreal");

    expect(screen.getByText("No Pokemon found")).toBeInTheDocument();
  });
});
