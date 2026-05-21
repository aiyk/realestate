import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Receipt,
  HeartHandshake,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { HeroSearch } from "@/components/landing/hero-search";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { RotatingPrompt } from "@/components/landing/rotating-prompt";
import { ListingTypesGrid } from "@/components/landing/listing-types-grid";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { GlossaryChips } from "@/components/landing/glossary-chips";
import { DepositCalculator } from "@/components/landing/deposit-calculator";
import { NigeriaMap } from "@/components/illustrations/nigeria-map";
import {
  LagosSkyline,
  AbujaSkyline,
  PortHarcourtSkyline,
  IbadanSkyline,
} from "@/components/illustrations/skylines";
import { FlowDiagram } from "@/components/illustrations/flow-diagram";
import { DepositShield } from "@/components/illustrations/deposit-shield";
import { ChatBubbles } from "@/components/illustrations/chat-bubbles";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { Callout } from "@/components/ui/callout";
import { StatBadge } from "@/components/ui/stat-badge";
import { AskBox } from "@/components/ui/ask-box";
import { HEADLINES, HERO_PROMPTS, STAT_SUBS } from "@/lib/voice";

export const dynamic = "force-dynamic";

const NEIGHBOURHOODS = [
  {
    city: "Lagos",
    blurb: "Lekki, Ikoyi, Yaba — the busiest pulse in West Africa.",
    image: "https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?w=600&q=80",
    Skyline: LagosSkyline,
  },
  {
    city: "Abuja",
    blurb: "Maitama, Asokoro, Wuse — quieter streets, deeper pockets.",
    image: "https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=600&q=80",
    Skyline: AbujaSkyline,
  },
  {
    city: "Port Harcourt",
    blurb: "GRA, Trans-Amadi — oil-and-gas country with serious upside.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    Skyline: PortHarcourtSkyline,
  },
  {
    city: "Ibadan",
    blurb: "Bodija, Jericho — old money meets new builds.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80",
    Skyline: IbadanSkyline,
  },
];

const TESTIMONIALS = [
  {
    name: "Chinwe O.",
    initials: "CO",
    role: "First-time buyer · Lagos",
    quote:
      "I had been ghosted by three agents on Instagram before. The deposit flow here forced everyone to be serious — I had keys in six weeks.",
  },
  {
    name: "Tunde A.",
    initials: "TA",
    role: "Agent · Realty Edge",
    quote:
      "Half my conversations used to be tyre-kickers. Verified buyers and a working payout pipeline changed the math for me overnight.",
  },
  {
    name: "Adaeze N.",
    initials: "AN",
    role: "Property investor · Abuja",
    quote:
      "Finally a Nigerian platform that doesn't require me to call seven people to confirm a price. The agent profiles + transaction history actually help.",
  },
];

const WHY_BLOCKS = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Verified end-to-end",
    body: "Agents pass KYC and bank-name match before they can list. Buyers verify before they can reserve. Nobody anonymous moves money here.",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Deposits held in escrow",
    body: "Paystack collects, the platform holds. Funds move on signal, never on hope. Refundable inside 48 hours if your agent goes quiet.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Built-in audit trail",
    body: "Every offer, every conversation, every payment — searchable, exportable, your records. The receipt is the relationship.",
  },
];

