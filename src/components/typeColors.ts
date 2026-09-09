/** Background/text classes per Pokemon type, used for the little type pills. */
export const TYPE_COLORS: Record<string, string> = {
  normal: "bg-stone-400 text-stone-950",
  fire: "bg-orange-500 text-orange-950",
  water: "bg-sky-500 text-sky-950",
  electric: "bg-yellow-400 text-yellow-950",
  grass: "bg-green-500 text-green-950",
  ice: "bg-cyan-300 text-cyan-950",
  fighting: "bg-red-700 text-red-50",
  poison: "bg-purple-500 text-purple-950",
  ground: "bg-amber-600 text-amber-950",
  flying: "bg-indigo-300 text-indigo-950",
  psychic: "bg-pink-500 text-pink-950",
  bug: "bg-lime-500 text-lime-950",
  rock: "bg-yellow-700 text-yellow-50",
  ghost: "bg-violet-700 text-violet-50",
  dragon: "bg-indigo-600 text-indigo-50",
  dark: "bg-neutral-700 text-neutral-50",
  steel: "bg-slate-400 text-slate-950",
  fairy: "bg-rose-300 text-rose-950",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "bg-gray-400 text-gray-950";
}
