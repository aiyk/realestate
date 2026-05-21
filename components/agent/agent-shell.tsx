"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/agent/notification-bell";

const nav = [
  { label: "Dashboard", href: "/agent/dashboard" },
  { label: "Listings", href: "/agent/listings" },
  { label: "Leads", href: "/agent/leads" },
  { label: "Reservations", href: "/agent/reservations" },
  { label: "Calendar", href: "/agent/calendar" },
  { label: "Messages", href: "/agent/messages" },
  { label: "Earnings", href: "/agent/earnings" },
  { label: "Profile", href: "/agent/profile" },
  { label: "Settings", href: "/agent/settings" },
];

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Agent workspace
        </p>
        <NotificationBell />
      </div>
      <div className="flex flex-1 pt-6">
        <aside className="hidden w-56 shrink-0 pr-6 md:block">
          <nav className="space-y-1">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
