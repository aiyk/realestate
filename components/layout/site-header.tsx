import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NigeriaMark } from "@/components/illustrations/nigeria-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HeaderUserMenu } from "./header-user-menu";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
        >
          <NigeriaMark className="h-9 w-9 shadow-sm" />
          <span className="hidden sm:inline">Realestate</span>
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-soft-foreground">
            <Sparkles className="h-3 w-3" />
            NG
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          <NavLink href="/listings">Browse</NavLink>
          <NavLink href="/agents">Agents</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
          <NavLink href="/contact">Talk to us</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
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
