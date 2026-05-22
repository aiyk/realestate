"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Send, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

type Props = {
  selected: string[];
  onClearSelection: () => void;
};

export function ListingBulkActions({ selected, onClearSelection }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<"archive" | "submit" | null>(null);

  async function run(action: "archive" | "submit") {
    if (selected.length === 0) return;
    if (
      action === "archive" &&
      !confirm(`Archive ${selected.length} listing(s)? They hide from buyers.`)
    ) {
      return;
    }
    setBusy(action);
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
      toast.success(
        action === "archive"
          ? `Archived ${selected.length} listing${selected.length === 1 ? "" : "s"}`
          : `Submitted ${selected.length} for review`,
      );
      onClearSelection();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBusy(null);
    }
  }

  if (selected.length === 0) return null;

  return (
    <div className="sticky top-2 z-sticky mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary-soft-foreground shadow-sm animate-slide-in-down">
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
      <DropdownMenu align="end">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="More bulk actions"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => run("submit")}>
            Submit all for review
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => run("archive")}>
            Archive all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        size="xs"
        variant="ghost"
        onClick={onClearSelection}
      >
        Clear
      </Button>
    </div>
  );
}
