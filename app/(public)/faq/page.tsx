import Link from "next/link";
import {
  Search,
  Users,
  CreditCard,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { FaqAccordion, type FaqItem } from "@/components/landing/faq-accordion";
import { AskBox } from "@/components/ui/ask-box";
import { Callout } from "@/components/ui/callout";

export const metadata = {
  title: "FAQ — Realestate",
  description:
    "Most-asked questions about buying, listing, deposits, KYC, payouts, and what happens if a deal falls through.",
};

type Group = {
  key: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  items: FaqItem[];
};

const GROUPS: Group[] = [
  {
    key: "buyers",
    title: "For buyers",
    blurb: "Browsing, KYC, reserving, viewings.",
    icon: <Search className="h-4 w-4" />,
    items: [
      {
        q: "Do I need to sign up before I can browse?",
        a: "No. The whole catalogue is open. You only register when you want to reserve a listing, message an agent, or save searches.",
      },
      {
        q: "What does 'reserve online' actually mean?",
        a: "You pay a listing-specific deposit (5% by default) through Paystack. That moves the property out of the open market and into a private thread between you and the agent. The final purchase is completed offline with paperwork, as is standard for real estate.",
      },
      {
        q: "Why do I need to verify my identity (BVN)?",
        a: "Two reasons. One: high-value transactions invite fraud — KYC protects both buyer and seller. Two: it keeps the deposit-and-walk-away crowd out, so agents engage with real prospects only.",
      },
      {
        q: "Is the BVN stored anywhere?",
        a: "Never in plaintext. We send it to Dojah to verify, store only a SHA-256 hash, and our logger middleware redacts any 11-digit string from logs anyway.",
      },
      {
        q: "When do I get the exact location?",
        a: "Right after your deposit lands. We keep the precise address private until then to protect sellers from random drive-bys.",
      },
    ],
  },
  {
    key: "payments",
    title: "Payments & deposits",
    blurb: "Money in, money out.",
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      {
        q: "What happens if the deal falls through?",
        a: "Talk to the agent first — most issues resolve in messaging. If 48 hours go by with no response, the deposit auto-refunds. If the disagreement is bigger, our team reviews the audit log and either refunds you or releases the funds to the agent based on what's documented.",
      },
      {
        q: "Is the deposit refundable?",
        a: "Yes, inside the first 48 hours if the agent doesn't respond, or by mutual agreement after that. After contracts are signed offline, the deposit typically counts toward the purchase price.",
      },
      {
        q: "What currencies and methods does Paystack accept?",
        a: "Card, transfer, USSD — all routed through the standard Paystack collection. Settlement is in NGN.",
      },
      {
        q: "Do I pay any fee on top of the deposit?",
        a: "No extra platform fee to you. Paystack's standard transaction fees apply (you'll see them on the Paystack page).",
      },
    ],
  },
  {
    key: "agents",
    title: "For agents",
    blurb: "Applications, listing, payouts.",
    icon: <Users className="h-4 w-4" />,
    items: [
      {
        q: "How do I apply to list?",
        a: "Visit /agent/apply. Three steps: business profile, identity verification (BVN/NIN), and a bank account whose holder name matches your KYC. Admin reviews and approves — usually within a day.",
      },
      {
        q: "How much does the platform take?",
        a: "We're transparent about the split. The default agent commission on a sale is 5%; the platform fee is small and shown line-by-line in the ledger before any payout.",
      },
      {
        q: "How fast are payouts?",
        a: "Usually under 48 hours from the day a sale is marked converted. Admin batches payouts each afternoon, Paystack moves the money, you see the entry flip from PROCESSING to PAID.",
      },
      {
        q: "Can I edit a published listing?",
        a: "Yes. Edits to title, photos, or amenities go live immediately. Price or status changes send the listing back to PENDING_REVIEW briefly so admin can approve.",
      },
    ],
  },
  {
    key: "trust",
    title: "Trust & safety",
    blurb: "What protects everyone here.",
    icon: <ShieldCheck className="h-4 w-4" />,
    items: [
      {
        q: "Is every agent verified?",
        a: "Yes. KYC (BVN/NIN via Dojah) plus a bank-account-name match. Only APPROVED agents can list, and the verified shield in their profile reflects current status.",
      },
      {
        q: "What stops someone reserving and ghosting?",
        a: "The deposit. Walking away costs them. And the audit log — every action by every user is recorded, including who reserved what and when, so abusive patterns are visible to admin.",
      },
      {
        q: "Where is data stored?",
        a: "Listing data and ledgers live in Postgres (managed). Photos and selfies live in Cloudflare R2 (S3-compatible). Identity calls go to Dojah; payments go to Paystack. We never store BVN/NIN in plaintext.",
      },
      {
        q: "How can I report a listing or an agent?",
        a: "From any listing page, use the share/help affordance, or just email hello@realestate.ng — a real human reads every report.",
      },
    ],
  },
  {
    key: "platform",
    title: "About the platform",
    blurb: "Cities, expansion, FSBO.",
    icon: <Building2 className="h-4 w-4" />,
    items: [
      {
        q: "Which cities are live?",
        a: "Lagos, Abuja, Port Harcourt, Ibadan. Enugu, Kano and Calabar are next as we onboard enough KYC-passed agents on the ground.",
      },
      {
        q: "Can I list as an individual (FSBO)?",
        a: "Today, yes — apply as an agent. Even individual sellers go through KYC + bank verification. A dedicated FSBO path is in the works.",
      },
      {
        q: "Is there a mobile app?",
        a: "The site is mobile-first and works great in your browser. A native app is on the roadmap but is not priority right now.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="flex-1">
      <section className="border-b border-border bg-gradient-to-b from-surface-2 via-accent-soft/30 to-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance">
            Questions, answered — in plain English.
          </h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            Quick answers to the things we hear most. Missing something?{" "}
            <Link
              href="/contact"
              className="font-medium text-primary underline"
            >
              Ask us
            </Link>{" "}
            — a real human responds within the hour.
          </p>
        </div>

        {/* Anchor chips */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2 px-6">
          {GROUPS.map((g) => (
            <a
              key={g.key}
              href={`#${g.key}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <span className="text-primary">{g.icon}</span>
              {g.title}
            </a>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Callout
            tone="concierge"
            title="Can't find your question?"
            className="mb-10"
          >
            Tap any chip above to jump, or scroll. If we missed your question,
            drop it at the bottom — we add to this page every week.
          </Callout>

          <div className="space-y-14">
            {GROUPS.map((g) => (
              <div key={g.key} id={g.key} className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    {g.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {g.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{g.blurb}</p>
                  </div>
                </div>
                <FaqAccordion items={g.items} initiallyOpen={null} />
              </div>
            ))}
          </div>

          <div className="mt-14">
            <AskBox
              title="Still missing something?"
              subtitle="Tell us your question — we'll answer you personally and add it here for the next reader."
              placeholder="e.g. Can I pay with USD?"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
