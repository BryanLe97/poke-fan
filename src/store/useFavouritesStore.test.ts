import { beforeEach, describe, expect, it } from "vitest";
import { useFavouritesStore } from "./useFavouritesStore";
import type { FavouritePokemon } from "../types/pokemon";

const bulbasaur: FavouritePokemon = {
  id: 1,
  name: "bulbasaur",
  sprite: "bulbasaur.png",
  types: ["grass", "poison"],
};
const charmander: FavouritePokemon = {
  id: 4,
  name: "charmander",
  sprite: "charmander.png",
  types: ["fire"],
};

// Zustand stores are module singletons, so every test starts from a clean
// slate rather than leaking favourites/groups between assertions.
beforeEach(() => {
  useFavouritesStore.setState({ favourites: {}, groups: {} });
});

describe("useFavouritesStore", () => {
  it("toggles a Pokemon in and out of favourites", () => {
    const { toggleFavourite, isFavourite } = useFavouritesStore.getState();

    expect(isFavourite("bulbasaur")).toBe(false);

    toggleFavourite(bulbasaur);
    expect(useFavouritesStore.getState().isFavourite("bulbasaur")).toBe(true);
    expect(useFavouritesStore.getState().favourites.bulbasaur).toEqual(
      bulbasaur,
    );

    toggleFavourite(bulbasaur);
    expect(useFavouritesStore.getState().isFavourite("bulbasaur")).toBe(false);
  });

  it("removes a Pokemon from every group when it is unfavourited", () => {
    const state = () => useFavouritesStore.getState();
    state().toggleFavourite(bulbasaur);
    const groupId = state().createGroup("Starters");
    state().addToGroup(groupId, "bulbasaur");

    expect(state().groups[groupId].pokemonNames).toEqual(["bulbasaur"]);

    state().toggleFavourite(bulbasaur); // unfavourite
    expect(state().groups[groupId].pokemonNames).toEqual([]);
  });

  it("deleting a group leaves the underlying favourites untouched", () => {
    const state = () => useFavouritesStore.getState();
    state().toggleFavourite(bulbasaur);
    state().toggleFavourite(charmander);
    const groupId = state().createGroup("Team");
    state().addToGroup(groupId, "bulbasaur");
    state().addToGroup(groupId, "charmander");

    state().deleteGroup(groupId);

    expect(state().groups[groupId]).toBeUndefined();
    expect(state().isFavourite("bulbasaur")).toBe(true);
    expect(state().isFavourite("charmander")).toBe(true);
  });

  it("does not add the same Pokemon to a group twice", () => {
    const state = () => useFavouritesStore.getState();
    state().toggleFavourite(bulbasaur);
    const groupId = state().createGroup("Starters");

    state().addToGroup(groupId, "bulbasaur");
    state().addToGroup(groupId, "bulbasaur");

    expect(state().groups[groupId].pokemonNames).toEqual(["bulbasaur"]);
  });

  it("removeFavourite deletes the favourite and un-groups it", () => {
    const state = () => useFavouritesStore.getState();
    state().toggleFavourite(bulbasaur);
    const groupId = state().createGroup("Starters");
    state().addToGroup(groupId, "bulbasaur");

    state().removeFavourite("bulbasaur");

    expect(state().favourites.bulbasaur).toBeUndefined();
    expect(state().groups[groupId].pokemonNames).toEqual([]);
  });
});
