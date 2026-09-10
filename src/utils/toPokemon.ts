import type { Pokemon, PokemonDetailResponse } from "../types/pokemon";

/** Maps a raw PokeAPI detail response onto the trimmed `Pokemon` shape our
 *  UI works with (see src/types/pokemon.ts for why it's trimmed). */
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
      sprites.front_default, // fallback to the old sprite if official artwork is missing
    types: types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name), // sort by slot so the first type is always the primary type
    abilities: abilities.map((a) => a.ability.name), // no need to track hidden vs. visible abilities in the UI
    stats: stats.map((s) => ({ name: s.stat.name, value: s.base_stat })), // no need to track the stat's URL in the UI
  };
}
