import * as React from "react";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "tip" | "warn" | "success" | "info" | "concierge";

const TONE_STYLES: Record<
  Tone,
  { wrap: string; icon: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  tip: {
    wrap: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    icon: "text-emerald-700",
    Icon: Lightbulb,
  },
  warn: {
    wrap: "bg-amber-50 text-amber-900 ring-amber-200",
    icon: "text-amber-700",
    Icon: AlertTriangle,
  },
  success: {
    wrap: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    icon: "text-emerald-700",
    Icon: CheckCircle2,
  },
  info: {
    wrap: "bg-stone-50 text-stone-800 ring-stone-200",
    icon: "text-stone-600",
    Icon: Info,
  },
  concierge: {
    wrap:
      "bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 text-stone-800 ring-stone-200",
    icon: "text-amber-700",
    Icon: Lightbulb,
  },
};

type CalloutProps = {
  tone?: Tone;
  title?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Soft tinted box with an icon and a chatty headline.
 * Replaces ad-hoc red/amber boxes in forms and inline messaging.
 */
export function Callout({
  tone = "info",
  title,
  className,
  icon,
  children,
}: CalloutProps) {
  const s = TONE_STYLES[tone];
  const Icon = s.Icon;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl p-4 text-sm ring-1",
        s.wrap,
        className,
      )}
      role={tone === "warn" ? "alert" : undefined}
    >
      <div className={cn("mt-0.5 shrink-0", s.icon)}>
        {icon ?? <Icon className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        <div className={cn(title && "mt-1", "leading-relaxed text-pretty")}>{children}</div>
      </div>
    </div>
  );
}
