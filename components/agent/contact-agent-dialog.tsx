"use client";
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  slug: string;
  businessName: string;
  listingId?: string;
  trigger?: React.ReactNode;
};

export function ContactAgentDialog({
  slug,
  businessName,
  listingId,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    if (fd.get("_hp")) {
      // Honeypot tripped — pretend success
      setDone(true);
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`/api/agents/${slug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? "") || undefined,
          message: String(fd.get("message") ?? ""),
          kind: "MESSAGE",
          listingId,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not send");
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDone(false);
    setErr(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          reset();
        }}
        className="contents"
      >
        {trigger ?? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-emerald-50 hover:bg-emerald-800">
            <MessageCircle className="h-4 w-4" />
            Contact agent
          </span>
        )}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={done ? "Message sent" : `Message ${businessName}`}
        description={
          done
            ? `${businessName} will get back to you over email.`
            : "No account needed. They reply to the email you give us."
        }
      >
        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              We&apos;ve also sent a copy to your inbox so the thread stays
              continuous.
            </p>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required minLength={2} maxLength={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={160}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" type="tel" maxLength={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="What are you looking for? Areas, budget, timeline?"
                className="flex w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm shadow-sm focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send message
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
