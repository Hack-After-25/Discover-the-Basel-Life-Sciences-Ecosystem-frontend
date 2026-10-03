import { ENTITY_TYPES, TYPE_META } from "@/lib/entity-meta";

export function TypeLegend() {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
      {ENTITY_TYPES.map((t) => (
        <li key={t} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_META[t].color }} />
          {TYPE_META[t].label}
        </li>
      ))}
    </ul>
  );
}
