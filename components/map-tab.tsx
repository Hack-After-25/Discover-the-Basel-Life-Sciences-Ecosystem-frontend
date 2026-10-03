"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useNavigator } from "@/lib/store";
import { MatchCard } from "./match-card";
import { TypeLegend } from "./type-legend";
import { Skeleton } from "./ui/skeleton";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full rounded-2xl md:h-[540px]" />,
});

export function MapTab() {
  const matches = useNavigator((s) => s.matches);
  const allEntities = useNavigator((s) => s.entities);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matchedIds = useMemo(() => new Set(matches.map((m) => m.entity.id)), [matches]);
  const matchedEntities = useMemo(
    () => Array.from(new Map(matches.map((m) => [m.entity.id, m.entity])).values()),
    [matches],
  );
  const entities = showAll && allEntities.length ? allEntities : matchedEntities;
  const selectedEntity = entities.find((e) => e.id === selectedId);
  // Best match for the selected pin, if it was matched to more than one need.
  const selectedMatch = matches
    .filter((m) => m.entity.id === selectedId)
    .sort((a, b) => b.score - a.score)[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TypeLegend />
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#0E8F8A]"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Show the whole ecosystem
        </label>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MapView entities={entities} matchedIds={matchedIds} selectedId={selectedId} onSelect={setSelectedId} />
        <div aria-live="polite">
          {selectedEntity ? (
            <MatchCard entity={selectedEntity} match={selectedMatch} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
              Select a pin to see why it matches and what to do next. Larger pins are your matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
