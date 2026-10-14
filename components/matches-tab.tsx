"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ENTITY_TYPES, NEED_TO_ENTITY_TYPE, TYPE_META } from "@/lib/entity-meta";
import { useNavigator } from "@/lib/store";
import { useNeedLabel, useTypeLabel } from "@/lib/labels";
import { useT } from "./site-provider";
import type { Canton, EntityType, Match, NeedCategory } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { MatchCard } from "./match-card";
import { RegionSelect } from "./region-select";
import { Button } from "./ui/button";
import { Dropdown } from "./ui/dropdown";

export function MatchesTab() {
  const matches = useNavigator((s) => s.matches);
  const [type, setType] = useState<EntityType | "">("");
  const [canton, setCanton] = useState<Canton | "">("");
  const [minScore, setMinScore] = useState(0);
  const t = useT();
  const typeLabel = useTypeLabel();
  const needLabel = useNeedLabel();

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
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">{t("matches.filterLegend")}</legend>
        <span className="text-[13px] text-muted">{t("matches.filters")}</span>
        <label htmlFor="f-type" className="sr-only">{t("matches.type")}</label>
        <Dropdown
          id="f-type"
          size="sm"
          className="w-auto"
          value={type}
          onChange={(v) => setType(v as EntityType | "")}
          options={[{ value: "", label: t("matches.allTypes") }, ...ENTITY_TYPES.map((et) => ({ value: et, label: typeLabel(et) }))]}
        />
        <label htmlFor="f-canton" className="sr-only">{t("matches.region")}</label>
        <RegionSelect id="f-canton" size="sm" className="w-auto" value={canton} onChange={setCanton} />
        <label htmlFor="f-score" className="ml-1 flex h-10 items-center gap-2 rounded-[10px] border border-field bg-card px-3 text-[13px] font-medium">
          {t("matches.minScore")} <span className="w-6 font-mono tabular-nums">{minScore}</span>
          <input
            id="f-score"
            type="range"
            min={0}
            max={90}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-24 accent-[#2446F5]"
          />
        </label>
      </fieldset>

      {groups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("matches.none.title")}
            body={t("matches.none.body")}
          />
        </div>
      ) : (
        groups.map(([need, items]) => {
          const providers = items.filter((m) => m.role !== "programme");
          const programmes = items.filter((m) => m.role === "programme");
          const entityType = NEED_TO_ENTITY_TYPE[need];
          return (
            <section key={need} id={`need-${need}`} className="mt-8 scroll-mt-28" aria-labelledby={`need-${need}-title`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`need-${need}-title`} className="flex items-center gap-2.5 text-xl font-semibold">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: TYPE_META[entityType].color }} />
                  {needLabel(need)}
                  <span className="text-sm font-normal text-muted">
                    {t(providers.length === 1 ? "results.match.one" : "results.match.many", { count: providers.length })}
                  </span>
                </h2>
                <Link href={`/directory?type=${entityType}`} className="text-sm font-semibold text-primary hover:text-accent">
                  {t("matches.seeAll", { type: typeLabel(entityType).toLowerCase() })}
                </Link>
              </div>
              {providers.length > 0 ? (
                <MatchList items={providers} />
              ) : (
                <p className="mt-3 text-sm text-muted">{t("matches.noDirect")}</p>
              )}
              {programmes.length > 0 && (
                <div className="mt-4 rounded-2xl border border-cta/50 bg-cta/10 p-4">
                  <h3 className="text-[15px] font-semibold">
                    {t("matches.programmes")}{" "}
                    <span className="text-[13px] font-normal text-muted">
                      {t("matches.programmesNote")}
                    </span>
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {programmes.map((m) => (
                      <li key={`${m.needCategory}-${m.entity.id}`}>
                        <ProgrammeRow match={m} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

function ProgrammeRow({ match }: { match: Match }) {
  const openDetail = useNavigator((s) => s.openDetail);
  const { entity } = match;
  const t = useT();
  const initials = entity.name
    .split(/[\s,&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-[#F3E2CC] bg-card px-3.5 py-3">
      <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FDEBDD] text-[13px] font-bold text-[#B8430F]">
        {initials}
      </span>
      <div className="min-w-0 flex-[1_1_260px]">
        <p className="font-semibold">{entity.name}</p>
        <p className="mt-0.5 text-[13px] text-muted">{match.reason}</p>
      </div>
      <span className="font-mono text-[13px] text-muted" aria-label={t("matches.score", { score: match.score })}>
        {match.score}
      </span>
      <Button size="sm" variant="outline" onClick={() => openDetail(entity.id)}>
        {t("common.details")}
      </Button>
    </div>
  );
}

function MatchList({ items }: { items: Match[] }) {
  return (
    <ul className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5">
      {items.map((m) => (
        <li key={`${m.needCategory}-${m.entity.id}`}>
          <MatchCard entity={m.entity} match={m} />
        </li>
      ))}
    </ul>
  );
}
