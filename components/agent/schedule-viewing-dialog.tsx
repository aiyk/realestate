"use client";
import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  slug: string;
  businessName: string;
  listingId?: string;
};

function defaultViewingAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleViewingDialog({
  slug,
  businessName,
  listingId,
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
      setDone(true);
      setBusy(false);
      return;
    }
    try {
      const viewingAtLocal = String(fd.get("viewingAt") ?? "");
      const viewingAt = viewingAtLocal
        ? new Date(viewingAtLocal).toISOString()
        : undefined;
      const res = await fetch(`/api/agents/${slug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? "") || undefined,
          message: String(fd.get("message") ?? "Requesting a viewing"),
          kind: "VIEWING_REQUEST",
          viewingAt,
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
          setErr(null);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
      >
        <CalendarDays className="h-4 w-4" />
        Schedule a viewing
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={done ? "Viewing requested" : `Request a viewing with ${businessName}`}
        description={
          done
            ? "We've notified the agent. They'll confirm a time directly with you."
            : "Pick a time that works for you — the agent confirms or suggests an alternative."
        }
      >
        {done ? (
          <Button type="button" onClick={() => setOpen(false)}>
            Done
          </Button>
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
                <Input id="email" name="email" type="email" required maxLength={160} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required maxLength={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="viewingAt">Preferred date &amp; time</Label>
              <Input
                id="viewingAt"
                name="viewingAt"
                type="datetime-local"
                defaultValue={defaultViewingAt()}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Notes (optional)</Label>
              <textarea
                id="message"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="Anything they should know — group size, accessibility, second-choice times…"
                className="flex w-full rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
            {err && <p className="text-sm text-danger">{err}</p>}
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
                Request viewing
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
