"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight CSS-only tooltip. Sufficient for icon-button labels and short
 * hints. For interactive popovers prefer a Dialog or a future Popover.
 *
 * Behavior:
 *   - Visible on hover and focus-visible of the trigger.
 *   - The visible text is also exposed as the trigger's accessible name via
 *     `aria-label` when no other label is provided.
 *   - Respects prefers-reduced-motion via CSS transitions.
 */
type Side = "top" | "bottom" | "left" | "right";

const SIDE_POSITIONS: Record<Side, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  label,
  side = "top",
  delayShow = 200,
  children,
  className,
}: {
  label: React.ReactNode;
  side?: Side;
  /** ms before the tooltip appears on hover; reduces accidental flashes. */
  delayShow?: number;
  children: React.ReactElement;
  className?: string;
}) {
  const id = React.useId();
  return (
    <span
      className={cn("group relative inline-flex", className)}
      style={{ "--tt-delay": `${delayShow}ms` } as React.CSSProperties}
    >
      {React.cloneElement(children, {
        "aria-describedby": id,
      } as React.HTMLAttributes<HTMLElement>)}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute z-popover whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-[var(--tt-delay)] group-focus-within:opacity-100",
          SIDE_POSITIONS[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
