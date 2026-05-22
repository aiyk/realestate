import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { NotificationPrefsForm } from "@/components/agent/settings/notification-prefs-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs = [
  { label: "Account", href: "/agent/settings/account" },
  { label: "Notifications", href: "/agent/settings/notifications" },
  { label: "Payout", href: "/agent/settings/payout" },
];

export default async function SettingsNotificationsPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/settings/notifications");

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose what reaches you, and where.
      </p>
      <nav className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "border-b-2 px-3 pb-2 text-sm font-medium",
              t.href === "/agent/settings/notifications"
                ? "border-primary text-primary-soft-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 max-w-2xl">
        <NotificationPrefsForm />
      </div>
    </section>
  );
}
