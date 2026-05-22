import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "stone" | "rose" | "ink";

const TONE_STYLES: Record<
  Tone,
  { wrap: string; icon: string; value: string; sub: string }
> = {
  emerald: {
    wrap: "bg-primary-soft ring-primary/15",
    icon: "bg-primary/10 text-primary",
    value: "text-primary-soft-foreground",
    sub: "text-primary-soft-foreground/80",
  },
  amber: {
    wrap: "bg-accent-soft ring-accent/15",
    icon: "bg-accent/10 text-accent",
    value: "text-accent-soft-foreground",
    sub: "text-accent-soft-foreground/80",
  },
  stone: {
    wrap: "bg-surface-2 ring-border",
    icon: "bg-surface-3 text-muted-foreground",
    value: "text-foreground",
    sub: "text-muted-foreground",
  },
  rose: {
    wrap: "bg-danger-soft ring-danger/15",
    icon: "bg-danger/10 text-danger",
    value: "text-danger-soft-foreground",
    sub: "text-danger-soft-foreground/80",
  },
  ink: {
    wrap: "bg-foreground ring-foreground/40 dark:bg-surface-3 dark:ring-border",
    icon: "bg-background/10 text-accent",
    value: "text-background dark:text-foreground",
    sub: "text-background/70 dark:text-muted-foreground",
  },
};

type StatBadgeProps = {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: Tone;
  className?: string;
};

/**
 * Reusable "stat" card — pill with icon + label + value + optional sub.
 * Used in dashboards, agent earnings, and the homepage trust strip.
 */
export function StatBadge({
  icon,
  label,
  value,
  sub,
  tone = "stone",
  className,
}: StatBadgeProps) {
  const s = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        "rounded-2xl p-4 ring-1 transition-all hover-lift",
        s.wrap,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl", s.icon)}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className={cn("text-[10px] font-semibold uppercase tracking-wider", s.sub)}>
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-bold tracking-tight", s.value)}>
            {value}
          </p>
          {sub && <p className={cn("text-xs", s.sub)}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}
