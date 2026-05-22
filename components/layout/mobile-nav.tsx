"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Users,
  BookOpen,
  Building2,
  MessageCircle,
  Mail,
  HelpCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NigeriaMark } from "@/components/illustrations/nigeria-mark";

type Group = {
  title: string;
  links: { href: string; label: string; icon: React.ReactNode; sub?: string }[];
};

const GROUPS: Group[] = [
  {
    title: "Browse",
    links: [
      {
        href: "/listings",
        label: "All listings",
        sub: "Verified, with prices",
        icon: <Search className="h-4 w-4" />,
      },
      {
        href: "/agents",
        label: "Find an agent",
        sub: "KYC + bank-checked",
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Learn",
    links: [
      {
        href: "/how-it-works",
        label: "How it works",
        sub: "Four steps, plain English",
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        href: "/about",
        label: "About us",
        sub: "Why we built this",
        icon: <Info className="h-4 w-4" />,
      },
      {
        href: "/faq",
        label: "FAQ",
        sub: "Most questions, answered",
        icon: <HelpCircle className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Help",
    links: [
      {
        href: "/agent/apply",
        label: "List as an agent",
        sub: "Apply in five minutes",
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        href: "/contact",
        label: "Talk to us",
        sub: "We answer within the hour",
        icon: <MessageCircle className="h-4 w-4" />,
      },
    ],
  },
];

export function MobileNav({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/60 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(400px,100vw)] animate-scale-in overflow-y-auto border-l border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-base font-bold"
              >
                <NigeriaMark className="h-8 w-8" />
                Realestate
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-6">
              {GROUPS.map((g) => (
                <div key={g.title} className="mb-5">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                            {l.icon}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-foreground">
                              {l.label}
                            </span>
                            {l.sub && (
                              <span className="block text-xs text-muted-foreground">
                                {l.sub}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {!isAuthed && (
                <div className="mt-4 grid gap-2 border-t border-border px-2 pt-5">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants())}
                  >
                    Get started — it&apos;s free
                  </Link>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-surface-2 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  hello@realestate.ng
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Real humans. Replies within the hour.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
