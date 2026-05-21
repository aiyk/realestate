"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "How is this different from listing portals I already know?",
    a: "Every listing here is owned by either our verified admin team or an agent who's gone through KYC and bank verification. When you place a deposit, it's held by us — not the agent. That's the trust layer.",
  },
  {
    q: 'What does "reserve online" actually mean?',
    a: "You pay a small, listing-specific deposit through Paystack. That moves the property out of the open market and into a private conversation between you and the seller's agent. The final purchase is completed offline with paperwork, as is standard for real estate.",
  },
  {
    q: "Why do I need to verify my identity (BVN)?",
    a: "Two reasons. One: high-value real estate transactions invite fraud — KYC protects both buyer and seller. Two: it keeps the deposit-and-walk-away crowd out, so agents engage with real prospects.",
  },
  {
    q: "What happens if the deal falls through?",
    a: "Talk to the agent first — most issues get resolved in messaging. If you can't agree, our team can review and either refund the deposit or release it to the agent, depending on the agreement.",
  },
  {
    q: "How do agents get paid?",
    a: "Once a sale converts, a commission ledger is created on the platform. Admin processes the payout via Paystack transfer to the agent's verified bank account.",
  },
  {
    q: "Can I list a property as an individual seller (not an agency)?",
    a: 'Right now, yes — apply as an agent. Even individual sellers go through KYC + bank verification. We\'re working on a separate "FSBO" path for one-off sellers.',
  },
];

export function FaqAccordion({
  items = DEFAULT_FAQS,
  initiallyOpen = 0,
}: {
  items?: FaqItem[];
  initiallyOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(initiallyOpen);
  return (
    <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-stone-50"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-stone-900">
                {item.q}
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-stone-200 text-stone-600">
                {isOpen ? (
                  <Minus className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-stone-600 text-pretty">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
