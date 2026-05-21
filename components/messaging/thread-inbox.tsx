"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Thread = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  lastMessage: { body: string; createdAt: string } | null;
  lastMessageAt: string;
  lastReadAt: string | null;
};

export function ThreadInbox({ basePath }: { basePath: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages/threads")
      .then((r) => r.json())
      .then((data) => setThreads(data.threads ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (threads.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
        No conversations yet.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      {threads.map((t) => {
        const unread =
          t.lastMessage && t.lastReadAt
            ? new Date(t.lastMessage.createdAt) > new Date(t.lastReadAt)
            : !!t.lastMessage;
        return (
          <li key={t.id}>
            <Link
              href={`${basePath}/${t.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {t.listingTitle}
                  {unread && (
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600 align-middle" />
                  )}
                </p>
                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {t.lastMessage?.body ?? "No messages yet"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {new Date(t.lastMessageAt).toLocaleString()}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
