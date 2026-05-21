"use client";
import { useState } from "react";
import { Check, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // In production: POST to /api/newsletter. For now, optimistic success.
    if (!email.includes("@")) return;
    setDone(true);
  }

  if (done) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
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
        className="h-10 flex-1 rounded-full border border-stone-200 bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/15"
      />
      <button
        type="submit"
        className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-white transition-colors hover:bg-emerald-800"
        aria-label="Subscribe"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
