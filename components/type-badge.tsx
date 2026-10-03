import { CANTON_LABEL, TYPE_META } from "@/lib/entity-meta";
import type { Canton, EntityType } from "@/lib/types";
import { Badge } from "./ui/badge";

export function TypeBadge({ type }: { type: EntityType }) {
  const meta = TYPE_META[type];
  return (
    <Badge>
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </Badge>
  );
}

export function CantonBadge({ canton }: { canton: Canton }) {
  return (
    <Badge className="border-transparent bg-surface text-muted" title={CANTON_LABEL[canton]}>
      {CANTON_LABEL[canton]}
    </Badge>
  );
}
