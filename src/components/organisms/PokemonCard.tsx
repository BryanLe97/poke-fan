import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { FavouritePokemon } from "../../types/pokemon";
import { useFavouritesStore } from "../../store/useFavouritesStore";
import { TypeBadge } from "../atoms/TypeBadge";
import { GroupPicker } from "./GroupPicker";

// Only the fields a card actually renders — a full Pokemon detail satisfies
// this structurally, and so does the trimmed FavouritePokemon record we
// persist, so the same card works on the browse grid and the favourites
// grid without re-fetching or re-shaping data.
type CardPokemon = FavouritePokemon;

export function PokemonCard({ pokemon }: { pokemon: CardPokemon }) {
  const isFavourite = useFavouritesStore((s) => s.isFavourite(pokemon.name));
  const toggleFavourite = useFavouritesStore((s) => s.toggleFavourite);

  return (
    <li className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* overflow-hidden lives here (not on the <li>) so the rounded sprite
          corners stay clipped without also clipping the GroupPicker dropdown
          that opens below the card. */}
      <div className="relative overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800">
        <button
          type="button"
          onClick={() =>
            toggleFavourite({
              id: pokemon.id,
              name: pokemon.name,
              sprite: pokemon.sprite,
              types: pokemon.types,
            })
          }
          aria-pressed={isFavourite}
          aria-label={
            isFavourite
              ? `Remove ${pokemon.name} from favourites`
              : `Add ${pokemon.name} to favourites`
          }
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-slate-400 shadow transition-transform hover:scale-110 hover:text-yellow-500 dark:bg-slate-900/90"
        >
          <Star
            size={20}
            className={
              isFavourite ? "fill-yellow-400 text-yellow-500" : "fill-transparent"
            }
          />
        </button>
        <Link
          to={`/pokemon/${pokemon.name}`}
          className="flex aspect-square items-center justify-center p-4"
        >
          {pokemon.sprite ? (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <span className="text-sm text-slate-400">No image</span>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            to={`/pokemon/${pokemon.name}`}
            className="truncate font-semibold capitalize text-slate-900 hover:underline dark:text-slate-100"
          >
            {pokemon.name}
          </Link>
          <span className="shrink-0 text-xs text-slate-400">
            #{String(pokemon.id).padStart(3, "0")}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        {isFavourite && (
          <div className="mt-auto flex justify-end pt-1">
            <GroupPicker pokemonName={pokemon.name} />
          </div>
        )}
      </div>
    </li>
  );
}
