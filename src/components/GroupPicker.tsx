import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { useFavouritesStore } from "../store/useFavouritesStore";

/**
 * Disclosure widget for assigning a favourited Pokemon to one or more
 * groups. Built on native <details>/<summary> so open/close and keyboard
 * support come for free from the browser instead of hand-rolled JS.
 */
export function GroupPicker({ pokemonName }: { pokemonName: string }) {
  const groups = useFavouritesStore((s) => s.groups);
  const addToGroup = useFavouritesStore((s) => s.addToGroup);
  const removeFromGroup = useFavouritesStore((s) => s.removeFromGroup);
  const createGroup = useFavouritesStore((s) => s.createGroup);
  const [newGroupName, setNewGroupName] = useState("");

  const groupList = Object.values(groups).sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    const id = createGroup(name);
    addToGroup(id, pokemonName);
    setNewGroupName("");
  }

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400"
        aria-label={`Add ${pokemonName} to a group`}
      >
        <FolderPlus size={14} aria-hidden="true" />
        Group
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        {groupList.length === 0 && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            No groups yet — create one below.
          </p>
        )}
        <ul className="mb-2 max-h-40 space-y-1 overflow-y-auto">
          {groupList.map((group) => {
            const checked = group.pokemonNames.includes(pokemonName);
            return (
              <li key={group.id}>
                <label className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      checked
                        ? removeFromGroup(group.id, pokemonName)
                        : addToGroup(group.id, pokemonName)
                    }
                    className="h-3.5 w-3.5 accent-red-600"
                  />
                  <span className="truncate capitalize">{group.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <form onSubmit={handleCreate} className="flex gap-1">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            aria-label="New group name"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="submit"
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            disabled={!newGroupName.trim()}
          >
            Add
          </button>
        </form>
      </div>
    </details>
  );
}
