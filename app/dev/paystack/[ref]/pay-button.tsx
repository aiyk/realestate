"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PayButton({
  reference,
  callbackUrl,
}: {
  reference: string;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/webhooks/paystack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": "dev-simulator",
      },
      body: JSON.stringify({
        event: "charge.success",
        data: { reference, status: "success", amount: 0 },
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Webhook failed");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <div className="space-y-2">
      <Button onClick={pay} disabled={loading} className="w-full">
        {loading ? "Simulating payment…" : "Pay now (simulated)"}
      </Button>
      {error && <p className="text-xs text-danger-soft-foreground">{error}</p>}
    </div>
  );
}
