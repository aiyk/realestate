"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight password strength meter. Score 0–4 derived from length, character
 * class diversity, and common pattern penalties. Not zxcvbn — but enough to nudge
 * users away from "password123".
 */
function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "Empty" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  // Penalties
  if (/^[a-z]+$/.test(pw)) score = Math.max(0, score - 1);
  if (/^(password|qwerty|abc|letme|admin|welcome)/i.test(pw)) score = 0;
  if (pw.length < 6) score = 0;
  const clamped = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  return { score: clamped, label: labels[clamped] };
}

const SEGMENT_COLORS = [
  "bg-surface-3",
  "bg-danger",
  "bg-warning",
  "bg-success",
  "bg-primary",
];

export function PasswordStrength({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { score, label } = scorePassword(value);
  return (
    <div className={cn("space-y-1.5", className)} aria-live="polite">
      <div className="flex h-1 gap-1 overflow-hidden rounded-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors",
              i < score ? SEGMENT_COLORS[score] : "bg-surface-3",
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{label}</span>
        {score < 3 && value.length > 0 && " · longer beats clever"}
      </p>
    </div>
  );
}
