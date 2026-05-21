"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Entry = { term: string; definition: string };

const TERMS: Entry[] = [
  {
    term: "BVN",
    definition:
      "Bank Verification Number — the 11-digit identifier the CBN uses to tie one identity across all your bank accounts. We check it against Dojah, store only the hash, then forget the number.",
  },
  {
    term: "Deposit",
    definition:
      "A small Paystack payment (5% by default) that puts a listing on quiet for you. Refundable inside 48 hours if the agent doesn't respond.",
  },
  {
    term: "Escrow",
    definition:
      "Money held by a neutral party until both sides agree. With us that party is Paystack — we don't touch the funds until both you and the agent are satisfied.",
  },
  {
    term: "Conversion",
    definition:
      "When a reserved listing becomes a closed sale. The moment we mark it converted, the agent's commission is logged for payout.",
  },
  {
    term: "KYC",
    definition:
      "Know Your Customer — the identity check buyers do once before they can reserve. Agents do it too, plus a bank-name match.",
  },
  {
    term: "Payout",
    definition:
      "The agent's commission, transferred to their verified Nigerian bank account via Paystack. Usually under 48 hours from the day the sale converts.",
  },
  {
    term: "Listing status",
    definition:
      "Where a listing is in its lifecycle: Draft → Pending review → Published → Reserved → Sold. We update this live so nobody chases ghosts.",
  },
  {
    term: "Commission",
    definition:
      "Our default split is 5% to the agent + a small platform fee. You see the breakdown line-by-line in the earnings ledger.",
  },
];

/**
 * Flipping glossary chips — gives first-time visitors orientation
 * without making them read a 600-word page.
 */
export function GlossaryChips() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TERMS.map((t) => {
        const isOpen = open === t.term;
        return (
          <button
            key={t.term}
            type="button"
            onClick={() => setOpen(isOpen ? null : t.term)}
            className={cn(
              "group rounded-2xl border p-4 text-left transition-all",
              isOpen
                ? "border-emerald-500 bg-emerald-50 shadow-md"
                : "border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm",
            )}
            aria-expanded={isOpen}
          >
            <p
              className={cn(
                "text-sm font-bold tracking-tight",
                isOpen ? "text-emerald-900" : "text-stone-900",
              )}
            >
              {t.term}
            </p>
            <p
              className={cn(
                "mt-1 text-xs text-pretty",
                isOpen
                  ? "text-emerald-800"
                  : "text-stone-500 line-clamp-2 group-hover:text-stone-700",
              )}
            >
              {t.definition}
            </p>
          </button>
        );
      })}
    </div>
  );
}
