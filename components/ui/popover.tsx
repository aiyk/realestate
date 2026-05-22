"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Anchored floating panel. Click-outside + Escape dismiss.
 *
 *   <Popover>
 *     <PopoverTrigger><Button>Open</Button></PopoverTrigger>
 *     <PopoverContent>…</PopoverContent>
 *   </Popover>
 */

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  align: "start" | "end" | "center";
  side: "bottom" | "top";
};

const PopoverContext = React.createContext<Ctx | null>(null);
function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover primitives must be inside <Popover>");
  return ctx;
}

export function Popover({
  children,
  align = "start",
  side = "bottom",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "bottom" | "top";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (contentRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef, align, side }}>
      <div className={cn("relative inline-flex", className)}>{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const { open, setOpen, triggerRef } = usePopoverContext();
  void asChild;
  type TriggerProps = {
    ref?: React.Ref<HTMLElement>;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    "aria-haspopup"?: string;
    "aria-expanded"?: boolean;
  };
  const child = children as React.ReactElement<TriggerProps>;
  return React.cloneElement(child, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      child.props.onClick?.(e);
      setOpen(!open);
    },
    "aria-haspopup": "dialog",
    "aria-expanded": open,
  });
}

export function PopoverContent({
  children,
  className,
  sideOffset = 6,
}: {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}) {
  const { open, contentRef, align, side } = usePopoverContext();
  if (!open) return null;
  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "absolute z-popover min-w-44 rounded-xl border border-border bg-popover p-3 shadow-lg",
        "animate-slide-in-down origin-top",
        align === "start" && "left-0",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        side === "top" && "bottom-full",
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
