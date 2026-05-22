"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight dropdown menu. Click-outside, Escape, roving focus.
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger>…</DropdownMenuTrigger>
 *     <DropdownMenuContent>
 *       <DropdownMenuItem onSelect={…}>…</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem destructive>…</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  align: "start" | "end";
  side: "bottom" | "top";
};

const DropdownContext = React.createContext<Ctx | null>(null);

function useDropdownContext() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu primitives must be inside <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({
  children,
  align = "start",
  side = "bottom",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  side?: "bottom" | "top";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        contentRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      )
        return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, triggerRef, contentRef, align, side }}
    >
      <div className={cn("relative inline-flex", className)}>{children}</div>
    </DropdownContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(function DropdownMenuTrigger({ asChild, onClick, children, ...props }) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  if (asChild && React.isValidElement(children)) {
    type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
      ref?: React.Ref<HTMLButtonElement>;
    };
    const child = children as React.ReactElement<TriggerProps>;
    return React.cloneElement(child, {
      ref: triggerRef,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        child.props.onClick?.(e);
        setOpen(!open);
      },
    });
  }
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        onClick?.(e);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export function DropdownMenuContent({
  children,
  className,
  sideOffset = 6,
}: {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}) {
  const { open, contentRef, align, side } = useDropdownContext();
  React.useEffect(() => {
    if (!open) return;
    const first = contentRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    first?.focus();
  }, [open, contentRef]);

  if (!open) return null;
  return (
    <div
      ref={contentRef}
      role="menu"
      onKeyDown={(e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const items = Array.from(
          contentRef.current?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])',
          ) ?? [],
        );
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === "ArrowDown"
            ? (i + 1) % items.length
            : (i - 1 + items.length) % items.length;
        items[next]?.focus();
      }}
      className={cn(
        "absolute z-dropdown min-w-44 rounded-xl border border-border bg-popover p-1 shadow-lg",
        "animate-slide-in-down origin-top",
        align === "start" ? "left-0" : "right-0",
        side === "bottom" ? "" : "bottom-full",
        className,
      )}
      style={{
        marginTop: side === "bottom" ? sideOffset : undefined,
        marginBottom: side === "top" ? sideOffset : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  destructive,
  className,
  icon,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  const { setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        "focus-visible:outline-none focus-visible:bg-surface-2",
        disabled
          ? "cursor-not-allowed opacity-50"
          : destructive
            ? "text-danger hover:bg-danger-soft hover:text-danger-soft-foreground"
            : "text-foreground hover:bg-surface-2",
        className,
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} role="separator" />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </div>
  );
}
