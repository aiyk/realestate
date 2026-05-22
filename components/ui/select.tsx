import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  "flex h-11 w-full appearance-none rounded-lg border bg-[var(--input-bg)] pl-4 pr-10 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default:
          "border-input focus-visible:border-primary focus-visible:ring-primary/15",
        error:
          "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "state">,
    VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, state, "aria-invalid": ariaInvalid, children, ...props }, ref) => {
    const resolvedState =
      state ?? (ariaInvalid === true || ariaInvalid === "true" ? "error" : "default");
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={ariaInvalid}
          className={cn(selectVariants({ state: resolvedState }), className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";

export { selectVariants };
