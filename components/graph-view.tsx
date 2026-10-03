"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D, { type ForceGraphMethods } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
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
  z?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  kind: "match" | "relation";
}

const STARTUP_ID = "__startup__";
const HEIGHT = 560;

/** Interactive 3D knowledge graph. Client-only: load with next/dynamic and ssr: false. */
export default function GraphView({ profile, matches, relations, entities, onSelect }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const graph = useRef<ForceGraphMethods | undefined>(undefined);
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
        return { id, label: e.name, color: TYPE_META[e.type].color, size: 3, neighbour: true };
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

  /** Fly the camera to a node, then open its details. */
  const focusNode = (node: GraphNode) => {
    const { x = 0, y = 0, z = 0 } = node;
    const distance = 90;
    const ratio = 1 + distance / Math.max(Math.hypot(x, y, z), 1);
    graph.current?.cameraPosition({ x: x * ratio, y: y * ratio, z: z * ratio }, { x, y, z }, 900);
    if (!node.isStartup) onSelect(node.id);
  };

  return (
    <div ref={wrapper} className="relative overflow-hidden rounded-2xl border border-line bg-white">
      <ForceGraph3D
        ref={graph}
        graphData={data}
        width={width}
        height={HEIGHT}
        backgroundColor="#ffffff"
        showNavInfo={false}
        nodeRelSize={1}
        nodeVal={(n) => Math.pow((n as GraphNode).size, 2)}
        nodeColor={(n) => (n as GraphNode).color}
        nodeOpacity={0.95}
        nodeResolution={20}
        nodeLabel={(n) => (n as GraphNode).label}
        nodeThreeObjectExtend
        nodeThreeObject={(n: object) => {
          const node = n as GraphNode;
          const text = node.label.length > 30 ? `${node.label.slice(0, 28)}…` : node.label;
          const sprite = new SpriteText(text);
          sprite.color = node.neighbour ? "#5A6781" : "#14213D";
          sprite.textHeight = node.isStartup ? 5 : 3.2;
          sprite.fontWeight = node.isStartup ? "600" : "400";
          sprite.fontFace = '"Schibsted Grotesk Variable", Helvetica, Arial, sans-serif';
          sprite.backgroundColor = "rgba(255,255,255,0.75)";
          sprite.padding = 0.8;
          sprite.borderRadius = 1.5;
          sprite.position.set(0, -(node.size + 5), 0);
          return sprite;
        }}
        linkLabel={(l) => (l as unknown as GraphLink).label}
        linkColor={(l) => ((l as unknown as GraphLink).kind === "match" ? "#9FB0CC" : "#0E8F8A")}
        linkOpacity={0.7}
        linkWidth={(l) => ((l as unknown as GraphLink).kind === "match" ? 0.3 : 0.9)}
        linkDirectionalArrowLength={(l) => ((l as unknown as GraphLink).kind === "relation" ? 4 : 0)}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(l) => ((l as unknown as GraphLink).kind === "relation" ? 2 : 0)}
        linkDirectionalParticleWidth={1.4}
        linkDirectionalParticleSpeed={0.006}
        cooldownTicks={140}
        onEngineStop={() => graph.current?.zoomToFit(600, 60)}
        onNodeClick={(n) => focusNode(n as GraphNode)}
      />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={() => graph.current?.zoomToFit(600, 60)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-card hover:bg-surface"
        >
          Reset view
        </button>
      </div>
    </div>
  );
}
