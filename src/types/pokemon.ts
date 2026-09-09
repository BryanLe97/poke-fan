/** Raw shapes returned by https://pokeapi.co/api/v2 — only the fields we use. */

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: NamedApiResource[];
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: NamedApiResource }[];
  abilities: { ability: NamedApiResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedApiResource }[];
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
}

export interface FavouritePokemon {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
}

export interface Group {
  id: string;
  name: string;
  createdAt: number;
  pokemonNames: string[];
}
