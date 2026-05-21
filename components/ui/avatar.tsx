import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function initialsOf(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 font-semibold text-white",
        SIZE[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </div>
  );
}
