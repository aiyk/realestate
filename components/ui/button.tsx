import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover shadow-sm hover:shadow-md",
        destructive:
          "bg-danger text-danger-foreground hover:opacity-90 shadow-sm hover:shadow-md",
        outline:
          "border border-border bg-card text-foreground hover:bg-surface-2 hover:border-muted-foreground/40",
        secondary:
          "bg-surface-2 text-foreground hover:bg-surface-3",
        ghost:
          "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm hover:shadow-md",
        soft:
          "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft/80",
      },
      size: {
        default: "h-10 px-5",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-xs": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
