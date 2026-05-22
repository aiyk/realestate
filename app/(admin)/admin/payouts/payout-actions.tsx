"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayoutActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, label: string, body?: object) {
    setLoading(label);
    setError(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? `${label} failed`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col items-end gap-1 border-t border-border pt-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            call(`/api/payouts/${id}/initiate-transfer`, "transfer")
          }
          disabled={!!loading}
        >
          {loading === "transfer" ? "Starting…" : "Initiate transfer"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const notes = prompt("Optional payout note (bank ref etc.)") ?? undefined;
            call(`/api/payouts/${id}/mark-paid`, "mark", { notes });
          }}
          disabled={!!loading}
        >
          Mark paid manually
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            const reason = prompt("Reason for cancel?");
            if (!reason || reason.length < 5) return;
            call(`/api/payouts/${id}/cancel`, "cancel", { reason });
          }}
          disabled={!!loading}
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-danger-soft-foreground">{error}</p>}
    </div>
  );
}
