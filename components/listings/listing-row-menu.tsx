"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArchiveRestore,
  Archive,
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Loader2,
} from "lucide-react";
import type { ListingStatus } from "@prisma/client";

type Props = {
  id: string;
  slug: string;
  status: ListingStatus;
};

export function ListingRowMenu({ id, slug, status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function duplicate() {
    setBusy(true);
    setOpen(false);
    const res = await fetch(`/api/listings/${id}/duplicate`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      const d = (await res.json()) as { listing?: { id?: string } };
      if (d.listing?.id) {
        router.push(`/agent/listings/${d.listing.id}/edit`);
        router.refresh();
        return;
      }
    }
    router.refresh();
  }

  async function archive() {
    if (!confirm("Archive this listing? It hides from buyers.")) return;
    setBusy(true);
    setOpen(false);
    await fetch("/api/listings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive", ids: [id] }),
    });
    setBusy(false);
    router.refresh();
  }

  async function unarchive() {
    setBusy(true);
    setOpen(false);
    await fetch("/api/listings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unarchive", ids: [id] }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label="Listing actions"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          <Link
            href={`/agent/listings/${id}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-2"
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          {(status === "PUBLISHED" || status === "RESERVED" || status === "SOLD") && (
            <Link
              href={`/listings/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-2"
              onClick={() => setOpen(false)}
            >
              <Eye className="h-4 w-4" /> Preview public
            </Link>
          )}
          <button
            type="button"
            onClick={duplicate}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-2"
          >
            <Copy className="h-4 w-4" /> Duplicate
          </button>
          {status === "ARCHIVED" ? (
            <button
              type="button"
              onClick={unarchive}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-2"
            >
              <ArchiveRestore className="h-4 w-4" /> Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={archive}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
            >
              <Archive className="h-4 w-4" /> Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}
