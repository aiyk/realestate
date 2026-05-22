"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { className, label, description, indeterminate, id, ...props },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const localRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(forwardedRef, () => localRef.current!);
    React.useEffect(() => {
      if (localRef.current) localRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    const control = (
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={localRef}
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-md border border-input bg-[var(--input-bg)] transition-colors",
            "peer-checked:bg-primary peer-checked:border-primary",
            "peer-indeterminate:bg-primary peer-indeterminate:border-primary",
            "peer-disabled:opacity-50",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none relative h-3.5 w-3.5 stroke-[3] text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        />
        <Minus
          aria-hidden="true"
          className="pointer-events-none absolute h-3.5 w-3.5 stroke-[3] text-primary-foreground opacity-0 peer-indeterminate:opacity-100"
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
