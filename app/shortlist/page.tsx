"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStageLabel } from "@/lib/labels";
import { useT } from "@/components/site-provider";
import { useHydrated, useNavigator } from "@/lib/store";
import type { Entity } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { CantonBadge, TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_COMPARE = 3;

export default function ShortlistPage() {
  const hydrated = useHydrated();
  const shortlist = useNavigator((s) => s.shortlist);
  const entities = useNavigator((s) => s.entities);
  const notes = useNavigator((s) => s.notes);
  const setNote = useNavigator((s) => s.setNote);
  const toggleShortlist = useNavigator((s) => s.toggleShortlist);
  const openDetail = useNavigator((s) => s.openDetail);
  const openEmail = useNavigator((s) => s.openEmail);
  const hasProfile = useNavigator((s) => s.profile !== null);
  const hasResults = useNavigator((s) => s.matches.length > 0);

  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const t = useT();

  if (!hydrated || (shortlist.length > 0 && entities.length === 0)) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6" role="status" aria-label={t("shortlist.loading")}>
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const saved = shortlist.map((id) => entities.find((e) => e.id === id)).filter((e): e is Entity => Boolean(e));
  const compared = saved.filter((e) => selected.includes(e.id));

  const toggleSelected = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_COMPARE ? [...s, id] : s));

  if (saved.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title={t("shortlist.empty.title")}
          body={t("shortlist.empty.body")}
          actionLabel={hasResults ? t("shortlist.empty.results") : t("common.describeNeeds")}
          actionHref={hasResults ? "/results" : "/"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-semibold sm:text-4xl">{t("shortlist.title")}</h1>
          <p className="mt-1.5 text-base text-muted">
            {t("shortlist.saved", { count: saved.length })}{" "}
            {compareMode ? t("shortlist.compareHint", { max: MAX_COMPARE }) : t("shortlist.notesHint")}
          </p>
        </div>
        <Button
          variant={compareMode ? "accent" : "outline"}
          aria-pressed={compareMode}
          onClick={() => {
            setCompareMode((c) => !c);
            setSelected([]);
          }}
          disabled={saved.length < 2}
        >
          {compareMode ? t("shortlist.exitCompare") : t("shortlist.compare")}
        </Button>
      </div>

      {compareMode && compared.length >= 2 && <CompareTable entities={compared} notes={notes} />}
      {compareMode && compared.length < 2 && (
        <p className="mt-5 rounded-xl border border-dashed border-field bg-card p-4 text-sm text-muted">{t("shortlist.selectTwo")}</p>
      )}

      <ul className="mt-6 space-y-3.5">
        {saved.map((entity) => {
          const checked = selected.includes(entity.id);
          return (
            <li key={entity.id} className="rounded-[18px] border border-line bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    <TypeBadge type={entity.type} />
                    <CantonBadge canton={entity.canton} />
                  </div>
                  <h2 className="mt-2 text-lg font-semibold leading-snug">{entity.name}</h2>
                </div>
                {compareMode && (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#2446F5]"
                      checked={checked}
                      disabled={!checked && selected.length >= MAX_COMPARE}
                      onChange={() => toggleSelected(entity.id)}
                    />
                    {t("shortlist.compare")}
                  </label>
                )}
              </div>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{entity.description}</p>

              <label htmlFor={`note-${entity.id}`} className="mt-4 block text-[13px] font-semibold text-ink-3">
                {t("shortlist.notes")}
              </label>
              <Textarea
                id={`note-${entity.id}`}
                rows={2}
                className="mt-1"
                placeholder={t("shortlist.notesPlaceholder")}
                value={notes[entity.id] ?? ""}
                onChange={(e) => setNote(entity.id, e.target.value)}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openDetail(entity.id)}>
                  {t("common.details")}
                </Button>
                {hasProfile && (
                  <Button size="sm" variant="outline" onClick={() => openEmail(entity.id)}>
                    {t("shortlist.draftEmail")}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => toggleShortlist(entity.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t("shortlist.remove")}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CompareTable({ entities, notes }: { entities: Entity[]; notes: Record<string, string> }) {
  const t = useT();
  const stageLabel = useStageLabel();
  const rows: { label: string; value: (e: Entity) => React.ReactNode }[] = [
    { label: t("shortlist.row.type"), value: (e) => <TypeBadge type={e.type} /> },
    { label: t("shortlist.row.region"), value: (e) => <CantonBadge canton={e.canton} /> },
    { label: t("shortlist.row.focus"), value: (e) => e.focusAreas.map((a) => (a === "all" ? t("common.allFields") : a)).join(", ") },
    { label: t("shortlist.row.stage"), value: (e) => e.stageFit.map((s) => stageLabel(s)).join(", ") },
    { label: t("shortlist.row.facilities"), value: (e) => e.facilities.join(", ") || t("shortlist.row.noFacilities") },
    {
      label: t("shortlist.row.website"),
      value: (e) => (
        <a className="text-primary underline" href={e.website} target="_blank" rel="noreferrer">
          {e.website.replace(/^https?:\/\//, "")}
        </a>
      ),
    },
    { label: t("shortlist.row.notes"), value: (e) => notes[e.id] || t("shortlist.row.noNotes") },
  ];

  return (
    <div className="mt-6 overflow-x-auto rounded-[18px] border border-line bg-card">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{t("shortlist.table")}</caption>
        <thead>
          <tr>
            <td className="w-44 bg-card-2 p-4" />
            {entities.map((e) => (
              <th key={e.id} scope="col" className="p-4 align-top text-[17px] font-semibold leading-snug">
                {e.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line align-top">
              <th scope="row" className="bg-card-2 p-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                {row.label}
              </th>
              {entities.map((e) => (
                <td key={e.id} className="p-4">
                  {row.value(e)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
