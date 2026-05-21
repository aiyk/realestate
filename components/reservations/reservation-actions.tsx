"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReservationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function ReservationActions({
  id,
  status,
  allowConvert,
  allowCancel,
}: {
  id: string;
  status: ReservationStatus;
  allowConvert?: boolean;
  allowCancel?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function convert() {
    if (!confirm("Mark this reservation as converted? Listing will be SOLD and commission ledger row created.")) return;
    setLoading("convert");
    setError(null);
    const res = await fetch(`/api/reservations/${id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Convert failed");
      return;
    }
    router.refresh();
  }

  async function cancel() {
    const reason = prompt("Reason for cancellation?");
    if (!reason || reason.length < 5) return;
    setLoading("cancel");
    setError(null);
    const res = await fetch(`/api/reservations/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Cancel failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col items-end gap-1 border-t border-neutral-100 pt-3">
      <div className="flex gap-2">
        {allowConvert && status === "PAID" && (
          <Button size="sm" onClick={convert} disabled={!!loading}>
            {loading === "convert" ? "Converting…" : "Mark converted"}
          </Button>
        )}
        {allowCancel && (
          <Button
            size="sm"
            variant="destructive"
            onClick={cancel}
            disabled={!!loading}
          >
            Cancel
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
