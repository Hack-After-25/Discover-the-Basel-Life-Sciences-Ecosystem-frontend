"use client";

import { Bookmark, BookmarkCheck, Mail } from "lucide-react";
import { useNavigator } from "@/lib/store";
import type { Entity, Match } from "@/lib/types";
import { ScoreRing } from "./score-ring";
import { Button } from "./ui/button";
import { CantonBadge, TypeBadge } from "./type-badge";
import { useT } from "./site-provider";

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
  const t = useT();

  const verified = formatVerified(entity.lastVerified);

  return (
    <article className="flex h-full flex-col gap-3 rounded-[18px] border border-line bg-card p-[18px] shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={entity.type} />
            <CantonBadge canton={entity.canton} />
          </div>
          <h3 className="mt-2.5 text-base font-semibold leading-snug">
            <button type="button" onClick={() => openDetail(entity.id)} className="text-left hover:text-primary">
              {entity.name}
            </button>
          </h3>
        </div>
        {match && <ScoreRing score={match.score} />}
      </div>

      <p className="text-sm leading-relaxed text-ink-2">{match ? match.reason : entity.description}</p>

      {(entity.facilities.length > 0 || entity.focusAreas.length > 0) && (
        <ul className="flex flex-wrap gap-1.5" aria-label={t("card.tags")}>
          {(entity.facilities.length > 0 ? entity.facilities.slice(0, 3) : entity.focusAreas.slice(0, 3)).map((item) => (
            <li key={item} className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">
              {item === "all" ? t("common.allFields") : item}
            </li>
          ))}
        </ul>
      )}

      {entity.availability && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-accent-dark">
          <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-[#10B981]" />
          {entity.availability}
        </p>
      )}

      <p className="text-xs text-muted">
        {t("card.source", { source: entity.source })}
        {verified && t("card.verified", { date: verified })}
      </p>

      {match && match.citations.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-primary">{t("card.why")}</summary>
          <ul className="mt-2 space-y-2">
            {match.citations.map((c, i) => (
              <li key={i} className="rounded-[10px] border border-line bg-surface p-2.5">
                <a href={c.url} target="_blank" rel="noreferrer" className="font-medium text-ink underline underline-offset-2">
                  {c.source}
                </a>
                <p className="mt-1 text-muted">{c.snippet}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-mono text-xs text-muted">{t("card.audit", { id: match.auditId })}</p>
        </details>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant={shortlisted ? "accent" : "outline"}
          aria-pressed={shortlisted}
          onClick={() => toggleShortlist(entity.id)}
        >
          {shortlisted ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
          {shortlisted ? t("directory.saved") : t("directory.save")}
        </Button>
        {hasProfile && (
          <Button size="sm" variant="outline" onClick={() => openEmail(entity.id)}>
            <Mail className="h-4 w-4" aria-hidden />
            {t("card.draftIntro")}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => openDetail(entity.id)}>
          {t("common.details")}
        </Button>
      </div>
    </article>
  );
}

function formatVerified(iso: string | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
