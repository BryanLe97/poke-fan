import { useMemo, useState } from "react";
import { FolderPlus, Star, Trash2 } from "lucide-react";
import { useFavouritesStore } from "../store/useFavouritesStore";
import { PokemonCard } from "../components/organisms/PokemonCard";
import { EmptyState } from "../components/molecules/EmptyState";

export function FavouritesPage() {
  const favourites = useFavouritesStore((s) => s.favourites);
  const groups = useFavouritesStore((s) => s.groups);
  const createGroup = useFavouritesStore((s) => s.createGroup);
  const deleteGroup = useFavouritesStore((s) => s.deleteGroup);

  const [activeGroupId, setActiveGroupId] = useState<string | "all">("all");
  const [newGroupName, setNewGroupName] = useState("");

  const groupList = useMemo(
    () => Object.values(groups).sort((a, b) => a.createdAt - b.createdAt),
    [groups],
  );

  const allFavourites = useMemo(() => Object.values(favourites), [favourites]);

  const visible =
    activeGroupId === "all"
      ? allFavourites
      : (groups[activeGroupId]?.pokemonNames ?? [])
          .map((name) => favourites[name])
          .filter(Boolean);

  function handleCreateGroup(e: React.SubmitEvent) {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    const id = createGroup(name);
    setNewGroupName("");
    setActiveGroupId(id);
  }

  function handleDeleteGroup(id: string) {
    deleteGroup(id);
    if (activeGroupId === id) setActiveGroupId("all");
  }

  if (allFavourites.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl text-slate-900 dark:text-slate-100">
          Your Favourites
        </h1>
        <EmptyState
          title="No favourites yet"
          description="Head over to Browse and tap the star on a Pokemon to save it here."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-3 lg:w-64">
        <h1 className="font-display text-3xl text-slate-900 dark:text-slate-100">
          Favourites
        </h1>

        <nav aria-label="Filter by group" className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveGroupId("all")}
            aria-current={activeGroupId === "all" ? "true" : undefined}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              activeGroupId === "all"
                ? "bg-red-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Star size={14} aria-hidden="true" /> All favourites
            </span>
            <span className="text-xs opacity-80">{allFavourites.length}</span>
          </button>

          {groupList.map((group) => (
            <div key={group.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveGroupId(group.id)}
                aria-current={activeGroupId === group.id ? "true" : undefined}
                className={`flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium capitalize transition-colors ${
                  activeGroupId === group.id
                    ? "bg-red-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{group.name}</span>
                <span className="text-xs opacity-80">
                  {group.pokemonNames.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(group.id)}
                aria-label={`Delete group ${group.name}`}
                className="rounded-full p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950/40"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>

        <form onSubmit={handleCreateGroup} className="flex gap-1 pt-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group"
            aria-label="New group name"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            aria-label="Create group"
            className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <FolderPlus size={14} />
          </button>
        </form>
      </aside>

      <div className="flex-1">
        {visible.length === 0 ? (
          <EmptyState
            title="This group is empty"
            description="Star a Pokemon on the Browse page, then add it to this group."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
