import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NigeriaMark } from "@/components/illustrations/nigeria-mark";
import { HeaderUserMenu } from "./header-user-menu";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
        >
          <NigeriaMark className="h-9 w-9 shadow-sm" />
          <span className="hidden sm:inline">Realestate</span>
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <Sparkles className="h-3 w-3" />
            NG
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink href="/listings">Browse</NavLink>
          <NavLink href="/agents">Agents</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
          <NavLink href="/contact">Talk to us</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <HeaderUserMenu
              email={user.email}
              fullName={user.fullName}
              role={user.role}
            />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Get started
              </Link>
            </div>
          )}
          <MobileNav isAuthed={!!user} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
    >
      {children}
    </Link>
  );
}
