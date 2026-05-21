"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/agent/dashboard" },
  { label: "Listings", href: "/agent/listings" },
  { label: "Reservations", href: "/agent/reservations" },
  { label: "Earnings", href: "/agent/earnings" },
  { label: "Messages", href: "/agent/messages" },
];

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 px-6 py-8">
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
  );
}
