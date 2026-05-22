"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slide-in drawer. Backdrop click and Escape dismiss; scroll-locked while open.
 * Side: "right" (default), "left", "bottom".
 *
 *   <Sheet open={open} onClose={() => setOpen(false)} title="Filters" side="right">
 *     …
 *   </Sheet>
 */

const SIDE_STYLES: Record<"left" | "right" | "bottom", string> = {
  right: "right-0 top-0 h-full w-full max-w-md animate-slide-in-right",
  left: "left-0 top-0 h-full w-full max-w-md animate-slide-in-right [animation-direction:reverse]",
  bottom: "bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl animate-slide-in-bottom",
};

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  side = "right",
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  footer?: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-overlay flex"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute flex flex-col bg-card text-card-foreground shadow-xl",
          SIDE_STYLES[side],
          className,
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-border bg-surface-2/50 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
