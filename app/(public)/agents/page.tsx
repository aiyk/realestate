import Link from "next/link";
import { MapPin, ShieldCheck, Users, ArrowUpDown } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { StatBadge } from "@/components/ui/stat-badge";
import { AgentSearchBar } from "@/components/agent/agent-search-bar";
import { AgentFilterRail } from "@/components/agent/agent-filter-rail";
import { AgentActiveFilters } from "@/components/agent/agent-active-filters";
import { DirectoryPagination } from "@/components/agent/directory-pagination";
import { AgentDirectoryCard } from "@/components/agent/agent-directory-card";
import { agentDirectoryFilterSchema } from "@/lib/schemas/agent";
import { cn } from "@/lib/utils";
import { emptyState } from "@/lib/voice";

export const metadata = {
  title: "Agents — Realestate",
  description:
    "Search verified Nigerian real estate agents by city, specialty, and rating. KYC + bank-name verified.",
  alternates: { canonical: "/agents" },
};
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "recent", label: "Recently joined" },
  { value: "mostListings", label: "Most listings" },
  { value: "mostSold", label: "Most sold" },
  { value: "rating", label: "Highest rated" },
  { value: "alpha", label: "Alphabetical" },
];

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = agentDirectoryFilterSchema.safeParse(sp);
  if (!parsed.success) {
    return (
      <main className="flex-1 px-6 py-16">
        <p className="text-sm text-red-700">Invalid filter parameters.</p>
      </main>
    );
  }
  const f = parsed.data;

  const where: Prisma.AgentProfileWhereInput = {
    status: "APPROVED",
    ...(f.q && {
      OR: [
        { businessName: { contains: f.q, mode: "insensitive" } },
        { tagline: { contains: f.q, mode: "insensitive" } },
        { user: { fullName: { contains: f.q, mode: "insensitive" } } },
      ],
    }),
    ...(f.city && f.city.length > 0 && {
      serviceAreas: { some: { city: { in: f.city } } },
    }),
    ...(f.state && f.state.length > 0 && {
      serviceAreas: { some: { state: { in: f.state } } },
    }),
    ...(f.type && f.type.length > 0 && {
      specialties: { some: { propertyType: { in: f.type } } },
    }),
    ...(f.tier === "top" && { performanceTier: "TOP_PERFORMER" }),
    ...(f.tier === "rising" && { performanceTier: "RISING_STAR" }),
  };

  const orderBy: Prisma.AgentProfileOrderByWithRelationInput[] =
    f.sort === "mostListings"
      ? [{ listingCountCache: "desc" }, { approvedAt: "desc" }]
      : f.sort === "mostSold"
        ? [{ soldCountCache: "desc" }, { approvedAt: "desc" }]
        : f.sort === "alpha"
          ? [{ businessName: "asc" }]
          : f.sort === "rating"
            ? [{ ratingAvg: "desc" }, { ratingCount: "desc" }]
            : [{ approvedAt: "desc" }];

  const skip = (f.page - 1) * f.perPage;

  const [agents, total, totalApproved, [stateFacets, cityFacets, typeFacets]] =
    await Promise.all([
      prisma.agentProfile.findMany({
        where,
        orderBy,
        skip,
        take: f.perPage,
        include: {
          user: { select: { fullName: true, createdAt: true } },
          serviceAreas: {
            orderBy: [{ isPrimary: "desc" }, { state: "asc" }],
            take: 3,
          },
        },
      }),
      prisma.agentProfile.count({ where }),
      prisma.agentProfile.count({ where: { status: "APPROVED" } }),
      Promise.all([
        prisma.agentServiceArea.groupBy({
          by: ["state"],
          where: { agent: { status: "APPROVED" } },
          _count: { _all: true },
          orderBy: { _count: { state: "desc" } },
          take: 12,
        }),
        prisma.agentServiceArea.groupBy({
          by: ["city"],
          where: { agent: { status: "APPROVED" } },
          _count: { _all: true },
          orderBy: { _count: { city: "desc" } },
          take: 16,
        }),
        prisma.agentSpecialty.groupBy({
          by: ["propertyType"],
          where: { agent: { status: "APPROVED" } },
          _count: { _all: true },
          orderBy: { _count: { propertyType: "desc" } },
        }),
      ]),
    ]);

  const totalLive = agents.reduce((acc, a) => acc + a.listingCountCache, 0);
  const totalSold = agents.reduce((acc, a) => acc + a.soldCountCache, 0);
  const totalCities = cityFacets.length;
  const empty = emptyState("agents");
  const pages = Math.max(1, Math.ceil(total / f.perPage));

  const cityOptions = cityFacets.map((r) => ({
    value: r.city,
    label: r.city,
    count: r._count._all,
  }));
  const stateOptions = stateFacets.map((r) => ({
    value: r.state,
    label: r.state,
    count: r._count._all,
  }));
  const typeOptions = typeFacets.map((r) => ({
    value: r.propertyType,
    label: r.propertyType.charAt(0) + r.propertyType.slice(1).toLowerCase(),
    count: r._count._all,
  }));

  function sortHref(value: string): string {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page" || k === "sort") continue;
      if (Array.isArray(v)) for (const x of v) next.append(k, x);
      else if (typeof v === "string" && v) next.set(k, v);
    }
    if (value !== "recent") next.set("sort", value);
    return `/agents?${next.toString()}`;
  }

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-stone-100 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white py-16">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Verified network
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            Find the right agent
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-600 text-pretty">
            Every agent here passed KYC and bank-account verification before
            they could list. Filter by city, property type, and rating to find
            who fits your search.
          </p>
        </div>

        {totalApproved > 0 && (
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 px-6 sm:grid-cols-4">
            <StatBadge
              icon={<Users className="h-4 w-4" />}
              label="Agents"
              value={totalApproved}
              tone="emerald"
            />
            <StatBadge label="Live listings" value={totalLive} tone="amber" />
            <StatBadge label="Sold" value={totalSold} tone="stone" />
            <StatBadge
              icon={<MapPin className="h-4 w-4" />}
              label="Cities"
              value={totalCities}
              tone="stone"
            />
          </div>
        )}
        <div className="mx-auto mt-8 max-w-2xl px-6">
          <AgentSearchBar />
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <div>
              <AgentFilterRail
                searchParams={sp}
                cities={cityOptions}
                states={stateOptions}
                propertyTypes={typeOptions}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <span>
                    <strong className="text-stone-900">{total}</strong> agent
                    {total === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ArrowUpDown className="h-3 w-3 text-stone-500" />
                  <span className="text-stone-500">Sort:</span>
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={sortHref(opt.value)}
                      className={cn(
                        "rounded-full px-3 py-1 ring-1",
                        f.sort === opt.value
                          ? "bg-stone-900 text-white ring-stone-900"
                          : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
                      )}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <AgentActiveFilters searchParams={sp} />
              </div>

              {total === 0 ? (
                <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
                  <ShieldCheck className="mx-auto h-10 w-10 text-emerald-700" />
                  <p className="mt-4 text-lg font-semibold text-stone-700">
                    {empty.headline}
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 text-pretty">
                    {empty.body}
                  </p>
                  <Link
                    href="/agents"
                    className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
                  >
                    Clear filters
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {agents.map((a) => (
                    <AgentDirectoryCard
                      key={a.id}
                      slug={a.slug}
                      businessName={a.businessName}
                      fullName={a.user.fullName}
                      tagline={a.tagline}
                      bio={a.bio}
                      avatarUrl={a.avatarUrl}
                      coverPhotoUrl={a.coverPhotoUrl}
                      liveCount={a.listingCountCache}
                      soldCount={a.soldCountCache}
                      ratingAvg={a.ratingAvg ? Number(a.ratingAvg) : null}
                      ratingCount={a.ratingCount}
                      cities={a.serviceAreas.map((s) => s.city)}
                      performanceTier={
                        (a.performanceTier as "TOP_PERFORMER" | "RISING_STAR" | null) ??
                        null
                      }
                      yearJoined={new Date(a.user.createdAt).getFullYear()}
                    />
                  ))}
                </div>
              )}

              <DirectoryPagination
                page={f.page}
                pages={pages}
                searchParams={sp}
              />
            </div>
          </div>

          <Callout tone="concierge" title="Want to join?" className="mt-16">
            We onboard a fresh batch every Friday. If you can pass KYC + match
            your bank-account name, you can start listing the same week.{" "}
            <Link
              href="/agent/apply"
              className="font-medium text-emerald-700 underline"
            >
              Apply to list
            </Link>
            .
          </Callout>
        </div>
      </section>
    </main>
  );
}
