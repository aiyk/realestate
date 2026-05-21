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
      <p className="mt-1 text-sm text-stone-600">
        Account, notifications, and payout preferences.
      </p>
      <nav className="mt-6 flex gap-2 border-b border-stone-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "border-b-2 px-3 pb-2 text-sm font-medium",
              t.href === "/agent/settings/account"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 max-w-xl space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-stone-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">Email</p>
              <p className="text-sm text-stone-600">{u.email}</p>
              <p className="mt-2 text-xs text-stone-500">
                Email changes require re-verification. Coming soon.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 text-stone-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">Password</p>
              <p className="text-sm text-stone-600">
                Choose a long, unique password. Updating soon.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-stone-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">
                Two-factor authentication
              </p>
              <p className="text-sm text-stone-600">
                Protect access with a TOTP authenticator app. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
