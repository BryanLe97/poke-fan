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

/** Shape our UI actually works with, trimmed down from the API response. */
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

export function toPokemon({
  types,
  abilities,
  stats,
  sprites,
  ...rest // id, name, height, weight — carried over as-is
}: PokemonDetailResponse): Pokemon {
  return {
    ...rest,
    sprite:
      sprites.other?.["official-artwork"]?.front_default ??
      sprites.front_default,
    types: types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: abilities.map((a) => a.ability.name),
    stats: stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

/** The trimmed record we persist for a favourite — enough to render a card
 * offline, without re-fetching the whole Pokemon just to show a list. */
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
