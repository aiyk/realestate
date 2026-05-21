import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  CalendarDays,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Square,
  Wallet,
  Wifi,
  Snowflake,
  Car,
  Trees,
  Building2,
  Droplet,
  Zap,
  Lock,
  Waves,
  Dumbbell,
  Sparkles,
  Phone,
  KeyRound,
  HandCoins,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatNgn } from "@/lib/utils";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingViewTracker } from "@/components/listings/listing-view-tracker";
import { ListingMediaExtras } from "@/components/listings/listing-media-extras";
import { ListingCard } from "@/components/listings/listing-card";
import { Callout } from "@/components/ui/callout";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StatBadge } from "@/components/ui/stat-badge";
import { DepositShield } from "@/components/illustrations/deposit-shield";
import { NUDGES, statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: { title: true, city: true, state: true, description: true },
  });
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.title} — ${listing.city}, ${listing.state}`,
    description: listing.description.slice(0, 160),
  };
}

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  internet: Wifi,
  ac: Snowflake,
  "air conditioning": Snowflake,
  parking: Car,
  garage: Car,
  garden: Trees,
  trees: Trees,
  generator: Zap,
  electricity: Zap,
  borehole: Droplet,
  water: Droplet,
  security: Lock,
  gated: Lock,
  cctv: Lock,
  pool: Waves,
  "swimming pool": Waves,
  gym: Dumbbell,
  lift: Building2,
  elevator: Building2,
};

function amenityIcon(name: string) {
  const key = name.toLowerCase().trim();
  for (const k of Object.keys(AMENITY_ICONS)) {
    if (key.includes(k)) return AMENITY_ICONS[k];
  }
  return CheckCircle2;
}

const NEXT_STEPS = [
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "You reserve",
    body: "Tap the button, pay the 5% deposit. Paystack holds it.",
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "Agent reaches out",
    body: "Usually under 30 minutes. You get the exact location pin.",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Viewing & paperwork",
    body: "Inspection, due diligence, contracts. We can sit in if you want.",
  },
  {
    icon: <HandCoins className="h-5 w-5" />,
    title: "Balance & close",
    body: "Pay the remainder direct to the seller. Sale marked complete here.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Keys in hand",
    body: "Move-in day. We email you the receipts so you have a paper trail.",
  },
];

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: {
        select: {
          id: true,
          fullName: true,
          createdAt: true,
          agentProfile: {
            select: {
              slug: true,
              businessName: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  if (
    !listing ||
    ["DRAFT", "PENDING_REVIEW", "REJECTED", "ARCHIVED"].includes(listing.status)
  ) {
    notFound();
  }

  const user = await getSessionUser();
  const canReserve = listing.status === "PUBLISHED";
  const reserveHref = user
    ? `/checkout/${listing.id}`
    : `/login?next=${encodeURIComponent(`/checkout/${listing.id}`)}`;
  const messageHref = user
    ? `/account/messages?listing=${listing.id}`
    : `/login?next=${encodeURIComponent(`/listings/${slug}`)}`;

  // Agent stats — best-effort, no fake numbers
  let agentStats:
    | { listings: number; sold: number; cities: number }
    | null = null;
  if (listing.agent?.id) {
    const [agentListingsLive, agentListingsSold, cities] = await Promise.all([
      prisma.listing.count({
        where: { agentId: listing.agent.id, status: "PUBLISHED" },
      }),
      prisma.listing.count({
        where: { agentId: listing.agent.id, status: "SOLD" },
      }),
      prisma.listing
        .findMany({
          where: { agentId: listing.agent.id },
          distinct: ["city"],
          select: { city: true },
        })
        .then((r) => r.length),
    ]);
    agentStats = { listings: agentListingsLive, sold: agentListingsSold, cities };
  }

  const similar = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: listing.id },
      OR: [{ city: listing.city }, { propertyType: listing.propertyType }],
    },
    take: 6,
    orderBy: { publishedAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  const openHouses = await prisma.openHouse.findMany({
    where: {
      listingId: listing.id,
      cancelledAt: null,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
  });

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-6">
      <ListingViewTracker listingId={listing.id} />
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to listings
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">
              <Sparkles className="h-3 w-3" />
              {listing.propertyType.toLowerCase()}
            </Badge>
            {listing.status === "RESERVED" && (
              <Badge variant="warning">Reserved</Badge>
            )}
            {listing.status === "SOLD" && (
              <Badge variant="secondary">Sold</Badge>
            )}
            <Badge variant="glow">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <MapPin className="h-3 w-3" />
              {listing.city}, {listing.state}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl text-balance">
            {listing.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:text-rose-500"
            aria-label="Save listing"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:text-emerald-700"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ListingGallery
        images={listing.images.map((i) => ({
          id: i.id,
          url: i.url,
          altText: i.altText,
        }))}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-4">
            <StatItem
              icon={<Bed className="h-4 w-4" />}
              value={listing.bedrooms ?? "—"}
              label="Bedrooms"
            />
            <StatItem
              icon={<Bath className="h-4 w-4" />}
              value={listing.bathrooms ?? "—"}
              label="Bathrooms"
            />
            <StatItem
              icon={<Square className="h-4 w-4" />}
              value={
                listing.areaSqm ? `${Number(listing.areaSqm)}` : "—"
              }
              label="sqm"
            />
            <StatItem
              icon={<CalendarDays className="h-4 w-4" />}
              value={
                listing.publishedAt
                  ? new Date(listing.publishedAt).toLocaleDateString("en-NG", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
              label="Listed"
            />
          </div>

          {/* Status note */}
          {listing.status !== "PUBLISHED" && (
            <Callout
              tone={listing.status === "SOLD" ? "info" : "warn"}
              className="mt-6"
              title={
                listing.status === "RESERVED"
                  ? "Currently reserved"
                  : "This one's gone"
              }
            >
              {statusBlurb(listing.status)}
            </Callout>
          )}

          <Section title="About this property">
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700 text-pretty">
              {listing.description}
            </p>
          </Section>

          {(listing.videoUrl ||
            listing.virtualTourUrl ||
            listing.youtubeEmbedId ||
            openHouses.length > 0) && (
            <Section title="See more">
              <ListingMediaExtras
                listingId={listing.id}
                videoUrl={listing.videoUrl}
                virtualTourUrl={listing.virtualTourUrl}
                youtubeEmbedId={listing.youtubeEmbedId}
                openHouses={openHouses.map((o) => ({
                  startsAt: o.startsAt.toISOString(),
                  endsAt: o.endsAt.toISOString(),
                  capacity: o.capacity,
                  notes: o.notes,
                }))}
              />
            </Section>
          )}

          {listing.amenities.length > 0 && (
            <Section title="What's inside & out">
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <li
                      key={a}
                      className="inline-flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-100"
                    >
                      <Icon className="h-4 w-4 text-emerald-600" />
                      <span className="capitalize">{a}</span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          <Section title="What happens next">
            <p className="text-sm text-stone-600 text-pretty">
              From the moment you tap <strong>Reserve</strong> to the day you
              get the keys — here&apos;s the whole ride.
            </p>
            <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {NEXT_STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="relative rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <span className="absolute right-3 top-2 text-3xl font-bold text-stone-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    {s.icon}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-stone-900">
                    {s.title}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Where it is">
            <p className="text-sm text-stone-700">
              {listing.addressLine}
              <br />
              {listing.city}, {listing.state}, {listing.country}
            </p>
            <div className="mt-4 grid aspect-[16/8] place-items-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-gradient-to-br from-stone-50 via-emerald-50/40 to-amber-50/40 text-sm text-stone-500">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-emerald-700" />
                <p className="mt-2 font-semibold text-stone-700">
                  Exact location shared after deposit
                </p>
                <p className="mt-1 max-w-xs text-xs text-stone-500 text-pretty">
                  {NUDGES.exactLocation}
                </p>
              </div>
            </div>
          </Section>

          <Section title="Listed by">
            <AgentCard
              listingAgent={listing.agent}
              stats={agentStats}
              messageHref={messageHref}
            />
          </Section>
        </div>

        {/* Sticky reserve sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
            {/* Top concierge band */}
            <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900 px-6 pt-5 pb-6 text-white">
              <SpeechBubble
                from="concierge"
                avatar="·"
                author="Concierge"
                className="!text-stone-900"
              >
                {NUDGES.reserveHeld}
              </SpeechBubble>
            </div>

            <div className="p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-stone-900">
                  {formatNgn(listing.priceNgn.toString())}
                </p>
                {listing.status === "PUBLISHED" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Available
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Asking price · room for conversation
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                    <Wallet className="h-3.5 w-3.5" />
                    Reserve with
                  </div>
                  <p className="mt-1 text-2xl font-bold text-stone-900">
                    {formatNgn(listing.depositNgn.toString())}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    Held by Paystack until close.
                  </p>
                </div>
                <DepositShield className="hidden h-20 w-20 sm:block" />
              </div>

              <div className="mt-5 space-y-2">
                {canReserve ? (
                  <Link
                    href={reserveHref}
                    className={cn(buttonVariants({ size: "lg" }), "w-full")}
                  >
                    Reserve now
                  </Link>
                ) : listing.status === "RESERVED" ? (
                  <Callout tone="warn">
                    Currently reserved — pop back if the deal doesn&apos;t
                    close.
                  </Callout>
                ) : (
                  <Callout tone="info">
                    Sold. Browse similar listings below.
                  </Callout>
                )}
                <Link
                  href={messageHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full",
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message the agent
                </Link>
              </div>

              <ul className="mt-5 space-y-2 border-t border-stone-100 pt-5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  {NUDGES.escrow}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  {NUDGES.refundable}
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  {NUDGES.whatsAppNo}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20 border-t border-stone-100 pt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                You might also like
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Listings like this one
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Same city or same property type — sorted by newest.
              </p>
            </div>
            <Link
              href="/listings"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              See all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.slice(0, 3).map((l) => (
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
        </section>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-stone-100 pt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-stone-900">{value}</p>
        <p className="text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

type Agent = {
  id: string;
  fullName: string;
  createdAt: Date;
  agentProfile: {
    slug: string;
    businessName: string;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
} | null;

function AgentCard({
  listingAgent,
  stats,
  messageHref,
}: {
  listingAgent: Agent;
  stats: { listings: number; sold: number; cities: number } | null;
  messageHref: string;
}) {
  const name =
    listingAgent?.agentProfile?.businessName ??
    listingAgent?.fullName ??
    "Platform admin";
  const slug = listingAgent?.agentProfile?.slug;
  const since = listingAgent?.createdAt
    ? new Date(listingAgent.createdAt).getFullYear()
    : null;
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
      <div className="bg-gradient-to-br from-stone-50 to-amber-50/40 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-lg font-semibold text-white shadow-md">
            {name
              .split(/\s+/)
              .filter(Boolean)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900">{name}</p>
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            {since && (
              <p className="text-xs text-stone-500">
                On Realestate since {since}
              </p>
            )}
            {listingAgent?.agentProfile?.bio && (
              <p className="mt-2 text-sm text-stone-700 text-pretty">
                {listingAgent.agentProfile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-px bg-stone-100">
          <StatBadge
            label="Listings live"
            value={stats.listings}
            tone="stone"
            className="!rounded-none !ring-0"
          />
          <StatBadge
            label="Sold"
            value={stats.sold}
            tone="emerald"
            className="!rounded-none !ring-0"
          />
          <StatBadge
            label="Cities"
            value={stats.cities}
            tone="amber"
            className="!rounded-none !ring-0"
          />
        </div>
      )}

      <div className="space-y-2 p-5">
        <Link
          href={messageHref}
          className={cn(buttonVariants({ size: "sm" }), "w-full")}
        >
          <MessageCircle className="h-4 w-4" />
          Start a conversation
        </Link>
        {slug && (
          <Link
            href={`/agents/${slug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
          >
            View agent profile
          </Link>
        )}
      </div>
    </div>
  );
}
