import * as React from "react";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "tip" | "warn" | "success" | "info" | "danger" | "concierge";

const TONE_STYLES: Record<
  Tone,
  { wrap: string; icon: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  tip: {
    wrap: "bg-primary-soft text-primary-soft-foreground ring-primary/20",
    icon: "text-primary",
    Icon: Lightbulb,
  },
  warn: {
    wrap: "bg-warning-soft text-warning-soft-foreground ring-warning/20",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  success: {
    wrap: "bg-success-soft text-success-soft-foreground ring-success/20",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  info: {
    wrap: "bg-surface-2 text-foreground ring-border",
    icon: "text-muted-foreground",
    Icon: Info,
  },
  danger: {
    wrap: "bg-danger-soft text-danger-soft-foreground ring-danger/20",
    icon: "text-danger",
    Icon: AlertOctagon,
  },
  concierge: {
    wrap:
      "bg-gradient-to-br from-accent-soft via-surface-2 to-primary-soft text-foreground ring-border",
    icon: "text-accent",
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
      role={tone === "warn" || tone === "danger" ? "alert" : undefined}
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
