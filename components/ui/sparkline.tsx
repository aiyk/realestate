import * as React from "react";
import { cn } from "@/lib/utils";

type Datum = { label: string; value: number };

/**
 * Pure-SVG sparkline / line chart. Uses currentColor for the line — set color
 * via Tailwind `text-*` on the wrapping element. Always token-driven.
 *
 *   <Sparkline data={[{label:"Mon", value:3}, ...]} className="text-primary" />
 *
 * `showAxis` enables a baseline + per-bucket date label.
 */
export function Sparkline({
  data,
  height = 80,
  showAxis = false,
  showArea = true,
  showDots = false,
  className,
  ariaLabel,
}: {
  data: Datum[];
  height?: number;
  showAxis?: boolean;
  showArea?: boolean;
  showDots?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  if (data.length === 0) return null;
  const w = 600;
  const h = height;
  const padX = 6;
  const padY = 8;
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - d.value / maxV) * (h - padY * 2);
    return [x, y] as const;
  });
  const pathLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const pathArea = `${pathLine} L${points[points.length - 1][0].toFixed(1)} ${h} L${points[0][0].toFixed(1)} ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={ariaLabel ?? "Trend chart"}
      preserveAspectRatio="none"
      className={cn("h-auto w-full text-primary", className)}
    >
      {showArea && (
        <path d={pathArea} fill="currentColor" fillOpacity="0.12" />
      )}
      <path
        d={pathLine}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showDots &&
        points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />
        ))}
      {showAxis && (
        <line
          x1={padX}
          x2={w - padX}
          y1={h - padY / 2}
          y2={h - padY / 2}
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
