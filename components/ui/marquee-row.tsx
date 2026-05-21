import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal marquee of items — used for the homepage header "live now"
 * ticker and the footer trustmarks. Pure CSS animation; respects
 * prefers-reduced-motion via the `.animate-marquee` global rule.
 */
export function MarqueeRow({
  items,
  speed = "normal",
  className,
}: {
  items: React.ReactNode[];
  speed?: "slow" | "normal" | "fast";
  className?: string;
}) {
  const dur = speed === "slow" ? "60s" : speed === "fast" ? "18s" : "30s";
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: dur }}
      >
        {[...items, ...items].map((node, i) => (
          <div key={i} className="inline-flex shrink-0 items-center gap-2 text-sm">
            {node}
          </div>
        ))}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent" />
    </div>
  );
}
