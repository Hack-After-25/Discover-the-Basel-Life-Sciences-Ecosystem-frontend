import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-dark",
        accent: "bg-primary text-white hover:bg-primary-dark",
        outline: "border border-line bg-white text-ink hover:border-[#C9CED6] hover:bg-surface",
        ghost: "text-primary hover:bg-primary-soft",
      },
      size: {
        sm: "h-9 rounded-[10px] px-3 text-[13px]",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? "button"}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
