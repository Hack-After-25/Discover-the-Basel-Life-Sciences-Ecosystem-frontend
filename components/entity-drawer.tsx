"use client";

import { ExternalLink, Mail, MessageSquare } from "lucide-react";
import { useStageLabel } from "@/lib/labels";
import { useT } from "./site-provider";
import { useNavigator } from "@/lib/store";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { CantonBadge, TypeBadge } from "./type-badge";

export function EntityDrawer() {
  const detailId = useNavigator((s) => s.detailId);
  const entity = useNavigator((s) => s.entities.find((e) => e.id === s.detailId));
  const openDetail = useNavigator((s) => s.openDetail);
  const openEmail = useNavigator((s) => s.openEmail);
  const hasProfile = useNavigator((s) => s.profile !== null);
  const shortlisted = useNavigator((s) => (s.detailId ? s.shortlist.includes(s.detailId) : false));
  const toggleShortlist = useNavigator((s) => s.toggleShortlist);
  const t = useT();
  const stageLabel = useStageLabel();

  return (
    <Dialog open={detailId !== null} onOpenChange={(open) => !open && openDetail(null)}>
      <DialogContent side="right">
        {entity ? (
          <div className="space-y-6">
            <div className="pr-8">
              <div className="flex flex-wrap gap-1.5">
                <TypeBadge type={entity.type} />
                <CantonBadge canton={entity.canton} />
              </div>
              <DialogTitle className="mt-3 text-xl font-semibold leading-snug">{entity.name}</DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-relaxed text-muted">
                {entity.description}
              </DialogDescription>
            </div>

            <Section title={t("drawer.focus")} items={entity.focusAreas.map((a) => (a === "all" ? t("drawer.allFields") : a))} />
            <Section title={t("drawer.stage")} items={entity.stageFit.map((s) => stageLabel(s))} />
            <Section title={t("drawer.facilities")} items={entity.facilities} empty={t("drawer.noFacilities")} />
            {entity.availability && (
              <div>
                <h3 className="text-sm font-semibold">{t("drawer.availability")}</h3>
                <p className="mt-2 text-sm">{entity.availability}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold">{t("drawer.contact")}</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                <li>
                  <a className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline" href={entity.website} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    {entity.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
                <li>
                  {entity.contactEmail ? (
                    <a className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline" href={`mailto:${entity.contactEmail}`}>
                      <Mail className="h-4 w-4" aria-hidden />
                      {entity.contactEmail}
                    </a>
                  ) : (
                    <a className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline" href={entity.contactUrl || entity.website} target="_blank" rel="noreferrer">
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      {t("drawer.contactWebsite")}
                    </a>
                  )}
                </li>
              </ul>
              {!entity.contactEmail && (
                <p className="mt-2 text-xs text-muted">{t("drawer.noEmail")}</p>
              )}
            </div>

            <p className="text-xs text-muted">
              {t("drawer.source", { source: entity.source })}{" "}
              <a className="underline" href={entity.sourceUrl} target="_blank" rel="noreferrer">
                {entity.sourceUrl.replace(/^https?:\/\//, "")}
              </a>
              {t("drawer.verified", { date: entity.lastVerified ?? "" })}
            </p>

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <Button variant={shortlisted ? "accent" : "primary"} onClick={() => toggleShortlist(entity.id)}>
                {shortlisted ? t("drawer.remove") : t("drawer.add")}
              </Button>
              {hasProfile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    openDetail(null);
                    openEmail(entity.id);
                  }}
                >
                  {t("shortlist.draftEmail")}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <DialogTitle className="text-lg font-semibold">{t("drawer.notFound.title")}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted">
              {t("drawer.notFound.body")}
            </DialogDescription>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item} className="rounded-md bg-surface px-2 py-1 text-xs text-ink">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}
