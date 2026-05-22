import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Callout } from "@/components/ui/callout";

type Props = {
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  hasBankAccount: boolean;
  rejectionReason?: string | null;
};

export function VerificationBanner({
  status,
  kycStatus,
  hasBankAccount,
  rejectionReason,
}: Props) {
  if (status === "APPROVED") {
    return (
      <Callout
        tone="success"
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Verified agent"
      >
        Your profile is live. KYC + bank account match confirmed. Buyers see
        the green verified badge on your listings.
      </Callout>
    );
  }
  if (status === "REJECTED") {
    return (
      <Callout
        tone="warn"
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Application needs changes"
      >
        {rejectionReason ?? "Admin asked for a few adjustments before approval."}
      </Callout>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <Callout
        tone="warn"
        icon={<ShieldAlert className="h-5 w-5" />}
        title="Profile suspended"
      >
        Your profile and listings are hidden from buyers. Contact support to
        resolve.
      </Callout>
    );
  }
  // PENDING
  const checks: { label: string; done: boolean }[] = [
    { label: "Business details", done: true },
    { label: "Identity verified (KYC)", done: kycStatus === "VERIFIED" },
    { label: "Payout account verified", done: hasBankAccount },
  ];
  const allDone = checks.every((c) => c.done);
  return (
    <Callout
      tone={allDone ? "tip" : "info"}
      icon={<Shield className="h-5 w-5" />}
      title={allDone ? "Awaiting admin approval" : "Application in progress"}
    >
      <ul className="mt-1 space-y-0.5 text-xs">
        {checks.map((c) => (
          <li key={c.label}>
            {c.done ? "✓" : "○"} {c.label}
          </li>
        ))}
      </ul>
    </Callout>
  );
}
