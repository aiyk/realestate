"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AgentDecisionRow({
  id,
  canApprove,
  defaultCommissionPct,
}: {
  id: string;
  canApprove: boolean;
  defaultCommissionPct: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pct, setPct] = useState(defaultCommissionPct);

  async function approve() {
    setLoading("approve");
    setError(null);
    const res = await fetch(`/api/admin/agents/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultCommissionPct: pct }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Approve failed");
      return;
    }
    router.refresh();
  }

  async function reject() {
    const reason = prompt("Rejection reason?");
    if (!reason) return;
    setLoading("reject");
    setError(null);
    const res = await fetch(`/api/admin/agents/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Reject failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 flex items-end justify-between gap-3 border-t border-neutral-100 pt-3">
      <div>
        <label htmlFor={`pct-${id}`} className="block text-xs text-neutral-500">
          Default commission %
        </label>
        <Input
          id={`pct-${id}`}
          type="number"
          min="0"
          max="50"
          step="0.01"
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="mt-1 w-24"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={approve}
            disabled={!canApprove || !!loading}
          >
            {loading === "approve" ? "Approving…" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            disabled={!!loading}
          >
            Reject
          </Button>
        </div>
        {!canApprove && (
          <p className="text-xs text-amber-700">
            Awaiting KYC + bank account before approval.
          </p>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
