"use client";

import { useMemo, useState } from "react";
import { ENTITY_TYPES, NEED_META, TYPE_META } from "@/lib/entity-meta";
import { useNavigator } from "@/lib/store";
import type { Canton, EntityType, NeedCategory } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { MatchCard } from "./match-card";
import { Select } from "./ui/input";

export function MatchesTab() {
  const matches = useNavigator((s) => s.matches);
  const [type, setType] = useState<EntityType | "">("");
  const [canton, setCanton] = useState<Canton | "">("");
  const [minScore, setMinScore] = useState(0);

  const groups = useMemo(() => {
    const filtered = matches.filter(
      (m) => (!type || m.entity.type === type) && (!canton || m.entity.canton === canton) && m.score >= minScore,
    );
    const byNeed = new Map<NeedCategory, typeof filtered>();
    for (const m of filtered) byNeed.set(m.needCategory, [...(byNeed.get(m.needCategory) ?? []), m]);
    return Array.from(byNeed.entries());
  }, [matches, type, canton, minScore]);

  return (
    <div>
      <fieldset className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3">
        <legend className="sr-only">Filter matches</legend>
        <div>
          <label htmlFor="f-type" className="mb-1 block text-sm font-medium">Type</label>
          <Select id="f-type" value={type} onChange={(e) => setType(e.target.value as EntityType | "")}>
            <option value="">All types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_META[t].label}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="f-canton" className="mb-1 block text-sm font-medium">Canton</label>
          <Select id="f-canton" value={canton} onChange={(e) => setCanton(e.target.value as Canton | "")}>
            <option value="">Both cantons</option>
            <option value="BS">Basel-Stadt</option>
            <option value="BL">Basel-Landschaft</option>
          </Select>
        </div>
        <div>
          <label htmlFor="f-score" className="mb-1 block text-sm font-medium">
            Minimum match: <span className="tabular-nums">{minScore}</span>
          </label>
          <input
            id="f-score"
            type="range"
            min={0}
            max={90}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="h-10 w-full accent-[#0E8F8A]"
          />
        </div>
      </fieldset>

      {groups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No matches with these filters"
            body="Lower the minimum match, choose all types or include both cantons to see results again."
          />
        </div>
      ) : (
        groups.map(([need, items]) => (
          <section key={need} className="mt-8" aria-labelledby={`need-${need}`}>
            <h2 id={`need-${need}`} className="text-xl font-semibold">
              {NEED_META[need].label}
              <span className="ml-2 text-sm font-normal text-muted">{items.length} matches</span>
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {items.map((m) => (
                <li key={`${m.needCategory}-${m.entity.id}`}>
                  <MatchCard entity={m.entity} match={m} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
