import * as React from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-md border border-field bg-card px-3 text-[15px] text-ink placeholder:text-muted/70 focus-visible:border-accent";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(field, "h-11", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(field, "py-2 leading-relaxed", className)} {...props} />,
);
Textarea.displayName = "Textarea";
