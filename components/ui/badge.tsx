import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary-soft text-primary-soft-foreground ring-1 ring-primary/15",
        secondary:
          "bg-surface-2 text-muted-foreground ring-1 ring-border",
        success:
          "bg-success-soft text-success-soft-foreground ring-1 ring-success/20",
        warning:
          "bg-warning-soft text-warning-soft-foreground ring-1 ring-warning/20",
        danger:
          "bg-danger-soft text-danger-soft-foreground ring-1 ring-danger/20",
        info:
          "bg-info-soft text-info-soft-foreground ring-1 ring-info/20",
        outline:
          "border border-border text-muted-foreground",
        accent:
          "bg-accent text-accent-foreground",
        glow:
          "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgb(4_120_87_/_0.15)] dark:shadow-[0_0_0_4px_rgb(16_185_129_/_0.2)]",
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
