import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.agentProfile.findUnique({
    where: { slug },
    select: { businessName: true, bio: true },
  });
  if (!profile) return { title: "Agent not found" };
  return {
    title: `${profile.businessName} — Verified agent on Realestate`,
    description: profile.bio?.slice(0, 160),
  };
}

export const dynamic = "force-dynamic";

const STARTERS = [
  "Are any of your listings flexible on viewing this weekend?",
  "I'm looking in a specific area — can you keep me in the loop?",
  "What does the deposit-to-close timeline usually look like with you?",
  "Do you handle off-plan or only completed properties?",
];

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.agentProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          createdAt: true,
          ownedListings: {
            where: { status: { in: ["PUBLISHED", "RESERVED", "SOLD"] } },
            include: {
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
            orderBy: { publishedAt: "desc" },
          },
        },
      },
    },
  });
  if (!profile || profile.status !== "APPROVED") notFound();

  const listings = profile.user.ownedListings;
  const live = listings.filter((l) => l.status === "PUBLISHED");
  const reserved = listings.filter((l) => l.status === "RESERVED");
  const sold = listings.filter((l) => l.status === "SOLD");
  const cities = [...new Set(listings.map((l) => l.city))];

  return (
    <main className="flex-1">
      {/* Hero band */}
      <section className="relative overflow-hidden border-b border-stone-100">
        <div className="h-40 bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900">
          <div className="absolute inset-0 bg-noise opacity-40" />
          <div className="absolute right-0 top-0 h-72 w-72 -translate-y-12 translate-x-12 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 translate-y-12 -translate-x-12 rounded-full bg-amber-400/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/agents"
            className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-3 w-3" />
            All agents
          </Link>

          <div className="-mt-20 pb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <div className="grid h-28 w-28 place-items-center rounded-3xl border-4 border-white bg-gradient-to-br from-emerald-600 to-emerald-800 text-3xl font-semibold text-white shadow-lg">
                  {profile.businessName
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {profile.businessName}
                    </h1>
                    <Badge variant="success">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    Run by {profile.user.fullName}
                  </p>
                  {profile.cacNumber && (
                    <p className="mt-1 text-xs text-stone-500">
                      CAC #{profile.cacNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/login?next=/account/messages"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  <MessageCircle className="h-4 w-4" />
                  Start a conversation
                </Link>
                <Link
                  href={`/listings?agent=${profile.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  See all listings
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatBadge
                icon={<Home className="h-4 w-4" />}
                label="Live listings"
                value={live.length}
                tone="emerald"
              />
              <StatBadge
                icon={<TrendingUp className="h-4 w-4" />}
                label="Reserved"
                value={reserved.length}
                tone="amber"
              />
              <StatBadge
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Sold"
                value={sold.length}
                tone="stone"
              />
              <StatBadge
                icon={<CalendarDays className="h-4 w-4" />}
                label="On Realestate since"
                value={new Date(profile.createdAt).getFullYear()}
                tone="stone"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              {profile.bio && (
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    In their words
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-stone-700 text-pretty">
                    {profile.bio}
                  </p>
                </div>
              )}

              {cities.length > 0 && (
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Cities served
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm"
                      >
                        <MapPin className="h-3 w-3 text-emerald-700" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold tracking-tight">
                {live.length > 0
                  ? "Current listings"
                  : "No current listings"}
              </h2>
              {live.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {live.map((l) => (
                    <ListingCard
                      key={l.id}
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
                    />
                  ))}
                </div>
              ) : (
                <Callout tone="info" className="mt-4">
                  Nothing live right now. Drop a message — most agents have
                  off-market options they only share in conversation.
                </Callout>
              )}

              {sold.length > 0 && (
                <>
                  <h2 className="mt-14 text-2xl font-bold tracking-tight">
                    Recently sold
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Proof of work — every sale closed through Realestate.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {sold.slice(0, 4).map((l) => (
                      <ListingCard
                        key={l.id}
                        slug={l.slug}
                        title={l.title}
                        city={l.city}
                        state={l.state}
                        priceNgn={l.priceNgn.toString()}
                        bedrooms={l.bedrooms}
                        bathrooms={l.bathrooms}
                        areaSqm={l.areaSqm ? Number(l.areaSqm) : null}
                        propertyType={l.propertyType}
                        status={l.status}
                        imageUrl={l.images[0]?.url ?? null}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Conversation starters sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-stone-900">
                    Conversation starters
                  </h3>
                </div>
                <p className="mt-1 text-xs text-stone-500 text-pretty">
                  Tap one to open a message with this agent — pre-filled with
                  context.
                </p>
                <div className="mt-4 space-y-2">
                  {STARTERS.map((s, i) => (
                    <Link
                      key={i}
                      href={`/login?next=${encodeURIComponent(
                        `/account/messages?prefill=${encodeURIComponent(s)}&agent=${profile.slug}`,
                      )}`}
                      className="block rounded-2xl border border-stone-200 px-3 py-2 text-left text-xs text-stone-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-800"
                    >
                      &ldquo;{s}&rdquo;
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <SpeechBubble
                  from="concierge"
                  avatar="·"
                  author="Concierge"
                  role="Realestate"
                >
                  Want a viewing this weekend? Open a thread and we&apos;ll
                  loop in {profile.user.fullName.split(" ")[0]} for you.
                </SpeechBubble>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                <Star className="h-3 w-3 fill-current" />
                Verified · KYC + bank match
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
