"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { ToastProvider, useToasts, type Toast } from "./toast";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<
  Toast["variant"],
  { wrap: string; icon: React.ReactNode; role: "status" | "alert" }
> = {
  default: {
    wrap: "bg-card text-card-foreground border-border",
    icon: <Info className="h-4 w-4 text-muted-foreground" />,
    role: "status",
  },
  success: {
    wrap: "bg-card text-card-foreground border-success/40",
    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
    role: "status",
  },
  error: {
    wrap: "bg-card text-card-foreground border-danger/40",
    icon: <XCircle className="h-4 w-4 text-danger" />,
    role: "alert",
  },
  info: {
    wrap: "bg-card text-card-foreground border-info/40",
    icon: <Info className="h-4 w-4 text-info" />,
    role: "status",
  },
  loading: {
    wrap: "bg-card text-card-foreground border-border",
    icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    role: "status",
  },
};

function ToastStack() {
  const { toasts, dismiss } = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((t) => {
        const s = VARIANT_STYLES[t.variant];
        return (
          <div
            key={t.id}
            role={s.role}
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-toast-in",
              s.wrap,
            )}
          >
            <div className="mt-0.5 shrink-0">{s.icon}</div>
            <div className="flex-1 text-sm">
              {t.title && (
                <div className="font-medium leading-snug">{t.title}</div>
              )}
              {t.description && (
                <div className="mt-0.5 text-muted-foreground">
                  {t.description}
                </div>
              )}
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastStack />
    </ToastProvider>
  );
}
