"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Top-bar navigation link with an active-page indicator. Reads the current
 * pathname so the active state stays correct on client-side navigation.
 *
 * A link is "active" when the current pathname equals its href or is a
 * sub-path of it (e.g. /listings/[slug] activates the /listings link).
 */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {children}
      {isActive && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
        />
      )}
    </Link>
  );
}
