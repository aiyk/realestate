"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cycles through concierge prompts every few seconds — gives the hero
 * the feel of a live conversation rather than static copy.
 *
 * Respects prefers-reduced-motion by freezing on the first prompt.
 */
export function RotatingPrompt({
  prompts,
  intervalMs = 3500,
  className,
}: {
  prompts: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) return;
    }
    const t = setInterval(() => {
      setI((n) => (n + 1) % prompts.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [prompts.length, intervalMs]);

  return (
    <span
      key={i}
      className={cn("animate-fade-up inline-block", className)}
      aria-live="polite"
    >
      {prompts[i]}
    </span>
  );
}
