"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  selected: string[];
  onClearSelection: () => void;
};

export function ListingBulkActions({ selected, onClearSelection }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"archive" | "submit" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(action: "archive" | "submit") {
    if (selected.length === 0) return;
    if (
      action === "archive" &&
      !confirm(`Archive ${selected.length} listing(s)? They hide from buyers.`)
    ) {
      return;
    }
    setBusy(action);
    setErr(null);
    try {
      const res = await fetch("/api/listings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selected }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Bulk action failed");
      }
      onClearSelection();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBusy(null);
    }
  }

  if (selected.length === 0) return null;

  return (
    <div className="sticky top-2 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900 shadow-sm">
      <span className="font-medium">{selected.length} selected</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => run("submit")}
        disabled={busy !== null}
      >
        {busy === "submit" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Send className="h-3 w-3" />
        )}
        Submit for review
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => run("archive")}
        disabled={busy !== null}
      >
        {busy === "archive" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Archive className="h-3 w-3" />
        )}
        Archive
      </Button>
      <button
        type="button"
        onClick={onClearSelection}
        className="text-xs font-medium underline-offset-2 hover:underline"
      >
        Clear
      </button>
      {err && <span className="text-xs text-red-700">{err}</span>}
    </div>
  );
}
