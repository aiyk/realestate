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
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] animate-scale-in rounded-3xl border border-stone-200 bg-white shadow-2xl">
          {/* Concierge greeting */}
          <div className="rounded-t-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900 p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-stone-900">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Concierge</p>
                <p className="text-xs text-emerald-100/90">
                  Real human, replies within the hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-emerald-100 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 inline-block rounded-2xl rounded-tl-md bg-white/95 px-3 py-2 text-sm text-stone-800 shadow-sm">
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
                className="flex items-start gap-3 rounded-2xl p-3 text-sm transition-colors hover:bg-stone-50"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  {l.icon}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-stone-900">
                    {l.title}
                  </span>
                  <span className="block text-xs text-stone-500">{l.blurb}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Foot */}
          <div className="border-t border-stone-100 p-3">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-50 transition-colors hover:bg-emerald-800"
            >
              <Mail className="h-4 w-4" />
              Send us a note
            </Link>
            <p className="mt-2 text-center text-[11px] text-stone-500">
              Or email{" "}
              <a
                href="mailto:hello@realestate.ng"
                className="font-medium text-emerald-700 hover:underline"
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
          "group relative grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-white shadow-xl transition-all hover:bg-emerald-800",
          !open && "animate-pulse-ring",
        )}
        aria-label={open ? "Close help" : "Open help"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && (
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-bold text-stone-900">
            ?
          </span>
        )}
      </button>
    </div>
  );
}
