import { typeColor } from "./typeColors";

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${typeColor(type)}`}
    >
      {type}
    </span>
  );
}
