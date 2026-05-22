import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Mail, KeyRound } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs = [
  { label: "Account", href: "/agent/settings/account" },
  { label: "Notifications", href: "/agent/settings/notifications" },
  { label: "Payout", href: "/agent/settings/payout" },
];

export default async function SettingsAccountPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/settings/account");

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Account, notifications, and payout preferences.
      </p>
      <nav className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "border-b-2 px-3 pb-2 text-sm font-medium",
              t.href === "/agent/settings/account"
                ? "border-primary text-primary-soft-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 max-w-xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Email changes require re-verification. Coming soon.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Password</p>
              <p className="text-sm text-muted-foreground">
                Choose a long, unique password. Updating soon.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Two-factor authentication
              </p>
              <p className="text-sm text-muted-foreground">
                Protect access with a TOTP authenticator app. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
