"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { STAGE_LABEL } from "@/lib/entity-meta";
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

  if (!hydrated || (shortlist.length > 0 && entities.length === 0)) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6" role="status" aria-label="Loading shortlist">
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
          title="Your shortlist is empty"
          body='Choose "Add to shortlist" on any match to keep it here with your notes and compare options side by side.'
          actionLabel={hasResults ? "Go to results" : "Describe your needs"}
          actionHref={hasResults ? "/results" : "/"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Shortlist</h1>
          <p className="mt-2 text-muted">
            {saved.length} saved. {compareMode ? `Select up to ${MAX_COMPARE} to compare.` : "Add notes as you talk to each one."}
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
          {compareMode ? "Exit compare" : "Compare"}
        </Button>
      </div>

      {compareMode && compared.length >= 2 && <CompareTable entities={compared} notes={notes} />}
      {compareMode && compared.length < 2 && (
        <p className="mt-5 rounded-xl bg-surface p-4 text-sm text-muted">Select at least two entries below to see them side by side.</p>
      )}

      <ul className="mt-6 space-y-4">
        {saved.map((entity) => {
          const checked = selected.includes(entity.id);
          return (
            <li key={entity.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
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
                      className="h-4 w-4 accent-[#0E8F8A]"
                      checked={checked}
                      disabled={!checked && selected.length >= MAX_COMPARE}
                      onChange={() => toggleSelected(entity.id)}
                    />
                    Compare
                  </label>
                )}
              </div>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{entity.description}</p>

              <label htmlFor={`note-${entity.id}`} className="mt-4 block text-sm font-medium">
                Notes
              </label>
              <Textarea
                id={`note-${entity.id}`}
                rows={2}
                className="mt-1"
                placeholder="e.g. Spoke to them on Tuesday, visit planned for next week"
                value={notes[entity.id] ?? ""}
                onChange={(e) => setNote(entity.id, e.target.value)}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openDetail(entity.id)}>
                  Details
                </Button>
                {hasProfile && (
                  <Button size="sm" variant="outline" onClick={() => openEmail(entity.id)}>
                    Draft intro email
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => toggleShortlist(entity.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
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
  const rows: { label: string; value: (e: Entity) => React.ReactNode }[] = [
    { label: "Type", value: (e) => <TypeBadge type={e.type} /> },
    { label: "Canton", value: (e) => <CantonBadge canton={e.canton} /> },
    { label: "Focus areas", value: (e) => e.focusAreas.map((a) => (a === "all" ? "all fields" : a)).join(", ") },
    { label: "Stage fit", value: (e) => e.stageFit.map((s) => STAGE_LABEL[s]).join(", ") },
    { label: "Facilities", value: (e) => e.facilities.join(", ") || "None listed" },
    {
      label: "Website",
      value: (e) => (
        <a className="text-primary underline" href={e.website} target="_blank" rel="noreferrer">
          {e.website.replace(/^https?:\/\//, "")}
        </a>
      ),
    },
    { label: "Your notes", value: (e) => notes[e.id] || "No notes yet" },
  ];

  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">Side-by-side comparison of selected shortlist entries</caption>
        <thead>
          <tr className="bg-primary text-white">
            <td className="w-32 p-3" />
            {entities.map((e) => (
              <th key={e.id} scope="col" className="p-3 align-top font-semibold">
                {e.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line align-top">
              <th scope="row" className="bg-surface p-3 font-medium">
                {row.label}
              </th>
              {entities.map((e) => (
                <td key={e.id} className="p-3">
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
