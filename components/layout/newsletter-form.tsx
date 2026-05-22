"use client";
import { useState } from "react";
import { Check, Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function NewsletterForm() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // In production: POST to /api/newsletter. For now, optimistic success.
    if (!email.includes("@")) {
      toast.error("That email doesn't look right");
      return;
    }
    setDone(true);
    toast.success("You're in — watch your inbox");
  }

  if (done) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-primary">
        <Check className="h-4 w-4" />
        You&apos;re in. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 flex w-full max-w-sm items-center gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address for newsletter"
        className="h-10 flex-1 rounded-full border border-border bg-[var(--input-bg)] px-4 text-sm text-foreground placeholder:text-text-subtle focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
      />
      <button
        type="submit"
        className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Subscribe"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
