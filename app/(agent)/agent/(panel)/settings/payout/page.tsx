import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs = [
  { label: "Account", href: "/agent/settings/account" },
  { label: "Notifications", href: "/agent/settings/notifications" },
  { label: "Payout", href: "/agent/settings/payout" },
];

function maskAccount(no?: string | null) {
  if (!no) return "—";
  return no.length > 4 ? `••••${no.slice(-4)}` : no;
}

export default async function SettingsPayoutPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/settings/payout");

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: u.id },
    select: {
      bankCode: true,
      bankAccountNo: true,
      bankAccountName: true,
      bankReverifyRequestedAt: true,
    },
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <nav className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "border-b-2 px-3 pb-2 text-sm font-medium",
              t.href === "/agent/settings/payout"
                ? "border-primary text-primary-soft-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 max-w-xl space-y-6">
        {profile?.bankReverifyRequestedAt && (
          <Callout tone="warn" title="Re-verification in progress">
            We&apos;re re-verifying your new account details. Your payouts pause
            until admin confirms.
          </Callout>
        )}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Payout account
              </p>
              <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <dt className="text-muted-foreground">Account holder</dt>
                <dd className="text-foreground">
                  {profile?.bankAccountName ?? "—"}
                </dd>
                <dt className="text-muted-foreground">Account number</dt>
                <dd className="text-foreground">
                  {maskAccount(profile?.bankAccountNo)}
                </dd>
                <dt className="text-muted-foreground">Bank code</dt>
                <dd className="text-foreground">{profile?.bankCode ?? "—"}</dd>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Editing your account triggers re-verification. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
