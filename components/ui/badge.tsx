import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50",
        secondary: "bg-stone-100 text-stone-700 ring-1 ring-stone-200/50",
        success: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50",
        warning: "bg-amber-100 text-amber-800 ring-1 ring-amber-200/50",
        danger: "bg-red-100 text-red-700 ring-1 ring-red-200/50",
        outline: "border border-stone-200 text-stone-600",
        accent: "bg-amber-500 text-white",
        glow: "bg-emerald-700 text-white shadow-[0_0_0_4px_rgb(4_120_87_/_0.15)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
