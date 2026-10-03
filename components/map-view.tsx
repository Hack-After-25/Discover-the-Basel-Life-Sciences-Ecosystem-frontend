"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { TYPE_META } from "@/lib/entity-meta";
import type { Entity } from "@/lib/types";

interface Props {
  entities: Entity[];
  matchedIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const BASEL: [number, number] = [47.5596, 7.5886];

/** Client-only: load with next/dynamic and ssr: false. */
export default function MapView({ entities, matchedIds, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={BASEL}
      zoom={11}
      scrollWheelZoom
      className="h-[420px] w-full rounded-2xl border border-line md:h-[540px]"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {entities.map((entity) => {
        const matched = matchedIds.has(entity.id);
        const selected = entity.id === selectedId;
        return (
          <CircleMarker
            key={entity.id}
            center={[entity.lat, entity.lng]}
            radius={selected ? 12 : matched ? 9 : 6}
            pathOptions={{
              color: selected ? "#14213D" : "#ffffff",
              weight: selected ? 3 : 2,
              fillColor: TYPE_META[entity.type].color,
              fillOpacity: matched ? 0.95 : 0.5,
            }}
            eventHandlers={{ click: () => onSelect(entity.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {entity.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
