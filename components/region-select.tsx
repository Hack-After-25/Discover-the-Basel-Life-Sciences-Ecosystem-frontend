"use client";

import { useNavigator } from "@/lib/store";
import type { Canton } from "@/lib/types";
import { Select } from "./ui/input";

/** Region filter whose options are the regions the backend has organisations in. */
export function RegionSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Canton | "";
  onChange: (value: Canton | "") => void;
}) {
  const regions = useNavigator((s) => s.regions);
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All regions</option>
      {regions.map((r) => (
        <option key={r.code} value={r.code}>
          {r.name}
        </option>
      ))}
    </Select>
  );
}