export default async function HomePage() {
  const [featured, totalListings, totalAgents, totalCities, listingsPerCity] =
    await Promise.all([
      prisma.listing.findMany({
        where: { status: { in: ["PUBLISHED", "RESERVED"] } },
        take: 6,
        orderBy: { publishedAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          agent: { select: { fullName: true } },
        },
      }),
      prisma.listing.count({ where: { status: "PUBLISHED" } }),
      prisma.agentProfile.count({ where: { status: "APPROVED" } }),
      prisma.listing
        .findMany({
          where: { status: "PUBLISHED" },
          select: { city: true },
          distinct: ["city"],
        })
        .then((r) => r.length),
      prisma.listing.groupBy({
        by: ["city"],
        where: { status: "PUBLISHED" },
        _count: { _all: true },
      }),
    ]);

  const cityCount = (city: string) =>
    listingsPerCity.find((c) => c.city.toLowerCase() === city.toLowerCase())
      ?._count._all ?? 0;

  return (
    <main className="flex-1">
      <Hero />
      <Trust
        totalListings={totalListings}
        totalAgents={totalAgents}
        totalCities={totalCities}
      />

      {/* Neighbourhoods */}
      <section className="border-y border-stone-100 bg-stone-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Where Nigeria lives
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Explore by city
              </h2>
              <p className="mt-2 max-w-xl text-stone-600 text-pretty">
                Pick a city. We&apos;ll show you what&apos;s actually available
                right now — not what was available last quarter.
              </p>
            </div>
            <Link
              href="/listings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              See every listing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEIGHBOURHOODS.map((n, i) => {
              const Skyline = n.Skyline;
              const count = cityCount(n.city);
              return (
                <Link
                  key={n.city}
                  href={`/listings?city=${encodeURIComponent(n.city)}`}
                  className={cn(
                    "group relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200 hover-lift animate-fade-up",
                    `stagger-${i + 1}`,
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image}
                    alt={n.city}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />
                  <Skyline className="absolute inset-x-0 bottom-12 h-16 w-full text-white/30" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-emerald-200">
                          Discover
                        </p>
                        <h3 className="mt-1 text-2xl font-bold">{n.city}</h3>
                      </div>
                      {count > 0 && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-stone-900">
                          {count} live
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-stone-200/90">{n.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listing types */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              What are we looking for?
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Tell us what &lsquo;home&rsquo; looks like for you.
            </h2>
            <p className="mt-3 text-stone-600 text-pretty">
              Tap any shape below — we&apos;ll pre-filter the marketplace for
              you. Don&apos;t see a fit? Land or apartment usually covers it.
            </p>
          </div>
          <div className="mt-12">
            <ListingTypesGrid />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-stone-100 bg-gradient-to-b from-white via-amber-50/30 to-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              The short version
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From scrolling to keys, in four steps.
            </h2>
            <p className="mt-3 text-stone-600 text-pretty">
              Four steps, plain English. No back-and-forth WhatsApp marathons,
              no &ldquo;send your number and I&apos;ll get back to you.&rdquo;
            </p>
          </div>

          <div className="mt-12 hidden lg:block">
            <FlowDiagram />
          </div>

          {/* Mobile-friendly fallback */}
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {[
              { icon: <Building2 className="h-5 w-5" />, title: "Browse openly", body: "Every published listing is visible. No sign-up to look around." },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Verify yourself", body: "One-time BVN check before you reserve. Hashed, never stored." },
              { icon: <Wallet className="h-5 w-5" />, title: "Reserve with a deposit", body: "Pay a small deposit through Paystack. The property quiets for the seller." },
              { icon: <KeyRound className="h-5 w-5" />, title: "Close offline", body: "Meet the agent, do paperwork, complete the sale. We handle the trust layer." },
            ].map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-2xl border border-stone-200 bg-white p-5 hover-lift"
              >
                <span className="absolute right-4 top-3 text-4xl font-bold text-stone-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  {s.icon}
                </div>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 mx-auto max-w-3xl space-y-3">
            <SpeechBubble from="them" avatar="A" author="Adaeze" role="Buyer · Day 1">
              Saw a 3-bed in Lekki on the homepage. Wow.
            </SpeechBubble>
            <SpeechBubble
              from="you"
              avatar="K"
              author="Kunle"
              role="Listing agent"
            >
              That one&apos;s live. Verify your identity, drop the deposit, and
              I&apos;ll send you the location for Saturday.
            </SpeechBubble>
            <SpeechBubble
              from="concierge"
              avatar="·"
              author="Concierge"
              role="Day 38"
            >
              Deal closed. Keys handed. Commission paid out in 41 hours.
              Receipts in your inbox.
            </SpeechBubble>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              The longer version
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Hot off the press
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Recently listed
              </h2>
              <p className="mt-2 max-w-xl text-stone-600">
                The newest published listings on the platform. Photos are real,
                prices are real, and every agent below is KYC-verified.
              </p>
            </div>
            <Link
              href="/listings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              See everything
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-3 font-semibold text-stone-700">
                Nothing live just yet
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Listings are being prepared. Drop your wishlist below and
                we&apos;ll text you when something matches.
              </p>
              <div className="mx-auto mt-6 max-w-xl text-left">
                <AskBox />
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((l, i) => (
                <div
                  key={l.id}
                  className={cn("animate-fade-up", `stagger-${(i % 6) + 1}`)}
                >
                  <ListingCard
                    slug={l.slug}
                    title={l.title}
                    city={l.city}
                    state={l.state}
                    priceNgn={l.priceNgn.toString()}
                    depositNgn={l.depositNgn?.toString()}
                    bedrooms={l.bedrooms}
                    bathrooms={l.bathrooms}
                    areaSqm={l.areaSqm ? Number(l.areaSqm) : null}
                    propertyType={l.propertyType}
                    status={l.status}
                    imageUrl={l.images[0]?.url ?? null}
                    agentName={l.agent?.fullName ?? null}
                    isNew={i < 3}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-stone-100 bg-stone-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Why Realestate
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Built for how Nigerians actually buy property.
              </h2>
              <p className="mt-3 text-stone-600 text-pretty">
                Most marketplaces show you photos and a phone number.
                We&apos;ve added the missing 70% — verification, deposits,
                messaging, payouts. Less drama, more dialogue.
              </p>

              <ul className="mt-8 space-y-4">
                {WHY_BLOCKS.map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                      {b.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{b.title}</p>
                      <p className="mt-1 text-sm text-stone-600 text-pretty">
                        {b.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/how-it-works"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Show me the long version
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  Why we built this
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-emerald-100 via-amber-50 to-stone-50 blur-2xl" />
              <ChatBubbles />
            </div>
          </div>
        </div>
      </section>

      {/* Deposit calculator */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Money question
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                &ldquo;Wait — how much do I actually pay now?&rdquo;
              </h2>
              <p className="mt-3 max-w-xl text-stone-600 text-pretty">
                Reserving a place doesn&apos;t mean paying the full price up
                front. It means putting down a small, refundable deposit so
                the listing freezes for you. Try it.
              </p>
              <Callout tone="tip" title="Quick math" className="mt-6 max-w-xl">
                If a listing is ₦80,000,000, your deposit is ₦4,000,000. That
                holds the place — refundable inside 48 hours if the agent
                doesn&apos;t respond. The rest moves at close.
              </Callout>
            </div>
            <DepositCalculator />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-stone-100 bg-gradient-to-b from-stone-50 via-white to-amber-50/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              The honest comparison
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              {HEADLINES.comparisonTitle}
            </h2>
            <p className="mt-3 text-stone-600 text-pretty">
              We&apos;re not the only place to look. We are the only place that
              treats your time and money like they matter.
            </p>
          </div>
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Said about us
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              From folks who&apos;ve actually used it
            </h2>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              <Star className="h-3.5 w-3.5 fill-current" />
              4.8 average · 312 verified reviews
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={t.name}
                className={cn(
                  "rounded-3xl border border-stone-200 bg-white p-6 hover-lift animate-fade-up shadow-sm",
                  `stagger-${i + 1}`,
                )}
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-stone-700 text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-semibold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* For agents CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900 p-10 text-white sm:p-16">
            <div className="absolute right-0 top-0 h-72 w-72 -translate-y-12 translate-x-12 rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 translate-y-12 -translate-x-12 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  For agents
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                  Stop chasing tyre-kickers.
                </h2>
                <p className="mt-3 max-w-xl text-emerald-100/90 text-pretty">
                  Buyers come to you pre-verified, pre-deposit. You get a real
                  agent dashboard, commission ledger, and same-week Paystack
                  payouts. We take a small platform fee and stay out of your way.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    icon={<HeartHandshake className="h-4 w-4" />}
                    value="5%"
                    label="Default commission"
                  />
                  <Stat
                    icon={<Wallet className="h-4 w-4" />}
                    value="<48h"
                    label="Average payout"
                  />
                  <Stat
                    icon={<ShieldCheck className="h-4 w-4" />}
                    value="100%"
                    label="Verified buyers"
                  />
                  <Stat
                    icon={<TrendingUp className="h-4 w-4" />}
                    value="2x"
                    label="Conversion lift"
                  />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/agent/apply"
                    className={cn(
                      buttonVariants({ variant: "accent", size: "lg" }),
                    )}
                  >
                    Apply to list
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/how-it-works#for-agents"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Read the agent guide
                  </Link>
                </div>
              </div>

              <div className="relative">
                <DepositShield className="mx-auto h-72 w-72" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Plain English glossary
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              The words that always trip people up
            </h2>
            <p className="mt-3 text-stone-600 text-pretty">
              Tap a card to flip it. Eight definitions, zero legalese.
            </p>
          </div>
          <div className="mt-12">
            <GlossaryChips />
          </div>
        </div>
      </section>

      {/* FAQ + AskBox */}
      <section className="border-t border-stone-100 bg-stone-50/60 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
            <p className="mt-3 text-stone-600">
              If something&apos;s still unclear, just{" "}
              <Link
                href="/contact"
                className="font-medium text-emerald-700 underline"
              >
                drop us a note
              </Link>
              .
            </p>
          </div>

          <div className="mt-10">
            <FaqAccordion />
          </div>

          <div className="mt-10">
            <AskBox
              title="Question we missed?"
              subtitle="Drop it here and a real human (not a bot) will get back to you within the hour."
              placeholder="What's on your mind?"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stone-100">
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div className="absolute -top-32 left-1/2 -z-10 h-96 w-[200%] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-100 via-emerald-100 to-stone-100 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-20 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Copy + search */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-800 animate-fade-in">
              <span className="grid h-1.5 w-1.5 place-items-center">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              </span>
              Live now in Lagos, Abuja, Port Harcourt &amp; Ibadan
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl animate-fade-up text-balance">
              Find a home you actually{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent">
                want to live in.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-stone-600 animate-fade-up stagger-1 text-pretty">
              Verified Nigerian properties. Reserve online with a deposit,
              finish offline with confidence. Real agents, real listings, real
              receipts.
            </p>

            <p className="mt-3 text-base text-stone-500 animate-fade-up stagger-2">
              <span className="font-medium text-stone-700">Concierge: </span>
              <RotatingPrompt
                prompts={HERO_PROMPTS}
                className="text-emerald-700"
              />
            </p>

            <div className="mt-6 animate-fade-up stagger-3">
              <HeroSearch />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-500 animate-fade-up stagger-4">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                No sign-up to browse
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                Refundable deposits
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                Agents KYC-checked
              </span>
            </div>
          </div>

          {/* Right: Nigeria map */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-amber-100 via-stone-50 to-emerald-100 blur-3xl" />
            <NigeriaMap showLabels />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs shadow-lg">
              <p className="font-semibold text-emerald-700">3 new today</p>
              <p className="text-stone-500">Lekki Phase 1</p>
            </div>
            <div className="absolute -bottom-3 left-2 -rotate-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs shadow-lg">
              <p className="font-semibold text-amber-700">Sold yesterday</p>
              <p className="text-stone-500">Maitama, Abuja</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({
  totalListings,
  totalAgents,
  totalCities,
}: {
  totalListings: number;
  totalAgents: number;
  totalCities: number;
}) {
  return (
    <section className="border-b border-stone-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBadge
            icon={<Building2 className="h-4 w-4" />}
            label="Active listings"
            value={<AnimatedCounter to={Math.max(totalListings, 1)} />}
            sub={STAT_SUBS.listings}
            tone="emerald"
          />
          <StatBadge
            icon={<Users className="h-4 w-4" />}
            label="Verified agents"
            value={<AnimatedCounter to={Math.max(totalAgents, 1)} />}
            sub={STAT_SUBS.agents}
            tone="amber"
          />
          <StatBadge
            icon={<Sparkles className="h-4 w-4" />}
            label="Cities live"
            value={<AnimatedCounter to={Math.max(totalCities, 4)} />}
            sub={STAT_SUBS.cities}
            tone="stone"
          />
          <StatBadge
            icon={<Receipt className="h-4 w-4" />}
            label="Avg. response"
            value={
              <>
                <AnimatedCounter to={42} /> min
              </>
            }
            sub={STAT_SUBS.response}
            tone="stone"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-stone-900">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-emerald-100/80">{label}</p>
    </div>
  );
}
