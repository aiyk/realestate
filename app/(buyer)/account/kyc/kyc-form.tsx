"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function KycForm({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      bvn: String(fd.get("bvn") ?? "").trim(),
      nin: String(fd.get("nin") ?? "").trim() || undefined,
      dob: String(fd.get("dob") ?? ""),
      selfieKey: "dev/no-selfie", // R2 selfie upload integrates here in prod
    };
    const res = await fetch("/api/kyc/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data?.error?.message ?? "Verification failed");
      return;
    }
    if (data.status === "VERIFIED") {
      router.refresh();
    } else {
      setError(data.reason ?? "Verification failed");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Verifying name <strong>{fullName}</strong> against BVN/NIN records.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bvn">BVN (11 digits)</Label>
        <Input
          id="bvn"
          name="bvn"
          required
          inputMode="numeric"
          pattern="\d{11}"
          placeholder="22222222222"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nin">NIN (optional, 11 digits)</Label>
        <Input
          id="nin"
          name="nin"
          inputMode="numeric"
          pattern="\d{11}"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dob">Date of birth</Label>
        <Input id="dob" name="dob" type="date" required />
      </div>
      {error && (
        <p className="rounded-md bg-danger-soft p-3 text-sm text-danger-soft-foreground">{error}</p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Verifying…" : "Verify identity"}
      </Button>
    </form>
  );
}
