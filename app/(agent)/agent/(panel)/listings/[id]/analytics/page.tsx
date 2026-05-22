import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Eye, MessageCircle, Calendar, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";
import { Sparkline } from "@/components/ui/sparkline";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
type SearchParams = Promise<{ range?: string }>;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const RANGES = [
  { value: "14", label: "14d", days: 14 },
  { value: "28", label: "4w", days: 28 },
  { value: "84", label: "12w", days: 84 },
] as const;

export default async function ListingAnalyticsPage({
  params,
  searchParams,
}: Params & { searchParams: SearchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const u = await getSessionUser();
  if (!u) redirect("/login");

  const range = RANGES.find((r) => r.value === sp.range) ?? RANGES[0];
  const rangeDays = range.days;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      slug: true,
      status: true,
      agentId: true,
      publishedAt: true,
      viewCount: true,
      lastViewedAt: true,
      inquiryCount: true,
    },
  });
  if (!listing) notFound();
  if (listing.agentId !== u.id && u.role !== "ADMIN") {
    redirect("/agent/listings");
  }

  const now = new Date();
  const rangeStart = new Date(now.getTime() - rangeDays * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [events, uniqueViewers, inquiries, reservations] = await Promise.all([
    prisma.listingAnalyticsEvent.findMany({
      where: {
        listingId: id,
        kind: "LISTING_VIEW",
        createdAt: { gte: rangeStart },
      },
      select: { createdAt: true },
    }),
    prisma.listingAnalyticsEvent.findMany({
      where: {
        listingId: id,
        kind: "LISTING_VIEW",
        createdAt: { gte: rangeStart },
      },
      select: { visitorHash: true },
      distinct: ["visitorHash"],
    }),
    prisma.contactInquiry.count({ where: { listingId: id } }),
    prisma.reservation.count({ where: { listingId: id } }),
  ]);

  // Bucket either by day (<=28d) or by week (>28d)
  const useWeeks = rangeDays > 28;
  const buckets = new Map<string, number>();
  const labels: string[] = [];
  if (useWeeks) {
    const weeks = Math.ceil(rangeDays / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 86400000);
      const k = `W${dayKey(d)}`;
      buckets.set(k, 0);
      labels.push(
        d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      );
    }
    for (const e of events) {
      const diff = Math.floor((now.getTime() - e.createdAt.getTime()) / 86400000);
      const weekIdx = Math.floor(diff / 7);
      if (weekIdx >= weeks) continue;
      const d = new Date(now.getTime() - weekIdx * 7 * 86400000);
      const k = `W${dayKey(d)}`;
      buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
  } else {
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      buckets.set(dayKey(d), 0);
      labels.push(String(d.getDate()));
    }
    for (const e of events) {
      const k = dayKey(e.createdAt);
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
  }

  let viewsThisWeek = 0;
  for (const e of events) {
    if (e.createdAt >= sevenDaysAgo) viewsThisWeek += 1;
  }

  const timeline = Array.from(buckets.entries()).map(([k, v], i) => ({
    label: labels[i],
    value: v,
    key: k,
  }));

  const daysOnMarket = listing.publishedAt
    ? Math.max(0, Math.floor((now.getTime() - listing.publishedAt.getTime()) / 86400000))
    : null;
  const conversionRate =
    listing.viewCount > 0
      ? Math.round((reservations / listing.viewCount) * 1000) / 10
      : 0;

  return (
    <section>
      <Breadcrumb
        items={[
          { label: "Listings", href: "/agent/listings" },
          { label: listing.title, href: `/agent/listings/${id}/edit` },
          { label: "Analytics" },
        ]}
      />
      <h1 className="t-h2 mt-3 text-balance">{listing.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Performance over the last {range.label === "14d" ? "14 days" : range.label === "4w" ? "4 weeks" : "12 weeks"}
        {daysOnMarket !== null ? ` · ${daysOnMarket} days on market` : ""}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBadge
          icon={<Eye className="h-4 w-4" />}
          label="Total views"
          value={listing.viewCount}
          tone="emerald"
        />
        <StatBadge
          icon={<TrendingUp className="h-4 w-4" />}
          label="Views this week"
          value={viewsThisWeek}
          tone="amber"
        />
        <StatBadge
          icon={<Eye className="h-4 w-4" />}
          label={`Unique viewers (${range.label})`}
          value={uniqueViewers.length}
          tone="stone"
        />
        <StatBadge
          icon={<MessageCircle className="h-4 w-4" />}
          label="Inquiries"
          value={Math.max(listing.inquiryCount, inquiries)}
          tone="stone"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatBadge
          icon={<Calendar className="h-4 w-4" />}
          label="Reservations"
          value={reservations}
          tone="emerald"
        />
        <StatBadge
          label="Conversion rate"
          value={`${conversionRate}%`}
          tone="amber"
        />
        <StatBadge
          label="Last viewed"
          value={
            listing.lastViewedAt
              ? listing.lastViewedAt.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                })
              : "—"
          }
          tone="stone"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Views over time
            </p>
            <p className="text-xs text-muted-foreground">
              Hover bars in supported browsers for daily counts.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Time range"
            className="inline-flex items-center rounded-full border border-border bg-surface-2 p-1 text-xs"
          >
            {RANGES.map((r) => (
              <Link
                key={r.value}
                href={`/agent/listings/${id}/analytics?range=${r.value}`}
                role="radio"
                aria-checked={range.value === r.value}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition-colors",
                  range.value === r.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 h-32 text-primary">
          <Sparkline
            data={timeline}
            height={120}
            showArea
            showAxis
            showDots={timeline.length <= 14}
            ariaLabel={`Views over the last ${range.label}`}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-text-subtle">
          <span>{timeline[0]?.label}</span>
          <span>{timeline[Math.floor(timeline.length / 2)]?.label}</span>
          <span>{timeline[timeline.length - 1]?.label}</span>
        </div>
      </div>

      {listing.viewCount === 0 && (
        <Callout tone="info" title="No views yet" className="mt-6">
          Once a buyer opens the listing page we&apos;ll start counting views
          here, including unique viewers.
        </Callout>
      )}
    </section>
  );
}
