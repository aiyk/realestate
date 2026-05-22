"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ className, label, description, id, ...props }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const control = (
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full border border-input bg-[var(--input-bg)] transition-colors",
            "peer-checked:border-primary",
            "peer-disabled:opacity-50",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none relative h-2 w-2 rounded-full bg-primary opacity-0 transition-opacity",
            "peer-checked:opacity-100",
          )}
        />
      </span>
    );
    if (!label && !description) {
      return <span className={cn("inline-flex", className)}>{control}</span>;
    }
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-3",
          props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        )}
      >
        {control}
        <span className="flex-1 select-none">
          {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
          {description && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
          )}
        </span>
      </label>
    );
  },
);

export function RadioGroup({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="radiogroup" className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}
