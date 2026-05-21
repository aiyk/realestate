"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutAction({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data?.error?.message ?? "Failed to start payment");
      return;
    }
    window.location.href = data.authUrl;
  }

  return (
    <div>
      <Button className="w-full" onClick={start} disabled={loading}>
        {loading ? "Starting payment…" : "Proceed to payment"}
      </Button>
      {error && (
        <p className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
