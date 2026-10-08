"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENTITY_TYPES, TYPE_META } from "@/lib/entity-meta";
import { useNavigator } from "@/lib/store";
import type { Canton, EntityType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

/** Every organisation in the graph, browsable by type. No match cap. */
export default function DirectoryPage() {
  return (
    <Suspense fallback={<DirectorySkeleton />}>
      <Directory />
    </Suspense>
  );
}

function Directory() {
  const entities = useNavigator((s) => s.entities);
  const router = useRouter();
  const params = useSearchParams();
  const typeParam = params.get("type");
  const type = ENTITY_TYPES.includes(typeParam as EntityType) ? (typeParam as EntityType) : null;
  const [query, setQuery] = useState("");
  const [canton, setCanton] = useState<Canton | "">("");

  const counts = useMemo(() => {
    const c = new Map<EntityType, number>();
    for (const e of entities) c.set(e.type, (c.get(e.type) ?? 0) + 1);
    return c;
  }, [entities]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entities
      .filter((e) => !type || e.type === type)
      .filter((e) => !canton || e.canton === canton)
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.focusAreas.some((a) => a.includes(q)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [entities, type, canton, query]);

  if (entities.length === 0) return <DirectorySkeleton />;

  const setType = (t: EntityType | null) => router.replace(t ? `/directory?type=${t}` : "/directory", { scroll: false });
  const tab = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm font-medium",
      active ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:text-ink",
    );

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary">Directory</h1>
      <p className="mt-2 text-muted">Every organisation in the Basel life sciences graph, {entities.length} in total.</p>

      <div role="group" aria-label="Filter by type" className="mt-6 flex flex-wrap gap-2">
        <button type="button" className={tab(!type)} aria-pressed={!type} onClick={() => setType(null)}>
          All <span className="tabular-nums">{entities.length}</span>
        </button>
        {ENTITY_TYPES.filter((t) => counts.get(t)).map((t) => (
          <button key={t} type="button" className={tab(type === t)} aria-pressed={type === t} onClick={() => setType(t)}>
            {TYPE_META[t].label} <span className="tabular-nums">{counts.get(t)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div>
          <label htmlFor="d-search" className="sr-only">Search the directory</label>
          <Input
            id="d-search"
            type="search"
            placeholder="Search by name, description or focus area"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="d-canton" className="sr-only">Canton</label>
          <Select id="d-canton" value={canton} onChange={(e) => setCanton(e.target.value as Canton | "")}>
            <option value="">Both cantons</option>
            <option value="BS">Basel-Stadt</option>
            <option value="BL">Basel-Landschaft</option>
          </Select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? "organisation" : "organisations"}
      </p>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Nothing matches" body="Clear the search, choose another type or include both cantons." />
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((e) => (
            <li key={e.id}>
              <MatchCard entity={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 px-4 py-10 sm:px-6" role="status" aria-label="Loading directory">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
