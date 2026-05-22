"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { RatingStars } from "@/components/ui/rating-stars";

type Props = {
  agentSlug: string;
  agentBusinessName: string;
  reservationId: string;
  triggerLabel?: string;
};

export function ReviewSubmitDialog({
  agentSlug,
  agentBusinessName,
  reservationId,
  triggerLabel = "Leave a review",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (rating < 1) {
      setErr("Pick a star rating first.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/agents/${agentSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          rating,
          body: body.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not submit review");
      }
      setDone(true);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not submit review");
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
        className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-soft-foreground hover:bg-accent-soft"
      >
        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
        {triggerLabel}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={done ? "Thanks for the review" : `Review ${agentBusinessName}`}
        description={
          done
            ? "It's live on their profile. We appreciate it."
            : "Honest feedback helps other buyers — and the best agents."
        }
      >
        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your rating is now visible on the public profile.
            </p>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Your rating
              </p>
              <div className="mt-1">
                <RatingStars
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  label="Rating"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="reviewBody"
                className="text-sm font-medium text-foreground"
              >
                What stood out? (optional)
              </label>
              <textarea
                id="reviewBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Communication, neighbourhood knowledge, how viewings went, closing experience…"
                className="mt-1 flex w-full rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
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
              <Button type="button" onClick={submit} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit review
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
