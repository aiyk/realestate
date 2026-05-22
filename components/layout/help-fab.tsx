"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Mail,
  Search,
  Wallet,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/listings",
    icon: <Search className="h-4 w-4" />,
    title: "Show me what's live",
    blurb: "Jump straight to the browse page.",
  },
  {
    href: "/how-it-works#deposit",
    icon: <Wallet className="h-4 w-4" />,
    title: "How does the deposit work?",
    blurb: "Paystack holds, we release on agreement.",
  },
  {
    href: "/agent/apply",
    icon: <Users className="h-4 w-4" />,
    title: "I want to list as an agent",
    blurb: "Two checks and a bank account — that's it.",
  },
  {
    href: "/faq",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Read the FAQ",
    blurb: "Most questions, answered in a paragraph.",
  },
];

export function HelpFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-30 print:hidden">
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] animate-scale-in rounded-3xl border border-border bg-card shadow-2xl">
          {/* Concierge greeting */}
          <div className="rounded-t-3xl bg-gradient-to-br from-primary via-primary-hover to-foreground p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-foreground">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Concierge</p>
                <p className="text-xs text-primary-foreground/90">
                  Real human, replies within the hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-primary-foreground transition-colors hover:bg-card/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 inline-block rounded-2xl rounded-tl-md bg-card/95 px-3 py-2 text-sm text-foreground shadow-sm">
              Hi 👋 — what brought you here today?
            </div>
          </div>

          {/* Quick links */}
          <div className="p-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-2xl p-3 text-sm transition-colors hover:bg-surface-2"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  {l.icon}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-foreground">
                    {l.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">{l.blurb}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Foot */}
          <div className="border-t border-border p-3">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Mail className="h-4 w-4" />
              Send us a note
            </Link>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Or email{" "}
              <a
                href="mailto:hello@realestate.ng"
                className="font-medium text-primary hover:underline"
              >
                hello@realestate.ng
              </a>
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group relative grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-xl transition-all hover:bg-primary-hover",
          !open && "animate-pulse-ring",
        )}
        aria-label={open ? "Close help" : "Open help"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && (
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-foreground">
            ?
          </span>
        )}
      </button>
    </div>
  );
}
