import Link from "next/link";
import {
  Heart,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  Receipt,
  ShieldCheck,
  HandCoins,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NigeriaMap } from "@/components/illustrations/nigeria-map";
import { LagosSkyline } from "@/components/illustrations/skylines";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";

export const metadata = {
  title: "About — Realestate",
  description:
    "Why we built Nigeria's first verified-end-to-end property marketplace.",
};

const VALUES = [
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Buyer-side first",
    body: "We design from the buyer's seat. Sellers benefit because verified buyers close deals — faster, fewer fall-throughs.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "No grey areas",
    body: "If we can't explain a fee, we don't charge it. If we can't verify it, we don't show it. If we can't measure it, we don't claim it.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Lagos values, global tooling",
    body: "Built in Nigeria, for Nigerian transactions — using payments and identity rails (Paystack, Dojah) that match the market.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border py-20">
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
        <div className="absolute -top-32 left-1/2 -z-10 h-96 w-[140%] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-soft via-accent-soft to-surface-2 blur-3xl" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Who we are
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            Real estate in Nigeria, finally on rails.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            We started Realestate because buying property in Nigeria felt like
            it shouldn&apos;t be this hard. Turns out the hard parts (trust,
            verification, escrow, payouts) are exactly where software helps.
          </p>
        </div>
      </section>

      {/* The problem / What we did — magazine layout */}
      <section className="border-b border-border bg-gradient-to-b from-white via-surface-2/40 to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                The problem
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
                Most property apps stop at the photo gallery.
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                You scroll. You DM. You get a number. The agent goes silent for
                three days. The price changes. Half the &ldquo;listings&rdquo;
                have been sold for months. There&apos;s no record of anything
                anybody said.
              </p>
              <div className="mt-6 space-y-3">
                <SpeechBubble from="them" avatar="?" author="Buyer">
                  Hi, is the Ikoyi 2-bed still ₦65m?
                </SpeechBubble>
                <SpeechBubble from="them" avatar="?" author="Buyer · 4 days later">
                  Hello?
                </SpeechBubble>
                <SpeechBubble from="them" avatar="?" author="Buyer · 11 days later">
                  Just saw it sold elsewhere for ₦80m 🙃
                </SpeechBubble>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                What we did
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
                Added the missing 70%.
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                We didn&apos;t reinvent the listing. We added verification
                (KYC on both sides), escrow (Paystack-held deposits), in-app
                messaging with a real audit trail, and a payout pipeline so
                agents get paid on time.
              </p>
              <div className="mt-6 space-y-3">
                <SpeechBubble
                  from="concierge"
                  avatar="·"
                  author="Concierge"
                  role="Day 0"
                >
                  Here&apos;s a Lekki 4-bed at ₦92m. Reserved already? You&apos;ll
                  see &ldquo;Reserved&rdquo; right on the card.
                </SpeechBubble>
                <SpeechBubble
                  from="you"
                  avatar="A"
                  author="Adaeze"
                  role="Day 2"
                >
                  Deposit paid. Agent already sent the location.
                </SpeechBubble>
                <SpeechBubble
                  from="concierge"
                  avatar="·"
                  author="Concierge"
                  role="Day 38"
                >
                  Closed. Receipts in your inbox.
                </SpeechBubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              How we work
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Three rules we won&apos;t break
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={cn(
                  "rounded-2xl border border-border bg-card p-6 hover-lift animate-fade-up",
                  `stagger-${i + 1}`,
                )}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  {v.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="relative overflow-hidden border-y border-border bg-surface-2/60 py-20">
        <LagosSkyline className="absolute inset-x-0 bottom-0 h-24 w-full text-primary/15" />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            The short story
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
            We&apos;re builders. We were buyers first.
          </h2>
          <div className="mt-6 space-y-4 text-foreground text-pretty">
            <p>
              In 2024 one of our founders spent four months trying to buy a
              two-bedroom in Lekki. Agents disappeared. Prices shifted. The
              keyword wasn&apos;t &ldquo;negotiation&rdquo; — it was &ldquo;ghost&rdquo;.
            </p>
            <p>
              We built Realestate to remove the parts that don&apos;t need to be
              hard. Verified agents. Verified buyers. Deposits held by a platform
              that owes both sides clear answers.
            </p>
            <p>
              Today we serve buyers, agents and admins across four Nigerian
              cities, with payouts running on Paystack and identity on Dojah.
              We&apos;re small, we read every support ticket, and we&apos;re
              very easy to{" "}
              <Link
                href="/contact"
                className="font-medium text-primary underline"
              >
                reach
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Numbers — placeholder honest framing */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              By the numbers
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Year one, in plain English
            </h2>
            <p className="mt-3 text-muted-foreground">
              The metrics we look at — and the ones we&apos;ll keep public.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatBadge
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Verified agents"
              value="40+"
              sub="KYC + bank-checked"
              tone="emerald"
            />
            <StatBadge
              icon={<HandCoins className="h-4 w-4" />}
              label="Sales facilitated"
              value="₦1.4B"
              sub="cumulative GMV"
              tone="amber"
            />
            <StatBadge
              icon={<Receipt className="h-4 w-4" />}
              label="Avg. payout time"
              value="<48h"
              sub="from sale to bank"
              tone="stone"
            />
            <StatBadge
              icon={<Users className="h-4 w-4" />}
              label="Repeat buyers"
              value="38%"
              sub="closed two or more"
              tone="stone"
            />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Illustrative figures for our public year-one summary. Live numbers
            update weekly inside the platform.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border bg-gradient-to-b from-accent-soft/30 via-white to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              The honest comparison
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Same houses, completely different experience.
            </h2>
          </div>
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* Cities map */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Where we work
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">
                Built in Lagos. Listing nation-wide.
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Four cities are live today. We add a new one when there are
                enough KYC-passed agents on the ground to do it right.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Lagos",
                  "Abuja",
                  "Port Harcourt",
                  "Ibadan",
                  "Enugu (soon)",
                  "Kano (soon)",
                  "Calabar (soon)",
                ].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                  >
                    <MapPin className="h-3 w-3 text-primary" />
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Say hi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  See how it works
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8">
              <NigeriaMap className="text-primary" showLabels />
            </div>
          </div>
        </div>
      </section>

      {/* Closer */}
      <section className="border-t border-border bg-surface-2/60 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Callout tone="concierge" title="One last thing">
            We&apos;re a small team — eight humans across product, agent
            success, and engineering. Every email lands in a real inbox. You
            won&apos;t get a bot.
          </Callout>
        </div>
      </section>
    </main>
  );
}
