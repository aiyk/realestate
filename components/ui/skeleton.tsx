import * as React from "react";
import { cn } from "@/lib/utils";

/** Base block — reuse to build page-specific skeletons. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-skeleton-pulse rounded-md bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}

/** Listing-card-shaped skeleton. Mirrors `components/listings/listing-card.tsx`. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl bg-card ring-1 ring-border",
        className,
      )}
    >
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3 border-t border-border pt-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Compact agent-card skeleton (for the agents directory). */
export function SkeletonAgentCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl bg-card ring-1 ring-border",
        className,
      )}
    >
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="space-y-3 px-5 pb-5 pt-0">
        <div className="-mt-8 flex items-end gap-3">
          <Skeleton className="h-16 w-16 rounded-full ring-4 ring-card" />
          <div className="flex-1 space-y-2 pb-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Table-row-shaped skeleton. */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** Grid of N skeleton cards — quick helper for page loaders. */
export function SkeletonGrid({
  count = 6,
  variant = "card",
  className,
}: {
  count?: number;
  variant?: "card" | "agent" | "row";
  className?: string;
}) {
  const items = Array.from({ length: count });
  if (variant === "row") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {items.map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }
  const Cmp = variant === "agent" ? SkeletonAgentCard : SkeletonCard;
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((_, i) => (
        <Cmp key={i} />
      ))}
    </div>
  );
}
