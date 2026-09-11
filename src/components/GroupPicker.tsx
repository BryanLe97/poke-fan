import { useEffect, useMemo, useRef, useState } from "react";
import { FolderPlus, Plus } from "lucide-react";
import { useFavouritesStore } from "../store/useFavouritesStore";
import { useClickOutside } from "../hooks/useClickOutside";

/**
 * Combobox for assigning a favourited Pokemon to one or more groups: type
 * to filter existing groups, tick as many checkboxes as you want without
 * the popup closing between clicks, or type a name that doesn't exist yet
 * to create it inline.
 *
 * Controlled open state + useClickOutside (rather than <details>, used
 * elsewhere in this app) because this needs richer behaviour than a plain
 * disclosure gives for free: typing filters the list, checkboxes toggle
 * without closing, and Enter can create a new group.
 */
export function GroupPicker({ pokemonName }: { pokemonName: string }) {
  const groups = useFavouritesStore((s) => s.groups);
  const addToGroup = useFavouritesStore((s) => s.addToGroup);
  const removeFromGroup = useFavouritesStore((s) => s.removeFromGroup);
  const createGroup = useFavouritesStore((s) => s.createGroup);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const groupList = useMemo(
    () => Object.values(groups).sort((a, b) => a.createdAt - b.createdAt),
    [groups],
  );

  const trimmedQuery = query.trim();
  const filtered = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return q ? groupList.filter((g) => g.name.toLowerCase().includes(q)) : groupList;
  }, [groupList, trimmedQuery]);

  const hasExactMatch = groupList.some(
    (g) => g.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const canCreate = trimmedQuery !== "" && !hasExactMatch;

  function handleCreate() {
    if (!canCreate) return;
    const id = createGroup(trimmedQuery);
    addToGroup(id, pokemonName);
    setQuery(""); // clear, but stay open — ready to create/tick the next one
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Add ${pokemonName} to a group`}
        className="flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400"
      >
        <FolderPlus size={14} aria-hidden="true" />
        Group
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or create a group"
            aria-label="Search or create a group"
            className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
          />

          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="mb-1 flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Plus size={14} aria-hidden="true" />
              <span className="truncate">Create "{trimmedQuery}"</span>
            </button>
          )}

          {filtered.length === 0 && !canCreate && (
            <p className="px-1.5 py-2 text-xs text-slate-500 dark:text-slate-400">
              {groupList.length === 0
                ? "No groups yet — type a name above to create one."
                : "No groups match."}
            </p>
          )}

          {filtered.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {filtered.map((group) => {
                const checked = group.pokemonNames.includes(pokemonName);
                return (
                  <li key={group.id}>
                    <label className="flex items-center gap-2 rounded px-1.5 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          checked
                            ? removeFromGroup(group.id, pokemonName)
                            : addToGroup(group.id, pokemonName)
                        }
                        className="h-3.5 w-3.5 shrink-0 accent-red-600"
                      />
                      <span className="truncate capitalize">{group.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
