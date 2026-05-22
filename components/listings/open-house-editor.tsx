"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OpenHouse = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  notes: string | null;
};

type Props = {
  listingId: string;
  initial: OpenHouse[];
};

function localFromIso(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRange(startsAt: string, endsAt: string) {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const sameDay = s.toDateString() === e.toDateString();
  const day = s.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const start = s.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = e.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return sameDay ? `${day} · ${start}–${end}` : `${day} ${start} → ${e.toLocaleString("en-NG")}`;
}

export function OpenHouseEditor({ listingId, initial }: Props) {
  const router = useRouter();
  const [items] = useState<OpenHouse[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<{ startsAt: string; endsAt: string }>({
    startsAt: "",
    endsAt: "",
  });
  useEffect(() => {
    const now = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDefaults({
      startsAt: localFromIso(new Date(now + 48 * 60 * 60 * 1000).toISOString()),
      endsAt: localFromIso(new Date(now + 50 * 60 * 60 * 1000).toISOString()),
    });
  }, []);

  async function add(form: FormData) {
    setErr(null);
    setBusy(true);
    try {
      const startsLocal = String(form.get("startsAt") ?? "");
      const endsLocal = String(form.get("endsAt") ?? "");
      const startsAt = startsLocal ? new Date(startsLocal).toISOString() : "";
      const endsAt = endsLocal ? new Date(endsLocal).toISOString() : "";
      if (!startsAt || !endsAt) throw new Error("Pick a date range");
      const capacity = form.get("capacity");
      const notes = form.get("notes");
      const res = await fetch(`/api/listings/${listingId}/open-houses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt,
          endsAt,
          capacity: capacity ? Number(capacity) : undefined,
          notes: notes ? String(notes) : undefined,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not create open house");
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create");
    } finally {
      setBusy(false);
    }
  }

  async function remove(ohId: string) {
    if (!confirm("Cancel this open house?")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/listings/${listingId}/open-houses/${ohId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Could not cancel");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        action={(fd) => {
          void add(fd);
        }}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <p className="text-sm font-semibold text-foreground">Schedule an open house</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="startsAt">Starts</Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={defaults.startsAt}
              required
            />
          </div>
          <div>
            <Label htmlFor="endsAt">Ends</Label>
            <Input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={defaults.endsAt}
              required
            />
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div>
            <Label htmlFor="capacity">Capacity (optional)</Label>
            <Input id="capacity" name="capacity" type="number" min={1} max={500} />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              name="notes"
              maxLength={2000}
              placeholder="Refreshments served · gated estate, bring ID"
            />
          </div>
        </div>
        {err && <p className="mt-2 text-xs text-danger">{err}</p>}
        <div className="mt-3">
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            Schedule
          </Button>
        </div>
      </form>

      <div>
        <p className="text-sm font-semibold text-foreground">Upcoming open houses</p>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No open houses scheduled yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((o) => (
              <li
                key={o.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {formatRange(o.startsAt, o.endsAt)}
                  </p>
                  {o.capacity && (
                    <p className="text-xs text-muted-foreground">
                      Capacity {o.capacity}
                    </p>
                  )}
                  {o.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">{o.notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void remove(o.id)}
                  aria-label="Cancel open house"
                  className="rounded-full p-1.5 text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
