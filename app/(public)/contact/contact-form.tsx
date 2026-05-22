"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const TOPICS = [
  { value: "general", label: "Just saying hi" },
  { value: "find", label: "Help me find a property" },
  { value: "list", label: "I want to list" },
  { value: "issue", label: "Something is broken" },
  { value: "press", label: "Press / partnership" },
];

export function ContactForm() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Message sent — we'll be in touch");
    }, 600);
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-primary-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 text-base font-semibold text-primary-soft-foreground">
          Got it. Expect a reply soon.
        </p>
        <p className="mt-1 text-sm text-primary-soft-foreground text-pretty">
          We&apos;ll write back to the email you provided. If it&apos;s
          urgent, ping us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="topic">What&apos;s this about?</Label>
        <Select id="topic" name="topic" className="mt-1.5">
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="message">Your message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder="Hey, I'd love a 3-bedroom apartment in Ikoyi under ₦80m…"
          className="mt-1.5 block w-full rounded-lg border border-input bg-[var(--input-bg)] p-3 text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          The more specific you are, the better we can help. 2,000 character
          limit.
        </p>
      </div>
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        <Send className="h-4 w-4" />
        {loading ? "Sending…" : "Send the note"}
      </Button>
    </form>
  );
}
