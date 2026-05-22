import { Check, X } from "lucide-react";

type Row = { topic: string; them: string; us: string };

const ROWS: Row[] = [
  {
    topic: "Listings",
    them: "Stock photos, no verification, sometimes already sold.",
    us: "Verified agents only. Status updated in real time when a listing reserves or closes.",
  },
  {
    topic: "First contact",
    them: "\"Send your number, I'll WhatsApp you.\"",
    us: "In-app messaging with timestamps. Everything you said is right there if it ever matters.",
  },
  {
    topic: "Holding a place",
    them: "Verbal promise. Three buyers told the same thing.",
    us: "5% Paystack deposit puts the listing on quiet. Refundable inside 48 hours.",
  },
  {
    topic: "Identity",
    them: "Nobody checks anybody. The agent's friend buys it.",
    us: "BVN check before reserving. Nothing stored — just a hash.",
  },
  {
    topic: "Payouts to agents",
    them: "Vibes-based reconciliation, weeks late.",
    us: "Same-week Paystack transfers, with a ledger you can export.",
  },
  {
    topic: "If it falls through",
    them: "Good luck finding the agent again.",
    us: "Audit log of every action — and a real concierge to chase it.",
  },
];

/**
 * Side-by-side "other platforms vs us" comparison, styled as two chat
 * columns — a frustrated buyer on the left, a verified concierge on the
 * right. Used on the homepage and the about page.
 */
export function ComparisonTable() {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl bg-surface-3 shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr] bg-surface-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">
        <div>Topic</div>
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-3 text-muted-foreground">
            <X className="h-3 w-3" />
          </span>
          The old way
        </div>
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-primary">
            <Check className="h-3 w-3" />
          </span>
          With Realestate
        </div>
      </div>

      {ROWS.map((r) => (
        <div
          key={r.topic}
          className="grid grid-cols-1 gap-4 bg-card px-4 py-5 sm:grid-cols-[1fr_1fr_1fr] sm:px-6"
        >
          <div className="text-sm font-semibold text-foreground">{r.topic}</div>
          {/* Them — left chat bubble */}
          <div className="flex">
            <div className="rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
              {r.them}
            </div>
          </div>
          {/* Us — right chat bubble */}
          <div className="flex sm:justify-end">
            <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground">
              {r.us}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
