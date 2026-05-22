"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function AgentListingActions({
  id,
  status,
}: {
  id: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/listings/${id}/submit`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Submit failed");
      return;
    }
    router.refresh();
  }

  const canSubmit = ["DRAFT", "REJECTED"].includes(status);
  if (!canSubmit) return null;
  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="sm" onClick={submit} disabled={loading}>
        {loading ? "Submitting…" : "Submit for review"}
      </Button>
      {error && <p className="text-xs text-danger-soft-foreground">{error}</p>}
    </div>
  );
}
