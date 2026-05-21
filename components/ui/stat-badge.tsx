import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "stone" | "rose" | "ink";

const TONE_STYLES: Record<Tone, { wrap: string; icon: string; value: string; sub: string }> = {
  emerald: {
    wrap: "bg-emerald-50 ring-emerald-100",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-900",
    sub: "text-emerald-700/80",
  },
  amber: {
    wrap: "bg-amber-50 ring-amber-100",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-900",
    sub: "text-amber-700/80",
  },
  stone: {
    wrap: "bg-stone-50 ring-stone-100",
    icon: "bg-stone-100 text-stone-700",
    value: "text-stone-900",
    sub: "text-stone-600",
  },
  rose: {
    wrap: "bg-rose-50 ring-rose-100",
    icon: "bg-rose-100 text-rose-700",
    value: "text-rose-900",
    sub: "text-rose-700/80",
  },
  ink: {
    wrap: "bg-stone-900 ring-stone-800",
    icon: "bg-white/10 text-amber-300",
    value: "text-white",
    sub: "text-stone-300",
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
