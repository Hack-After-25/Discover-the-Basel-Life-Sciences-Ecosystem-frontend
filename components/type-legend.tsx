"use client";

import { ENTITY_TYPES, TYPE_META } from "@/lib/entity-meta";
import { useTypeLabel } from "@/lib/labels";
import { useT } from "./site-provider";

export function TypeLegend() {
  const t = useT();
  const typeLabel = useTypeLabel();
  return (
    <ul aria-label={t("common.legend")} className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
      {ENTITY_TYPES.map((et) => (
        <li key={et} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_META[et].color }} />
          {typeLabel(et)}
        </li>
      ))}
    </ul>
  );
}
