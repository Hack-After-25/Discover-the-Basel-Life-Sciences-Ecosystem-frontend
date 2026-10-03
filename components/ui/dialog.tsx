"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

interface ContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** "center" renders a modal, "right" renders a side drawer. */
  side?: "center" | "right";
}

export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ContentProps>(
  ({ className, children, side = "center", ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="no-print fixed inset-0 z-[1000] bg-ink/40" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "no-print fixed z-[1001] overflow-y-auto bg-white shadow-xl focus:outline-none",
          side === "center" &&
            "left-1/2 top-1/2 max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6",
          side === "right" && "inset-y-0 right-0 w-full max-w-md p-6",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 text-muted hover:bg-surface hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";
