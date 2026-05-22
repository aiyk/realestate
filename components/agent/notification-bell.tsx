"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agent/notifications/unread")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});

    const es = new EventSource("/api/agent/notifications/stream");
    es.addEventListener("notification", () => {
      setUnread((c) => c + 1);
    });
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/agent/notifications?take=10");
        const d = r.ok
          ? ((await r.json()) as { items?: NotificationRow[] })
          : { items: [] };
        if (!cancelled) setItems(d.items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/agent/notifications/read-all", { method: "POST" });
    setUnread(0);
    setItems((rows) =>
      rows.map((r) => ({ ...r, readAt: r.readAt ?? new Date().toISOString() })),
    );
  }

  async function markRead(id: string) {
    await fetch(`/api/agent/notifications/${id}/read`, { method: "POST" });
    setItems((rows) =>
      rows.map((r) =>
        r.id === id ? { ...r, readAt: new Date().toISOString() } : r,
      ),
    );
    setUnread((c) => Math.max(0, c - 1));
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul>
                {items.map((n) => {
                  const isUnread = !n.readAt;
                  const inner = (
                    <div
                      className={cn(
                        "flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0",
                        isUnread && "bg-primary-soft/60",
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-wide text-text-subtle">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.actionUrl ? (
                        <Link
                          href={n.actionUrl}
                          onClick={() => {
                            if (isUnread) void markRead(n.id);
                            setOpen(false);
                          }}
                          className="block hover:bg-surface-2"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnread) void markRead(n.id);
                          }}
                          className="block w-full text-left hover:bg-surface-2"
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Link
            href="/agent/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-primary hover:bg-surface-2"
          >
            See all
          </Link>
        </div>
      )}
    </div>
  );
}
