"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  icon?: React.ReactNode;
};

type SegmentedProps<V extends string = string> = {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (next: V) => void;
  ariaLabel: string;
  size?: "sm" | "default";
  className?: string;
};

/**
 * Segmented radio control — visual sibling of Tabs but renders as a pill group.
 * Use for view density toggles, short pivots, week ranges.
 */
export function Segmented<V extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "default",
  className,
}: SegmentedProps<V>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-2 p-1 text-sm",
        size === "sm" ? "h-9" : "h-10",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-full px-3 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              size === "sm" && "text-xs",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
