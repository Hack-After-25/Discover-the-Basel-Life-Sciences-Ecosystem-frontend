"use client";

import dynamic from "next/dynamic";
import { useNavigator } from "@/lib/store";
import { EmptyState } from "./empty-state";
import { TypeLegend } from "./type-legend";
import { Skeleton } from "./ui/skeleton";
import { useT } from "./site-provider";
import type { TextKey } from "@/lib/texts";

const GraphView = dynamic(() => import("./graph-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] w-full rounded-2xl" />,
});

export function GraphTab() {
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const relations = useNavigator((s) => s.relations);
  const entities = useNavigator((s) => s.entities);
  const openDetail = useNavigator((s) => s.openDetail);
  const t = useT();

  if (!profile || matches.length === 0) {
    return (
      <EmptyState
        title={t("graph.empty.title")}
        body={t("graph.empty.body")}
        actionLabel={t("results.none.action")}
        actionHref="/profile"
      />
    );
  }

  const matchedIds = new Set(matches.map((m) => m.entity.id));
  const name = (id: string) => entities.find((e) => e.id === id)?.name;
  const visible = relations.filter(
    (r) => (matchedIds.has(r.source) || matchedIds.has(r.target)) && name(r.source) && name(r.target),
  );

  return (
    <div>
      <TypeLegend />
      <p className="mt-2 max-w-prose text-sm text-muted">
        {t("graph.help")}
      </p>
      <div className="mt-4">
        <GraphView profile={profile} matches={matches} relations={relations} entities={entities} onSelect={openDetail} />
      </div>

      {/* Text alternative for keyboard and screen-reader users */}
      <details className="mt-4 rounded-xl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-medium">{t("graph.list")}</summary>
        {visible.length === 0 ? (
          <p className="mt-3 text-muted">{t("graph.noRelations")}</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {visible.map((r) => (
              <li key={`${r.source}-${r.type}-${r.target}`}>
                <button type="button" className="text-left text-primary underline-offset-2 hover:underline" onClick={() => openDetail(r.source)}>
                  {name(r.source)}
                </button>{" "}
                <span className="text-muted">{t(`relations.${r.type}` as TextKey)}</span>{" "}
                <button type="button" className="text-left text-primary underline-offset-2 hover:underline" onClick={() => openDetail(r.target)}>
                  {name(r.target)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
