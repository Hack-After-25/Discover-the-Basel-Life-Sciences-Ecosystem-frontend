"use client";

import { TYPE_META } from "@/lib/entity-meta";
import { useRegionName } from "@/lib/store";
import { useTypeLabel } from "@/lib/labels";
import type { Canton, EntityType } from "@/lib/types";
import { Badge } from "./ui/badge";

export function TypeBadge({ type }: { type: EntityType }) {
  const meta = TYPE_META[type];
  const typeLabel = useTypeLabel();
  return (
    <Badge>
      <span aria-hidden className="h-[7px] w-[7px] rounded-sm" style={{ backgroundColor: meta.color }} />
      {typeLabel(type)}
    </Badge>
  );
}

export function CantonBadge({ canton }: { canton: Canton }) {
  const name = useRegionName()(canton);
  return (
    <Badge title={name}>
      {name}
    </Badge>
  );
}
