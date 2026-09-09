import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import { resetPokemonDetails } from "../api/pokemonResource";
import { useFavouritesStore } from "../store/useFavouritesStore";
import { TypeBadge } from "../components/TypeBadge";
import { GroupPicker } from "../components/GroupPicker";
import { ErrorState } from "../components/ErrorState";
import { ErrorBoundary } from "../components/ErrorBoundary";

export function PokemonDetailPage() {
  const { name = "" } = useParams<{ name: string }>();

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-red-600 dark:text-slate-400"
      >
        <ArrowLeft size={16} /> Back to Browse
      </Link>

      <ErrorBoundary
        fallback={(error, retry) => (
          <ErrorState
            message={error.message}
            onRetry={() => {
              resetPokemonDetails([name]);
              retry();
            }}
          />
        )}
      >
        <Suspense
          fallback={
            <div
              className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              aria-busy="true"
              aria-label="Loading Pokemon"
            />
          }
        >
          <PokemonDetailBody name={name} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function PokemonDetailBody({ name }: { name: string }) {
  const [p] = usePokemonDetails([name]); // suspends until this one Pokemon loads
  const isFavourite = useFavouritesStore((s) => s.isFavourite(name));
  const toggleFavourite = useFavouritesStore((s) => s.toggleFavourite);

  return (
    <article className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-center bg-slate-100 rounded-xl dark:bg-slate-800">
        {p.sprite ? (
          <img src={p.sprite} alt={p.name} className="w-full max-w-xs p-6" />
        ) : (
          <span className="p-12 text-slate-400">No image available</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">
              #{String(p.id).padStart(3, "0")}
            </p>
            <h1 className="font-display text-4xl capitalize text-slate-900 dark:text-slate-100">
              {p.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={() =>
              toggleFavourite({
                id: p.id,
                name: p.name,
                sprite: p.sprite,
                types: p.types,
              })
            }
            aria-pressed={isFavourite}
            aria-label={
              isFavourite
                ? `Remove ${p.name} from favourites`
                : `Add ${p.name} to favourites`
            }
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-yellow-400 hover:text-yellow-600 dark:border-slate-700 dark:text-slate-300"
          >
            <Star
              size={16}
              className={isFavourite ? "fill-yellow-400 text-yellow-500" : ""}
            />
            {isFavourite ? "Favourited" : "Favourite"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {p.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400">Height</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">
              {(p.height / 10).toFixed(1)} m
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Weight</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">
              {(p.weight / 10).toFixed(1)} kg
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-400">Abilities</dt>
            <dd className="font-medium capitalize text-slate-800 dark:text-slate-200">
              {p.abilities.join(", ")}
            </dd>
          </div>
        </dl>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Base stats
          </h2>
          <ul className="flex flex-col gap-1.5">
            {p.stats.map((stat) => (
              <li key={stat.name} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 uppercase text-slate-400">
                  {stat.name.replace("-", " ")}
                </span>
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-valuenow={stat.value}
                  aria-valuemin={0}
                  aria-valuemax={200}
                  aria-label={stat.name}
                >
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${Math.min(100, (stat.value / 200) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-slate-700 dark:text-slate-200">
                  {stat.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {isFavourite && (
          <div className="flex justify-end">
            <GroupPicker pokemonName={p.name} />
          </div>
        )}
      </div>
    </article>
  );
}
