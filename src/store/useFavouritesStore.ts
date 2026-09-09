import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavouritePokemon, Group } from "../types/pokemon";

interface FavouritesState {
  favourites: Record<string, FavouritePokemon>;
  groups: Record<string, Group>;

  isFavourite: (name: string) => boolean;
  toggleFavourite: (pokemon: FavouritePokemon) => void;
  removeFavourite: (name: string) => void;

  createGroup: (name: string) => string;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  addToGroup: (groupId: string, pokemonName: string) => void;
  removeFromGroup: (groupId: string, pokemonName: string) => void;
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      favourites: {},
      groups: {},

      isFavourite: (name) => name in get().favourites,

      toggleFavourite: (pokemon) =>
        set((state) => {
          const next = { ...state.favourites };
          if (next[pokemon.name]) {
            delete next[pokemon.name];
            // Unfavouriting also drops the Pokemon from every group, so a
            // group never silently holds a name the user no longer keeps.
            const groups = Object.fromEntries(
              Object.entries(state.groups).map(([id, group]) => [
                id,
                {
                  ...group,
                  pokemonNames: group.pokemonNames.filter(
                    (n) => n !== pokemon.name,
                  ),
                },
              ]),
            );
            return { favourites: next, groups };
          }
          next[pokemon.name] = pokemon;
          return { favourites: next };
        }),

      removeFavourite: (name) =>
        set((state) => {
          const next = { ...state.favourites };
          delete next[name];
          const groups = Object.fromEntries(
            Object.entries(state.groups).map(([id, group]) => [
              id,
              {
                ...group,
                pokemonNames: group.pokemonNames.filter((n) => n !== name),
              },
            ]),
          );
          return { favourites: next, groups };
        }),

      createGroup: (name) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `group-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((state) => ({
          groups: {
            ...state.groups,
            [id]: { id, name, createdAt: Date.now(), pokemonNames: [] },
          },
        }));
        return id;
      },

      renameGroup: (id, name) =>
        set((state) => {
          const group = state.groups[id];
          if (!group) return state;
          return { groups: { ...state.groups, [id]: { ...group, name } } };
        }),

      deleteGroup: (id) =>
        set((state) => {
          const groups = { ...state.groups };
          delete groups[id];
          return { groups };
        }),

      addToGroup: (groupId, pokemonName) =>
        set((state) => {
          const group = state.groups[groupId];
          if (!group || group.pokemonNames.includes(pokemonName)) return state;
          return {
            groups: {
              ...state.groups,
              [groupId]: {
                ...group,
                pokemonNames: [...group.pokemonNames, pokemonName],
              },
            },
          };
        }),

      removeFromGroup: (groupId, pokemonName) =>
        set((state) => {
          const group = state.groups[groupId];
          if (!group) return state;
          return {
            groups: {
              ...state.groups,
              [groupId]: {
                ...group,
                pokemonNames: group.pokemonNames.filter(
                  (n) => n !== pokemonName,
                ),
              },
            },
          };
        }),
    }),
    {
      // localStorage is all this exercise asks for; the key is namespaced so
      // it won't collide with anything else on the same origin.
      name: "poke-fan-storage",
      version: 1,
    },
  ),
);
