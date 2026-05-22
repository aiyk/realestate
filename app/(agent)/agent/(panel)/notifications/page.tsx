import Link from "next/link";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const ms = Date.now() - date.getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default async function AgentNotificationsPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            What&apos;s new
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approvals, payouts, messages, and new leads in one place.
          </p>
        </div>
        <Link
          href="/agent/settings/notifications"
          className="text-sm font-medium text-primary hover:underline"
        >
          Notification settings →
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card p-12 text-center">
          <BellOff className="mx-auto h-16 w-16 text-text-subtle" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            All quiet
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Nothing has happened yet. We&apos;ll let you know the moment
            something does.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {notifications.map((n) => {
            const inner = (
              <div className="flex flex-col gap-1 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={
                      n.readAt
                        ? "text-sm text-foreground"
                        : "text-sm font-semibold text-foreground"
                    }
                  >
                    {n.title}
                  </p>
                  <span className="text-[10px] uppercase tracking-wide text-text-subtle">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                {n.body && (
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                )}
              </div>
            );
            return (
              <li key={n.id} className={n.readAt ? "" : "bg-primary-soft/30"}>
                {n.actionUrl ? (
                  <Link href={n.actionUrl} className="block hover:bg-surface-2">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
