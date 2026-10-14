import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Describe", "Check profile", "Matches and plan"];

/** Where the user is in describe → check → results. `current` is 0-based. */
export function FlowSteps({ current }: { current: number }) {
  return (
    <ol aria-label="Progress" className="flex flex-wrap items-center gap-2.5 text-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2.5" aria-current={i === current ? "step" : undefined}>
          {i > 0 && (
            <span aria-hidden className={cn("h-0.5 w-8 rounded sm:w-10", i <= current ? "bg-accent" : "bg-field")} />
          )}
          <span className={cn("flex items-center gap-2", i === current ? "font-semibold text-ink" : "text-muted")}>
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs",
                i < current && "bg-accent text-white",
                i === current && "bg-cta font-bold text-on-cta",
                i > current && "border-[1.5px] border-field-hover",
              )}
            >
              {i < current ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
