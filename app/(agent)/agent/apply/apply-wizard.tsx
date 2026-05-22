"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AgentProfile, KycStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Step = 1 | 2 | 3 | 4;

export function ApplyWizard({
  kycStatus,
  initial,
  fullName,
}: {
  kycStatus: KycStatus;
  initial: AgentProfile | null;
  fullName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    !initial?.businessName ? 1 : kycStatus !== "VERIFIED" ? 2 : !initial?.bankAccountNo ? 3 : 4,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState<string | null>(initial?.bankAccountName ?? null);

  async function saveBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/agents/apply/step/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: String(fd.get("businessName") ?? ""),
        cacNumber: String(fd.get("cacNumber") ?? "") || undefined,
        bio: String(fd.get("bio") ?? "") || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Save failed");
      return;
    }
    setStep(kycStatus === "VERIFIED" ? 3 : 2);
    router.refresh();
  }

  async function savePayout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/agents/apply/step/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankCode: String(fd.get("bankCode") ?? ""),
        bankAccountNo: String(fd.get("bankAccountNo") ?? ""),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data?.error?.message ?? "Save failed");
      return;
    }
    setBankName(data.profile?.bankAccountName);
    setStep(4);
    router.refresh();
  }

  async function submitFinal() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/agents/apply/submit", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "Submit failed");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <ol className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        {[1, 2, 3, 4].map((s) => (
          <li
            key={s}
            className={cn(
              "flex h-7 items-center rounded-full px-3",
              step >= s
                ? "bg-foreground text-background"
                : "bg-surface-2 text-muted-foreground",
            )}
          >
            {s === 1 ? "Business" : s === 2 ? "Identity" : s === 3 ? "Payout" : "Review"}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={saveBusiness} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="businessName">Business or agency name</Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={initial?.businessName}
              required
              minLength={2}
              maxLength={120}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cacNumber">CAC number (optional)</Label>
            <Input
              id="cacNumber"
              name="cacNumber"
              defaultValue={initial?.cacNumber ?? ""}
              maxLength={40}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio (optional)</Label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={initial?.bio ?? ""}
              maxLength={2000}
              rows={4}
              className="mt-1 block w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <p className="rounded-md bg-danger-soft p-3 text-sm text-danger-soft-foreground">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Identity verification (BVN/NIN) is required before agents can list
            properties. Same flow as the buyer KYC — complete it, then come back.
          </p>
          {kycStatus === "VERIFIED" ? (
            <p className="rounded-md bg-primary-soft p-3 text-sm text-primary-soft-foreground">
              KYC complete. Continue to payout details.
            </p>
          ) : (
            <Link
              href="/account/kyc"
              className={cn(buttonVariants(), "w-fit")}
            >
              Start KYC verification
            </Link>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={kycStatus !== "VERIFIED"}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={savePayout} className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Bank account for commission payouts. Account holder name must match{" "}
            <strong>{fullName}</strong>.
          </p>
          <div>
            <Label htmlFor="bankCode">Bank code</Label>
            <Input
              id="bankCode"
              name="bankCode"
              defaultValue={initial?.bankCode ?? ""}
              required
              placeholder="058 (GTBank)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bankAccountNo">Account number (10 digits)</Label>
            <Input
              id="bankAccountNo"
              name="bankAccountNo"
              defaultValue={initial?.bankAccountNo ?? ""}
              required
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              className="mt-1"
            />
          </div>
          {error && (
            <p className="rounded-md bg-danger-soft p-3 text-sm text-danger-soft-foreground">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify account"}
            </Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Review and submit. Admin will be notified and respond by email.
          </p>
          <ul className="space-y-2 rounded-md bg-surface-2 p-4 text-sm">
            <li>
              <strong>Business:</strong> {initial?.businessName}
            </li>
            <li>
              <strong>Identity:</strong>{" "}
              {kycStatus === "VERIFIED" ? "Verified ✓" : "Not verified"}
            </li>
            <li>
              <strong>Bank account:</strong>{" "}
              {bankName ?? initial?.bankAccountName} (
              {initial?.bankAccountNo?.slice(-4) ?? "—"})
            </li>
          </ul>
          {error && (
            <p className="rounded-md bg-danger-soft p-3 text-sm text-danger-soft-foreground">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button onClick={submitFinal} disabled={loading}>
              {loading ? "Submitting…" : "Submit application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
