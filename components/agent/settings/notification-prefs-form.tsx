"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Channel = { in_app: boolean; email: boolean };
type Prefs = Record<string, Channel>;

const EVENTS: { type: string; label: string; description: string }[] = [
  {
    type: "LEAD_NEW",
    label: "New lead",
    description: "A buyer contacts you or requests a viewing.",
  },
  {
    type: "RESERVATION_PAID",
    label: "Reservation paid",
    description: "A buyer pays the deposit on one of your listings.",
  },
  {
    type: "LISTING_APPROVED",
    label: "Listing approved",
    description: "Admin publishes one of your listings.",
  },
  {
    type: "LISTING_REJECTED",
    label: "Listing needs changes",
    description: "Admin asks for edits.",
  },
  {
    type: "PAYOUT_PAID",
    label: "Payout paid",
    description: "Commission lands in your bank account.",
  },
  {
    type: "PAYOUT_PROCESSING",
    label: "Payout processing",
    description: "Payment to your bank is in flight.",
  },
  {
    type: "MESSAGE_NEW",
    label: "New message",
    description: "A buyer messages you about a listing.",
  },
  {
    type: "OPEN_HOUSE_REMINDER",
    label: "Open house reminder",
    description: "Heads-up the day before an open house.",
  },
  {
    type: "PROFILE_VERIFIED",
    label: "Profile verified",
    description: "Your application is approved or your bank is re-verified.",
  },
  {
    type: "SYSTEM",
    label: "Platform announcements",
    description: "Important account or platform-wide news.",
  },
];

const DEFAULTS: Prefs = Object.fromEntries(
  EVENTS.map((e) => [
    e.type,
    {
      in_app: true,
      email:
        e.type === "MESSAGE_NEW" ||
        e.type === "PAYOUT_PROCESSING" ||
        e.type === "SYSTEM"
          ? false
          : true,
    },
  ]),
);

export function NotificationPrefsForm() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agent/settings/notification-prefs");
        if (!res.ok) return;
        const d = (await res.json()) as { prefs?: Prefs };
        if (cancelled) return;
        const merged: Prefs = { ...DEFAULTS };
        for (const [type, val] of Object.entries(d.prefs ?? {})) {
          merged[type] = {
            in_app: val.in_app ?? DEFAULTS[type]?.in_app ?? true,
            email: val.email ?? DEFAULTS[type]?.email ?? false,
          };
        }
        setPrefs(merged);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(type: string, channel: "in_app" | "email") {
    setPrefs((cur) => ({
      ...cur,
      [type]: {
        in_app: cur[type]?.in_app ?? true,
        email: cur[type]?.email ?? false,
        [channel]: !(cur[type]?.[channel] ?? false),
      },
    }));
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/agent/settings/notification-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not save");
      }
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading preferences…
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[1fr_80px_80px] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Event</span>
        <span className="text-center">In-app</span>
        <span className="text-center">Email</span>
      </div>
      {EVENTS.map((e) => {
        const current = prefs[e.type] ?? DEFAULTS[e.type];
        return (
          <div
            key={e.type}
            className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{e.label}</p>
              <p className="text-xs text-muted-foreground">{e.description}</p>
            </div>
            <div className="text-center">
              <input
                type="checkbox"
                aria-label={`${e.label} in-app`}
                checked={current?.in_app ?? false}
                onChange={() => toggle(e.type, "in_app")}
                className="h-4 w-4 [accent-color:var(--primary)]"
              />
            </div>
            <div className="text-center">
              <input
                type="checkbox"
                aria-label={`${e.label} email`}
                checked={current?.email ?? false}
                onChange={() => toggle(e.type, "email")}
                className="h-4 w-4 [accent-color:var(--primary)]"
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
        {err && <span className="text-xs text-danger">{err}</span>}
        {savedAt && !saving && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </button>
      </div>
    </div>
  );
}
