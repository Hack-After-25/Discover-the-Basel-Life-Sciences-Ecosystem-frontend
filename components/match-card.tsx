"use client";

import { Bookmark, BookmarkCheck, Mail } from "lucide-react";
import { TYPE_META } from "@/lib/entity-meta";
import { useNavigator } from "@/lib/store";
import type { Entity, Match } from "@/lib/types";
import { Button } from "./ui/button";
import { CantonBadge, TypeBadge } from "./type-badge";

interface Props {
  entity: Entity;
  /** Present when the entity was matched to a need. */
  match?: Match;
}

export function MatchCard({ entity, match }: Props) {
  const shortlisted = useNavigator((s) => s.shortlist.includes(entity.id));
  const toggleShortlist = useNavigator((s) => s.toggleShortlist);
  const openDetail = useNavigator((s) => s.openDetail);
  const openEmail = useNavigator((s) => s.openEmail);
  const hasProfile = useNavigator((s) => s.profile !== null);
  const color = TYPE_META[entity.type].color;

  return (
    <article
      className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={entity.type} />
            <CantonBadge canton={entity.canton} />
          </div>
          <h3 className="mt-2.5 text-base font-semibold leading-snug">{entity.name}</h3>
        </div>
        {match && (
          <div className="shrink-0 text-right" aria-label={`Match score ${match.score} out of 100`}>
            <div className="text-2xl font-semibold tabular-nums text-primary">{match.score}</div>
            <div className="text-xs text-muted">match</div>
          </div>
        )}
      </div>

      <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent-dark">
        {match ? match.reason : entity.description}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Focus areas">
        {entity.focusAreas.slice(0, 4).map((area) => (
          <li key={area} className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
            {area === "all" ? "all fields" : area}
          </li>
        ))}
      </ul>

      {match && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-primary">Why this match?</summary>
          <ul className="mt-2 space-y-2">
            {match.citations.map((c, i) => (
              <li key={i} className="rounded-lg border border-line p-2.5">
                <a href={c.url} target="_blank" rel="noreferrer" className="font-medium text-ink underline underline-offset-2">
                  {c.source}
                </a>
                <p className="mt-1 text-muted">{c.snippet}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Audit reference {match.auditId}</p>
        </details>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button
          size="sm"
          variant={shortlisted ? "accent" : "outline"}
          aria-pressed={shortlisted}
          onClick={() => toggleShortlist(entity.id)}
        >
          {shortlisted ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
          {shortlisted ? "Shortlisted" : "Add to shortlist"}
        </Button>
        {hasProfile && (
          <Button size="sm" variant="outline" onClick={() => openEmail(entity.id)}>
            <Mail className="h-4 w-4" aria-hidden />
            Draft intro email
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => openDetail(entity.id)}>
          Details
        </Button>
      </div>
    </article>
  );
}
