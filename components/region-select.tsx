"use client";

import { useNavigator } from "@/lib/store";
import type { Canton } from "@/lib/types";
import { Dropdown } from "./ui/dropdown";

/** Region filter whose options are the regions the backend has organisations in. */
export function RegionSelect({
  id,
  value,
  onChange,
  size,
  className,
}: {
  id: string;
  value: Canton | "";
  onChange: (value: Canton | "") => void;
  size?: "md" | "sm";
  className?: string;
}) {
  const regions = useNavigator((s) => s.regions);
  return (
    <Dropdown
      id={id}
      value={value}
      onChange={onChange}
      size={size}
      className={className}
      options={[{ value: "", label: "All regions" }, ...regions.map((r) => ({ value: r.code, label: r.name }))]}
    />
  );
}
