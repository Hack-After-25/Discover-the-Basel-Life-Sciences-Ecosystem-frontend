"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Radix Select cannot hold an empty value, so "" (meaning "all") travels as this sentinel. */
const EMPTY = "__all__";

export type DropdownOption = { value: string; label: string };

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  size?: "md" | "sm";
  className?: string;
  "aria-label"?: string;
  /** Shown when nothing is chosen and no option means "all". */
  placeholder?: React.ReactNode;
  /** Extra text after an option in the open menu only, e.g. "English" beside "EN". */
  itemLabel?: (option: DropdownOption) => React.ReactNode;
};

/** Styled replacement for a native select: rounded trigger, floating card menu, teal check on the chosen option. */
export function Dropdown({ id, value, onChange, options, size = "md", className, placeholder, itemLabel, ...rest }: Props) {
  const hasAll = options.some((o) => !o.value);
  return (
    <SelectPrimitive.Root value={value || (hasAll ? EMPTY : "")} onValueChange={(v) => onChange(v === EMPTY ? "" : v)}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={rest["aria-label"]}
        className={cn(
          "group inline-flex w-full items-center justify-between gap-2 rounded-[10px] border border-field bg-card px-3 text-left text-ink transition-colors",
          "hover:border-field-hover focus-visible:border-accent data-[state=open]:border-accent data-[state=open]:ring-4 data-[state=open]:ring-accent/10",
          size === "md" ? "h-11 text-[15px]" : "h-10 text-[13px] font-medium",
          className,
        )}
      >
        <span className="truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[1000] max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-menu data-[state=open]:animate-menu-in"
        >
          <SelectPrimitive.Viewport>
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value || EMPTY}
                value={o.value || EMPTY}
                className={cn(
                  "relative flex min-h-10 cursor-pointer select-none items-center gap-2 rounded-xl py-2 pl-3 pr-9 text-[14px] text-ink outline-none",
                  "data-[highlighted]:bg-surface data-[state=checked]:bg-accent-soft data-[state=checked]:font-semibold data-[state=checked]:text-accent-dark",
                )}
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                {itemLabel && <span className="text-muted">{itemLabel(o)}</span>}
                <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
