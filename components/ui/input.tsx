import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-11 w-full rounded-lg border bg-[var(--input-bg)] px-4 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default:
          "border-input focus-visible:border-primary focus-visible:ring-primary/15",
        error:
          "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
        success:
          "border-success focus-visible:border-success focus-visible:ring-success/20",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "state">,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, "aria-invalid": ariaInvalid, ...props }, ref) => {
    // If consumer sets aria-invalid="true" without an explicit state, mirror it.
    const resolvedState =
      state ?? (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");
    return (
      <input
        type={type}
        aria-invalid={ariaInvalid}
        className={cn(inputVariants({ state: resolvedState }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { inputVariants };
