import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#F0F2F5] px-2.5 py-1 text-xs font-medium text-[#3A4352]",
        className,
      )}
      {...props}
    />
  );
}
