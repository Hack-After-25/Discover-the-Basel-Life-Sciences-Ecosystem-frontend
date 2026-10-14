"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "./site-provider";


const STEPS = ["steps.1", "steps.2", "steps.3"] as const;

/** Where the user is in describe → check → results. `current` is 0-based. */
export function FlowSteps({ current }: { current: number }) {
  const t = useT();
  return (
    <ol aria-label={t("steps.label")} className="flex items-center gap-2 text-sm sm:flex-wrap sm:gap-2.5">
      {STEPS.map((label, i) => (
        <li key={label} className="flex min-w-0 items-center gap-2 sm:gap-2.5" aria-current={i === current ? "step" : undefined}>
          {i > 0 && (
            <span aria-hidden className={cn("h-0.5 w-6 shrink-0 rounded sm:w-10", i <= current ? "bg-accent" : "bg-field")} />
          )}
          <span className={cn("flex items-center gap-2", i === current ? "font-semibold text-ink" : "text-muted")}>
            <span
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs",
                i < current && "bg-accent text-white",
                i === current && "bg-cta font-bold text-on-cta",
                i > current && "border-[1.5px] border-field-hover",
              )}
            >
              {i < current ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            {/* On phones only the current step keeps its name, so the bar fits one line. */}
            <span className={cn(i !== current && "sr-only sm:not-sr-only")}>{t(label)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
