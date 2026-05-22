"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Native checkbox styled as a toggle switch. Honors `disabled` and `aria-invalid`.
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ className, label, description, id, ...props }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const control = (
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "block h-6 w-11 rounded-full bg-surface-3 transition-colors",
            "peer-checked:bg-primary peer-disabled:opacity-50",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform",
            "peer-checked:translate-x-5",
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
