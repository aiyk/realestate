"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange?: (next: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  label?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingStars({
  value,
  onChange,
  size = "md",
  readOnly,
  label,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const interactive = !readOnly && onChange;
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={label ?? `Rating ${value} of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= shown;
        const cls = cn(
          SIZE[size],
          filled
            ? "fill-accent text-accent"
            : "text-muted-foreground/40",
        );
        if (!interactive) return <Star key={n} className={cls} />;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => onChange?.(n)}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star className={cls} />
          </button>
        );
      })}
    </div>
  );
}
