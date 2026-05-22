"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Agents", href: "/admin/agents" },
  { label: "KYC", href: "/admin/kyc" },
  { label: "Reservations", href: "/admin/reservations" },
  { label: "Payouts", href: "/admin/payouts" },
  { label: "Messages", href: "/admin/messages" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="mx-auto flex w-full max-w-[100rem] flex-1 px-6 py-8">
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
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
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
