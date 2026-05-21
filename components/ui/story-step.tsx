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
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 hover-lift",
        className,
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-3 text-6xl font-bold leading-none",
          accent === "emerald" ? "text-emerald-50" : "text-amber-50",
        )}
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div
        className={cn(
          "relative grid h-11 w-11 place-items-center rounded-xl",
          accent === "emerald"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700",
        )}
      >
        {illustration ?? (
          <span className="text-sm font-semibold">{index}</span>
        )}
      </div>
      <h3 className="relative mt-4 text-lg font-semibold text-stone-900">{title}</h3>
      <div className="relative mt-2 text-sm text-stone-600 text-pretty">{body}</div>
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
                  ? "bg-emerald-700 text-emerald-50 ring-emerald-700"
                  : isDone
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    : "bg-white text-stone-500 ring-stone-200",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white text-emerald-700"
                    : isDone
                      ? "bg-emerald-700 text-emerald-50"
                      : "bg-stone-100 text-stone-500",
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
                  isDone ? "bg-emerald-300" : "bg-stone-200",
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
