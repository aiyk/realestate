"use client";

import { cn } from "@/lib/utils";

/**
 * Animated chat-bubble scene — the homepage "Why us" panel and the
 * messaging empty state both use this. Renders entirely inline so it
 * stays sharp at any size and themes via Tailwind.
 */
export function ChatBubbles({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate rounded-3xl border border-border bg-card p-6 shadow-xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-semibold text-primary-foreground">
          AO
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Adaeze · Buyer</p>
          <p className="text-xs text-muted-foreground">Lekki Phase 1 · today</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary-soft-foreground">
          <svg
            className="h-2.5 w-2.5"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6 L5 9 L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Verified
        </span>
      </div>

      {/* Bubbles */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="animate-fade-up rounded-2xl rounded-tl-md bg-surface-2 p-3 text-foreground">
          Hi — is the 4-bedroom still available for Saturday viewing?
        </div>
        <div className="ml-auto max-w-[80%] animate-fade-up rounded-2xl rounded-tr-md bg-primary p-3 text-primary-foreground [animation-delay:0.15s]">
          It is. Drop your deposit on the listing and I&apos;ll send the
          location pin.
        </div>
        <div className="animate-fade-up rounded-2xl rounded-tl-md bg-surface-2 p-3 text-foreground [animation-delay:0.3s]">
          Done. See you 11am.
        </div>
        {/* Typing dots — the agent is replying */}
        <div className="ml-auto inline-flex max-w-[80%] animate-fade-up items-center gap-1.5 rounded-2xl rounded-tr-md bg-primary px-3 py-2 [animation-delay:0.45s]">
          <span className="h-1.5 w-1.5 animate-typing rounded-full bg-primary-foreground" />
          <span className="h-1.5 w-1.5 animate-typing-2 rounded-full bg-primary-foreground" />
          <span className="h-1.5 w-1.5 animate-typing-3 rounded-full bg-primary-foreground" />
        </div>
      </div>

      {/* Deposit footer */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-primary-soft px-4 py-3 text-xs text-primary-soft-foreground">
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect
              x="2"
              y="4"
              width="12"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle cx="8" cy="8.5" r="2" fill="currentColor" opacity="0.4" />
          </svg>
          Deposit secured · {new Date().toLocaleDateString("en-NG")}
        </span>
        <span className="font-semibold">₦1,000,000</span>
      </div>

      {/* Floating sparkles */}
      <span className="pointer-events-none absolute -right-2 -top-2 grid h-9 w-9 animate-float place-items-center rounded-full bg-accent-soft text-accent-soft-foreground">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 2 L9.5 6.5 L14 8 L9.5 9.5 L8 14 L6.5 9.5 L2 8 L6.5 6.5 Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </div>
  );
}
