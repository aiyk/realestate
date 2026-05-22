import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: React.ReactNode;
  /** Larger illustration; rendered without the icon-circle wrapper. */
  illustration?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
  /** Compact variant for inline (card-bound) empties. */
  compact?: boolean;
};

/**
 * Unified "nothing here yet" surface. Mirror of ErrorState but for empty
 * lists, inboxes, and search results. Pass an illustration or lucide icon via `icon`.
 */
export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  secondary,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex flex-col items-center gap-4 text-center",
        compact ? "max-w-sm px-4 py-8" : "max-w-lg px-6 py-12 sm:py-16",
        className,
      )}
    >
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : icon ? (
        <div
          className={cn(
            "grid place-items-center rounded-full bg-primary-soft text-primary-soft-foreground",
            compact ? "h-10 w-10" : "h-14 w-14",
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className={cn(compact ? "t-h4" : "t-h3", "text-foreground")}>{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      {(action || secondary) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}
