import * as React from "react";
import { cn } from "@/lib/utils";

type SpeechBubbleProps = {
  from?: "them" | "you" | "concierge";
  avatar?: React.ReactNode;
  author?: string;
  role?: string;
  tail?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * A small, reusable chat-bubble component.
 *  - `them` (default): light bubble, left tail.
 *  - `you`: primary bubble, right tail.
 *  - `concierge`: warm accent bubble with a discreet "Concierge" label.
 */
export function SpeechBubble({
  from = "them",
  avatar,
  author,
  role,
  tail = true,
  className,
  children,
}: SpeechBubbleProps) {
  const isYou = from === "you";
  const isConcierge = from === "concierge";

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isYou ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {avatar && (
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-semibold",
            isYou
              ? "bg-primary text-primary-foreground"
              : isConcierge
                ? "bg-accent-soft text-accent-soft-foreground"
                : "bg-surface-2 text-muted-foreground",
          )}
        >
          {avatar}
        </div>
      )}
      <div className={cn("max-w-[80%]", isYou && "text-right")}>
        {(author || role) && (
          <p className="mb-1 text-xs text-muted-foreground">
            {author && <span className="font-semibold text-foreground">{author}</span>}
            {author && role && " · "}
            {role}
          </p>
        )}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            tail && (isYou ? "rounded-tr-md" : "rounded-tl-md"),
            isYou
              ? "bg-primary text-primary-foreground"
              : isConcierge
                ? "bg-accent-soft text-accent-soft-foreground ring-1 ring-accent/20"
                : "bg-surface-2 text-foreground",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** A row of three animated dots — for "the agent is typing…" moments. */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2",
        className,
      )}
      aria-label="Typing"
    >
      <span className="h-1.5 w-1.5 animate-typing rounded-full bg-muted-foreground" />
      <span className="h-1.5 w-1.5 animate-typing-2 rounded-full bg-muted-foreground" />
      <span className="h-1.5 w-1.5 animate-typing-3 rounded-full bg-muted-foreground" />
    </span>
  );
}
