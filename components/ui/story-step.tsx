import * as React from "react";
import { cn } from "@/lib/utils";

type StoryStepProps = {
  index: number;
  title: string;
  body: React.ReactNode;
  illustration?: React.ReactNode;
  accent?: "emerald" | "amber";
  className?: string;
};

/**
 * Numbered step card with an illustration slot.
 * Used by "How it works", onboarding nudges, and the agent application wizard.
 */
export function StoryStep({
  index,
  title,
  body,
  illustration,
  accent = "emerald",
  className,
}: StoryStepProps) {
  const isEmerald = accent === "emerald";
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift",
        className,
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-3 text-6xl font-bold leading-none opacity-30",
          isEmerald ? "text-primary-soft" : "text-accent-soft",
        )}
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div
        className={cn(
          "relative grid h-11 w-11 place-items-center rounded-xl",
          isEmerald
            ? "bg-primary-soft text-primary-soft-foreground"
            : "bg-accent-soft text-accent-soft-foreground",
        )}
      >
        {illustration ?? (
          <span className="text-sm font-semibold">{index}</span>
        )}
      </div>
      <h3 className="relative mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <div className="relative mt-2 text-sm text-muted-foreground text-pretty">{body}</div>
    </article>
  );
}

/**
 * A horizontal stepper used at the top of multi-step flows
 * (agent apply, checkout). Highlights the current step and shows
 * a connector line between steps.
 */
export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // 0-based
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-3", className)}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={label}>
            <li
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground ring-primary"
                  : isDone
                    ? "bg-primary-soft text-primary-soft-foreground ring-primary/30"
                    : "bg-card text-muted-foreground ring-border",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : isDone
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground",
                )}
              >
                {isDone ? "✓" : i + 1}
              </span>
              {label}
            </li>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px w-6 sm:w-10",
                  isDone ? "bg-primary/40" : "bg-border",
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
