"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function ListingActions({
  id,
  status,
}: {
  id: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, label: string, init?: RequestInit) {
    setLoading(label);
    setError(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? `${label} failed`);
      return;
    }
    router.refresh();
  }

  const canPublish = ["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(status);
  const canModerate = status === "PENDING_REVIEW";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {canPublish && !canModerate && (
          <Button
            size="sm"
            onClick={() => call(`/api/listings/${id}/publish`, "publish")}
            disabled={!!loading}
          >
            {loading === "publish" ? "Publishing…" : "Publish"}
          </Button>
        )}
        {canModerate && (
          <>
            <Button
              size="sm"
              onClick={() =>
                call(`/api/listings/${id}/moderate`, "approve", {
                  body: JSON.stringify({ decision: "approve" }),
                })
              }
              disabled={!!loading}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const reason = prompt("Rejection reason?");
                if (!reason) return;
                call(`/api/listings/${id}/moderate`, "reject", {
                  body: JSON.stringify({ decision: "reject", reason }),
                });
              }}
              disabled={!!loading}
            >
              Reject
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!confirm("Archive this listing?")) return;
            call(`/api/listings/${id}`, "archive", { method: "DELETE" });
          }}
          disabled={!!loading}
        >
          Archive
        </Button>
      </div>
      {error && <p className="text-xs text-danger-soft-foreground">{error}</p>}
    </div>
  );
}
