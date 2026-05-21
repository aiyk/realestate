/**
 * Voice & microcopy library — "Friendly Lagos concierge"
 *
 * Centralised so every page speaks in the same warm, second-person tone.
 * Imports of these helpers are how we keep tone consistent across the
 * public surface, dashboards, and empty states.
 */

export type Domain =
  | "listings"
  | "reservations"
  | "messages"
  | "earnings"
  | "kyc"
  | "payouts"
  | "agents"
  | "applications";

export type EmptyCopy = {
  headline: string;
  body: string;
  cta?: { label: string; href: string };
};

const EMPTY: Record<Domain, EmptyCopy> = {
  listings: {
    headline: "Nothing live just yet",
    body: "We're polishing a few new homes for you. Pop back tomorrow — or tell me what you're after and I'll text you when something fits.",
    cta: { label: "Tell me what to watch for", href: "/contact" },
  },
  reservations: {
    headline: "No reservations yet",
    body: "Once you place a deposit on a listing, it lives here — receipts, status, the agent's number, everything.",
    cta: { label: "Browse listings", href: "/listings" },
  },
  messages: {
    headline: "Quiet for now",
    body: "Start a conversation from any listing or agent profile. We keep a clean record of every back-and-forth so nothing slips.",
    cta: { label: "Browse listings", href: "/listings" },
  },
  earnings: {
    headline: "First sale is on the way",
    body: "Commission entries land here the moment a reservation converts. You'll see the breakdown — sale, commission, platform fee, your net — and the day it lands in your account.",
  },
  kyc: {
    headline: "One quick identity check",
    body: "We need a BVN lookup before you can reserve. We never store the number itself — only a hash. Takes about thirty seconds.",
    cta: { label: "Start verification", href: "/account/kyc" },
  },
  payouts: {
    headline: "Nothing to send out yet",
    body: "Once a sale converts, the agent's payout queues up here. You approve, Paystack moves the money.",
  },
  agents: {
    headline: "Onboarding the first cohort",
    body: "We're vetting our first batch of agents — KYC, bank match, the works. New profiles will appear here as they pass.",
  },
  applications: {
    headline: "No applications waiting",
    body: "When agents apply, you'll see their business, KYC, and bank verification side-by-side right here.",
  },
};

export function emptyState(domain: Domain): EmptyCopy {
  return EMPTY[domain];
}

export function greet(firstName?: string | null): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (!firstName) return `${time} — welcome back.`;
  return `${time}, ${firstName}.`;
}

/** Tone-rich blurbs that sit beside the short status badge labels. */
export function statusBlurb(status: string): string {
  switch (status) {
    // ListingStatus
    case "DRAFT":
      return "Saved as a draft. Add a photo and a price, then send it for review.";
    case "PENDING_REVIEW":
      return "On the review desk. We usually clear listings within a day.";
    case "PUBLISHED":
      return "Live on the marketplace. Buyers can find it and reach out.";
    case "REJECTED":
      return "We sent it back — check the note from the team and resubmit.";
    case "RESERVED":
      return "A buyer has placed a deposit. It's quiet for everyone else until the deal closes.";
    case "SOLD":
      return "Closed. Congrats — the commission entry is in the agent's earnings.";
    case "ARCHIVED":
      return "Tucked away. Not visible to buyers.";
    // ReservationStatus
    case "PAID":
      return "Deposit secured. The agent has been notified and should reach out soon.";
    case "PENDING":
      return "Still waiting on Paystack to confirm the deposit.";
    case "FAILED":
      return "Payment didn't go through. No money moved — try again or change card.";
    case "CANCELLED":
      return "Cancelled. The listing is back on the market.";
    case "CONVERTED":
      return "This reservation turned into a closed sale.";
    // CommissionStatus
    case "PENDING_PAYOUT":
      return "Sitting in the payout queue. Admin will release this on the next batch.";
    case "PROCESSING":
      return "Paystack is moving the money. Allow up to a few hours.";
    case "ON_HOLD":
      return "Held by admin — usually a docs issue. Check messages.";
    // KYC / Agent application
    case "VERIFIED":
      return "All checks passed. You're cleared.";
    case "UNVERIFIED":
      return "We haven't seen any verification yet.";
    case "APPROVED":
      return "Approved. You can list properties now.";
    default:
      return "";
  }
}

/** Short status label — what shows inside a badge. */
export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Rotating concierge prompts for the hero subheading. */
export const HERO_PROMPTS: string[] = [
  "Looking for a 3-bed in Lekki?",
  "Land in Ibadan caught your eye?",
  "Need a serviced flat in Wuse?",
  "Curious what ₦80m gets you in Ikoyi?",
  "Hunting in Port Harcourt GRA?",
  "A duplex in Magodo, maybe?",
];

/** Conversational nudges sprinkled across listing-related surfaces. */
export const NUDGES = {
  reserveHeld:
    "This place goes quiet for everyone else the moment your deposit lands.",
  exactLocation:
    "Exact pin shared after the deposit. We do this to protect sellers from drive-bys.",
  refundable:
    "Refundable if the agent doesn't respond within 48 hours — that's a promise, not a footnote.",
  bvnPrivacy:
    "We never store your BVN. We hash it, check it against Dojah, then throw the number away.",
  escrow:
    "Paystack collects, we hold. Money only moves when both sides agree.",
  whatsAppNo:
    "No more 'send your number and I'll WhatsApp you' — every conversation lives here, with a receipt.",
};

/** Headlines we reuse across the marketing/public surface. */
export const HEADLINES = {
  homeHero: "Find a home you actually want to live in.",
  agentHero: "Built for agents who'd rather sell than chase.",
  trustStrip: "Why people who never trusted property platforms trust this one",
  comparisonTitle: "How we're different from 'send your number'",
};

/** Short conversational footers under stat numbers. */
export const STAT_SUBS = {
  listings: "and growing every week",
  agents: "all KYC + bank-checked",
  cities: "live across Nigeria",
  response: "average reply, agent to buyer",
};
