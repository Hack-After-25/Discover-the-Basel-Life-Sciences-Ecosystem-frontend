"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENTITY_TYPES, TYPE_META } from "@/lib/entity-meta";
import { LayoutGrid, List, Search } from "lucide-react";
import { useNavigator, useRegionName } from "@/lib/store";
import type { Canton, Entity, EntityType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { RegionSelect } from "@/components/region-select";
import { Button } from "@/components/ui/button";
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
  const [view, setView] = useState<"table" | "cards">("table");

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
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium",
      active ? "border-primary bg-primary text-white" : "border-line bg-white text-[#3A4352] hover:border-[#C9CED6] hover:text-ink",
    );
  const viewButton = (active: boolean) =>
    cn(
      "inline-flex h-[42px] w-11 items-center justify-center rounded-[9px]",
      active ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink",
    );

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-8">
      <h1 className="text-[30px] font-semibold sm:text-4xl">Directory</h1>
      <p className="mt-1.5 text-base text-muted">
        Every organisation in the Basel life-sciences graph, {entities.length} in total. Filter by category, region or focus.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <div className="flex min-h-12 flex-[1_1_360px] items-center gap-2.5 rounded-xl border border-[#D9DDE3] bg-white px-3.5 focus-within:border-accent">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden />
          <label htmlFor="d-search" className="sr-only">Search the directory</label>
          <input
            id="d-search"
            type="search"
            placeholder="Search by name, description or focus area"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/80"
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <label htmlFor="d-canton" className="sr-only">Region</label>
          <RegionSelect id="d-canton" className="h-12 rounded-xl font-medium" value={canton} onChange={setCanton} />
        </div>
        <div role="group" aria-label="View" className="inline-flex gap-0.5 rounded-xl bg-[#EAECEF] p-[3px]">
          <button type="button" aria-label="Table view" aria-pressed={view === "table"} className={viewButton(view === "table")} onClick={() => setView("table")}>
            <List className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <button type="button" aria-label="Card view" aria-pressed={view === "cards"} className={viewButton(view === "cards")} onClick={() => setView("cards")}>
            <LayoutGrid className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      <div role="group" aria-label="Filter by category" className="mt-3.5 flex flex-wrap gap-2">
        <button type="button" className={pill(!type)} aria-pressed={!type} onClick={() => setType(null)}>
          All <span className="font-mono text-xs opacity-80">{entities.length}</span>
        </button>
        {ENTITY_TYPES.filter((t) => counts.get(t)).map((t) => (
          <button key={t} type="button" className={pill(type === t)} aria-pressed={type === t} onClick={() => setType(t)}>
            <span aria-hidden className="h-2 w-2 rounded-sm" style={{ backgroundColor: TYPE_META[t].color }} />
            {TYPE_META[t].label} <span className="font-mono text-xs opacity-80">{counts.get(t)}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? "organisation" : "organisations"}, sorted A to Z
      </p>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Nothing matches" body="Clear the search, choose another type or include all regions." />
        </div>
      ) : view === "cards" ? (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5">
          {shown.map((e) => (
            <li key={e.id}>
              <MatchCard entity={e} />
            </li>
          ))}
        </ul>
      ) : (
        <DirectoryTable entities={shown} />
      )}
    </div>
  );
}

function DirectoryTable({ entities }: { entities: Entity[] }) {
  const openDetail = useNavigator((s) => s.openDetail);
  const shortlist = useNavigator((s) => s.shortlist);
  const toggleShortlist = useNavigator((s) => s.toggleShortlist);
  const regionName = useRegionName();
  const th = "border-b border-line bg-[#FAFBFC] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-muted";

  return (
    <div className="mt-4 overflow-hidden rounded-[18px] border border-line bg-white">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <caption className="sr-only">Organisations in the directory</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Organisation</th>
              <th scope="col" className={th}>Category</th>
              <th scope="col" className={th}>Region</th>
              <th scope="col" className={th}>Focus</th>
              <th scope="col" className={th}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => {
              const meta = TYPE_META[e.type];
              const saved = shortlist.includes(e.id);
              return (
                <tr key={e.id} className="border-b border-[#EEF0F3] last:border-0 hover:bg-[#FAFBFC]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-xs font-bold"
                        style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                      >
                        {initials(e.name)}
                      </span>
                      <button type="button" onClick={() => openDetail(e.id)} className="text-left font-semibold hover:text-primary">
                        {e.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="h-2 w-2 rounded-sm" style={{ backgroundColor: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#3A4352]">{regionName(e.canton)}</td>
                  <td className="max-w-[320px] px-4 py-3.5 text-muted">
                    {e.focusAreas.slice(0, 3).map((a) => (a === "all" ? "all fields" : a)).join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <Button size="sm" variant={saved ? "accent" : "outline"} aria-pressed={saved} onClick={() => toggleShortlist(e.id)}>
                      {saved ? "Saved" : "Save"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/[\s,&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function DirectorySkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 px-4 py-10 sm:px-8" role="status" aria-label="Loading directory">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
