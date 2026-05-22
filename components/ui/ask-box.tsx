"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * "Want me to look out for this for you?" capture box.
 *
 * Pure UI for now — submits to a no-op endpoint that always succeeds
 * (`/api/wishlist`). If the endpoint isn't available the component
 * shows the success state regardless so the visitor never sees a dead
 * end on the marketing surface.
 */
export function AskBox({
  title = "Want us to look out for it?",
  subtitle = "Tell us what you're after and we'll text you when something fits.",
  placeholder = "e.g. 3-bedroom in Lekki under ₦80m",
  context,
  className,
}: {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  /** Extra context sent with the submission (e.g. current filters). */
  context?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, query, context }),
      });
    } catch {
      // Never block the UI; the form is friendly even on failure.
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-3xl border border-success/30 bg-success-soft p-5 text-sm text-success-soft-foreground",
          className,
        )}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <div>
          <p className="font-semibold">Got it — we&apos;re on it.</p>
          <p className="mt-1 opacity-90">
            We&apos;ll email you the moment something matches. No spam, no
            agent calls until you ask.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-3xl border border-border bg-gradient-to-br from-card via-accent-soft/30 to-primary-soft/30 p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-full border border-input bg-[var(--input-bg)] px-4 text-sm text-foreground placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="h-11 rounded-full border border-input bg-[var(--input-bg)] px-4 text-sm text-foreground placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : <>Notify me <Send className="h-3.5 w-3.5" /></>}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        One email when a match shows up. Unsubscribe anytime — no questions
        asked.
      </p>
    </form>
  );
}
