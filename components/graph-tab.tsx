"use client";

import dynamic from "next/dynamic";
import { RELATION_LABEL } from "@/lib/i18n";
import { useNavigator } from "@/lib/store";
import { EmptyState } from "./empty-state";
import { TypeLegend } from "./type-legend";
import { Skeleton } from "./ui/skeleton";

const GraphView = dynamic(() => import("./graph-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-[540px] w-full rounded-2xl" />,
});

export function GraphTab() {
  const profile = useNavigator((s) => s.profile);
  const matches = useNavigator((s) => s.matches);
  const relations = useNavigator((s) => s.relations);
  const entities = useNavigator((s) => s.entities);
  const openDetail = useNavigator((s) => s.openDetail);

  if (!profile || matches.length === 0) {
    return (
      <EmptyState
        title="Nothing to connect yet"
        body="The graph appears once you have matches."
        actionLabel="Edit profile"
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
        Grey lines link you to your matches. Teal arrows are relationships from the knowledge graph, such as who funds or
        hosts whom. Faded nodes are not matches themselves but connect to one. Hover a line to read the relationship,
        select a node for details, zoom in to read names.
      </p>
      <div className="mt-4">
        <GraphView profile={profile} matches={matches} relations={relations} entities={entities} onSelect={openDetail} />
      </div>

      {/* Text alternative for keyboard and screen-reader users */}
      <details className="mt-4 rounded-xl border border-line p-4 text-sm">
        <summary className="cursor-pointer font-medium">Show the relationships as a list</summary>
        {visible.length === 0 ? (
          <p className="mt-3 text-muted">No known relationships between these organisations.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {visible.map((r) => (
              <li key={`${r.source}-${r.type}-${r.target}`}>
                <button type="button" className="text-left text-primary underline-offset-2 hover:underline" onClick={() => openDetail(r.source)}>
                  {name(r.source)}
                </button>{" "}
                <span className="text-muted">{RELATION_LABEL[r.type]}</span>{" "}
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
