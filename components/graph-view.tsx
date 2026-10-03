"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { TYPE_META } from "@/lib/entity-meta";
import { RELATION_LABEL } from "@/lib/i18n";
import type { Entity, Match, Profile, Relation } from "@/lib/types";

interface Props {
  profile: Profile;
  matches: Match[];
  relations: Relation[];
  entities: Entity[];
  onSelect: (entityId: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  color: string;
  size: number;
  isStartup?: boolean;
  /** Not a match itself, but linked to one in the knowledge graph. */
  neighbour?: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  kind: "match" | "relation";
}

const STARTUP_ID = "__startup__";

/** Client-only: load with next/dynamic and ssr: false. */
export default function GraphView({ profile, matches, relations, entities, onSelect }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    const best = new Map<string, Match>();
    for (const m of matches) {
      const current = best.get(m.entity.id);
      if (!current || m.score > current.score) best.set(m.entity.id, m);
    }
    const matched = Array.from(best.values());
    const byId = new Map(entities.map((e) => [e.id, e]));

    // One hop out from the matches: the path "lab -> programme -> investor".
    const edges = relations.filter((r) => best.has(r.source) || best.has(r.target));
    const neighbourIds = new Set<string>();
    for (const r of edges) {
      for (const id of [r.source, r.target]) if (!best.has(id) && byId.has(id)) neighbourIds.add(id);
    }

    const nodes: GraphNode[] = [
      { id: STARTUP_ID, label: profile.companyName ?? "Your team", color: "#123B7A", size: 9, isStartup: true },
      ...matched.map((m) => ({
        id: m.entity.id,
        label: m.entity.name,
        color: TYPE_META[m.entity.type].color,
        size: 3 + m.score / 25,
      })),
      ...Array.from(neighbourIds).map((id) => {
        const e = byId.get(id)!;
        return { id, label: e.name, color: `${TYPE_META[e.type].color}80`, size: 3.5, neighbour: true };
      }),
    ];
    const present = new Set(nodes.map((n) => n.id));

    const links: GraphLink[] = [
      ...matched.map((m) => ({ source: STARTUP_ID, target: m.entity.id, label: "matched to your needs", kind: "match" as const })),
      ...edges
        .filter((r) => present.has(r.source) && present.has(r.target))
        .map((r) => ({ source: r.source, target: r.target, label: RELATION_LABEL[r.type], kind: "relation" as const })),
    ];
    return { nodes, links };
  }, [matches, relations, entities, profile.companyName]);

  return (
    <div ref={wrapper} className="overflow-hidden rounded-2xl border border-line bg-white">
      <ForceGraph2D
        graphData={data}
        width={width}
        height={540}
        backgroundColor="#ffffff"
        nodeRelSize={1}
        nodeVal={(n) => Math.pow((n as GraphNode).size, 2)}
        nodeColor={(n) => (n as GraphNode).color}
        nodeLabel={(n) => (n as GraphNode).label}
        linkLabel={(l) => (l as unknown as GraphLink).label}
        linkColor={(l) => ((l as unknown as GraphLink).kind === "match" ? "#B9C6DC" : "#0E8F8A")}
        linkWidth={(l) => ((l as unknown as GraphLink).kind === "match" ? 0.8 : 1.6)}
        linkDirectionalArrowLength={(l) => ((l as unknown as GraphLink).kind === "relation" ? 4 : 0)}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={120}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(n, ctx, scale) => {
          const node = n as GraphNode;
          if (node.x === undefined || node.y === undefined) return;
          if (!node.isStartup && scale < 1.1) return;
          const fontSize = (node.isStartup ? 13 : 11) / scale;
          ctx.font = `${node.isStartup ? 600 : 400} ${fontSize}px "Schibsted Grotesk Variable", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = node.neighbour ? "#5A6781" : "#14213D";
          const label = node.label.length > 34 ? `${node.label.slice(0, 32)}…` : node.label;
          ctx.fillText(label, node.x, node.y + node.size + 2 / scale);
        }}
        onNodeClick={(n) => {
          const node = n as GraphNode;
          if (!node.isStartup) onSelect(node.id);
        }}
      />
    </div>
  );
}
