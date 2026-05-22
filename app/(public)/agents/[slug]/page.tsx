import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { ListingCard } from "@/components/listings/listing-card";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";
import { AgentTierBadge } from "@/components/agent/agent-tier-badge";
import { AgentSocialRow } from "@/components/agent/agent-social-row";
import { AgentSpecialties } from "@/components/agent/agent-specialties";
import { AgentServiceArea } from "@/components/agent/agent-service-area";
import { AgentCredentials } from "@/components/agent/agent-credentials";
import { AgentFaqAccordion } from "@/components/agent/agent-faq-accordion";
import { AgentAnchorNav } from "@/components/agent/agent-anchor-nav";
import { AgentShareRow } from "@/components/agent/agent-share-row";
import { AgentJsonLd } from "@/components/agent/agent-jsonld";
import { AgentReviewsList } from "@/components/agent/agent-reviews-list";
import { ContactAgentDialog } from "@/components/agent/contact-agent-dialog";
import { ScheduleViewingDialog } from "@/components/agent/schedule-viewing-dialog";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.agentProfile.findUnique({
    where: { slug },
    select: {
      businessName: true,
      bio: true,
      tagline: true,
      coverPhotoUrl: true,
      avatarUrl: true,
      status: true,
    },
  });
  if (!profile || profile.status !== "APPROVED") {
    return { title: "Agent not found" };
  }
  const description =
    profile.tagline ?? profile.bio?.slice(0, 160) ?? `${profile.businessName} on Realestate`;
  const image = profile.coverPhotoUrl ?? profile.avatarUrl ?? undefined;
  return {
    title: `${profile.businessName} — Verified agent on Realestate`,
    description,
    alternates: { canonical: `/agents/${slug}` },
    openGraph: {
      title: profile.businessName,
      description,
      url: `/agents/${slug}`,
      type: "profile",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: profile.businessName,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

const STARTERS = [
  "Are any of your listings flexible on viewing this weekend?",
  "I'm looking in a specific area — can you keep me in the loop?",
  "What does the deposit-to-close timeline usually look like with you?",
];

function whatsappLink(num: string, message: string): string {
  const digits = num.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

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
      specialties: true,
      serviceAreas: { orderBy: [{ isPrimary: "desc" }, { state: "asc" }] },
      faqs: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!profile || profile.status !== "APPROVED") notFound();

  const listings = profile.user.ownedListings;
  const live = listings.filter((l) => l.status === "PUBLISHED");
  const reserved = listings.filter((l) => l.status === "RESERVED");
  const sold = listings.filter((l) => l.status === "SOLD");
  const responseTime = profile.responseTimeMinutes;
  const ratingAvg = profile.ratingAvg ? Number(profile.ratingAvg) : null;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://realestate.ng";

  const navItems = [
    { id: "about", label: "About" },
    { id: "listings", label: "Listings" },
    ...(sold.length > 0 ? [{ id: "sold", label: "Sold" }] : []),
    { id: "reviews", label: "Reviews" },
    ...(profile.faqs.length > 0 ? [{ id: "faq", label: "FAQ" }] : []),
  ];

  return (
    <main className="flex-1">
      <AgentJsonLd
        slug={slug}
        businessName={profile.businessName}
        fullName={profile.user.fullName}
        bio={profile.bio}
        tagline={profile.tagline}
        avatarUrl={profile.avatarUrl}
        coverPhotoUrl={profile.coverPhotoUrl}
        whatsappNumber={profile.whatsappNumber}
        websiteUrl={profile.websiteUrl}
        socials={[
          profile.twitterUrl,
          profile.linkedinUrl,
          profile.instagramUrl,
          profile.facebookUrl,
          profile.websiteUrl,
        ]}
        languages={profile.languages}
        serviceAreas={profile.serviceAreas.map((s) => ({
          city: s.city,
          state: s.state,
        }))}
        ratingAvg={ratingAvg}
        ratingCount={profile.ratingCount}
        baseUrl={baseUrl}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-48 sm:h-56">
          {profile.coverPhotoUrl ? (
            <>
              <Image
                src={profile.coverPhotoUrl}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            </>
          ) : (
            <div className="pointer-events-none h-full w-full bg-gradient-to-br from-primary via-primary-hover to-foreground">
              <div className="absolute inset-0 bg-noise opacity-40" />
              <div className="absolute right-0 top-0 h-72 w-72 -translate-y-12 translate-x-12 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-72 w-72 translate-y-12 -translate-x-12 rounded-full bg-accent/20 blur-3xl" />
            </div>
          )}
        </div>

        <div className="relative z-10 mx-auto max-w-[100rem] px-6">
          <div className="absolute left-6 top-6 inline-flex rounded-full bg-card/90 px-3 py-1.5 text-xs backdrop-blur">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Agents", href: "/agents" },
                { label: profile.businessName },
              ]}
            />
          </div>

          <div className="-mt-20 pb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <div className="inline-block rounded-full ring-4 ring-card">
                  <Avatar
                    src={profile.avatarUrl}
                    name={profile.businessName}
                    size="xl"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="t-h1">
                      {profile.businessName}
                    </h1>
                    <AgentTierBadge
                      tier={
                        (profile.performanceTier as
                          | "TOP_PERFORMER"
                          | "RISING_STAR"
                          | null) ?? null
                      }
                    />
                  </div>
                  {profile.tagline && (
                    <p className="mt-1 text-sm text-foreground text-pretty">
                      {profile.tagline}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Run by {profile.user.fullName}
                    {profile.cacNumber && ` · CAC #${profile.cacNumber}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
                <ContactAgentDialog
                  slug={profile.slug}
                  businessName={profile.businessName}
                />
                <ScheduleViewingDialog
                  slug={profile.slug}
                  businessName={profile.businessName}
                />
                {profile.whatsappNumber && (
                  <a
                    href={whatsappLink(
                      profile.whatsappNumber,
                      `Hi ${profile.businessName}, I found you on Realestate.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AgentSocialRow
                websiteUrl={profile.websiteUrl}
                twitterUrl={profile.twitterUrl}
                linkedinUrl={profile.linkedinUrl}
                instagramUrl={profile.instagramUrl}
                facebookUrl={profile.facebookUrl}
              />
              <AgentShareRow
                slug={profile.slug}
                businessName={profile.businessName}
              />
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
              {ratingAvg && profile.ratingCount > 0 ? (
                <StatBadge
                  icon={<Star className="h-4 w-4" />}
                  label={`${profile.ratingCount} review${profile.ratingCount === 1 ? "" : "s"}`}
                  value={`${ratingAvg.toFixed(1)}★`}
                  tone="amber"
                />
              ) : responseTime ? (
                <StatBadge
                  icon={<Clock className="h-4 w-4" />}
                  label="Avg reply"
                  value={
                    responseTime < 60
                      ? `${responseTime}m`
                      : `${Math.round(responseTime / 60)}h`
                  }
                  tone="stone"
                />
              ) : (
                <StatBadge
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Joined"
                  value={new Date(profile.createdAt).getFullYear()}
                  tone="stone"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <AgentAnchorNav items={navItems} />

      <section className="py-12">
        <div className="mx-auto max-w-[100rem] px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-12">
              <section id="about" className="scroll-mt-24 space-y-8">
                {profile.bio && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      About
                    </p>
                    <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-foreground text-pretty">
                      {profile.bio}
                    </p>
                  </div>
                )}
                <AgentCredentials
                  languages={profile.languages}
                  credentials={profile.credentials}
                  yearsOfExperience={profile.yearsOfExperience}
                />
                <AgentSpecialties
                  specialties={profile.specialties.map((s) => s.propertyType)}
                />
                <AgentServiceArea
                  areas={profile.serviceAreas.map((s) => ({
                    city: s.city,
                    state: s.state,
                    isPrimary: s.isPrimary,
                  }))}
                />
              </section>

              <section id="listings" className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight">
                  {live.length > 0 ? "Current listings" : "No current listings"}
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
              </section>

              {sold.length > 0 && (
                <section id="sold" className="scroll-mt-24">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Recently sold
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Proof of work — every sale closed through Realestate.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {sold.slice(0, 8).map((l) => (
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
                </section>
              )}

              <section id="reviews" className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
                {ratingAvg && profile.ratingCount > 0 ? (
                  <div className="mt-4">
                    <AgentReviewsList slug={slug} />
                  </div>
                ) : (
                  <Callout tone="info" className="mt-4">
                    No reviews yet. Buyers who close a deal can leave verified
                    feedback — only people who actually used this agent.
                  </Callout>
                )}
              </section>

              {profile.faqs.length > 0 && (
                <section id="faq" className="scroll-mt-24">
                  <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Common questions answered by {profile.user.fullName.split(" ")[0]}.
                  </p>
                  <div className="mt-4">
                    <AgentFaqAccordion
                      faqs={profile.faqs.map((f) => ({
                        question: f.question,
                        answer: f.answer,
                      }))}
                    />
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Conversation starters
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">
                  Tap one to open a message — no account needed.
                </p>
                <div className="mt-4 space-y-2">
                  {STARTERS.map((s) => (
                    <ContactAgentDialog
                      key={s}
                      slug={profile.slug}
                      businessName={profile.businessName}
                      trigger={
                        <span className="block w-full cursor-pointer rounded-2xl border border-border px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft/40 hover:text-primary-soft-foreground">
                          &ldquo;{s}&rdquo;
                        </span>
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-border bg-surface-2 p-6">
                <SpeechBubble
                  from="concierge"
                  avatar="·"
                  author="Concierge"
                  role="Realestate"
                >
                  Want a viewing this weekend? Tap{" "}
                  <strong>Schedule a viewing</strong> and we&apos;ll loop in{" "}
                  {profile.user.fullName.split(" ")[0]}.
                </SpeechBubble>
              </div>

              <Badge variant="success" className="mt-5">
                <CheckCircle2 className="h-3 w-3" />
                Verified · KYC + bank match
              </Badge>
              {profile.serviceAreas[0] && (
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Based in {profile.serviceAreas[0].city},{" "}
                  {profile.serviceAreas[0].state}
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
