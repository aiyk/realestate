import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye, MessageCircle, Calendar, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ListingAnalyticsPage({ params }: Params) {
  const { id } = await params;
  const u = await getSessionUser();
  if (!u) redirect("/login");

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
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [events, uniqueViewers, inquiries, reservations] = await Promise.all([
    prisma.listingAnalyticsEvent.findMany({
      where: {
        listingId: id,
        kind: "LISTING_VIEW",
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { createdAt: true },
    }),
    prisma.listingAnalyticsEvent.findMany({
      where: {
        listingId: id,
        kind: "LISTING_VIEW",
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { visitorHash: true },
      distinct: ["visitorHash"],
    }),
    prisma.contactInquiry.count({ where: { listingId: id } }),
    prisma.reservation.count({ where: { listingId: id } }),
  ]);

  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    buckets.set(dayKey(d), 0);
  }
  let viewsThisWeek = 0;
  for (const e of events) {
    const k = dayKey(e.createdAt);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    if (e.createdAt >= sevenDaysAgo) viewsThisWeek += 1;
  }
  const timeline = Array.from(buckets.entries());
  const maxBar = Math.max(1, ...timeline.map(([, n]) => n));

  const daysOnMarket = listing.publishedAt
    ? Math.max(0, Math.floor((now.getTime() - listing.publishedAt.getTime()) / 86400000))
    : null;
  const conversionRate =
    listing.viewCount > 0
      ? Math.round((reservations / listing.viewCount) * 1000) / 10
      : 0;

  return (
    <section>
      <Link
        href={`/agent/listings/${id}/edit`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-3 w-3" /> Back to listing
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {listing.title}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Performance over the last 14 days
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
          label="Unique viewers (14d)"
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

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-stone-900">14-day views</p>
        <div className="mt-4 flex items-end gap-1.5">
          {timeline.map(([date, count]) => (
            <div
              key={date}
              className="group flex flex-1 flex-col items-center"
              title={`${date}: ${count} view${count === 1 ? "" : "s"}`}
            >
              <div
                className="w-full rounded-t bg-emerald-700 transition group-hover:bg-emerald-800"
                style={{ height: `${(count / maxBar) * 120 + 4}px` }}
              />
              <span className="mt-1 text-[10px] text-stone-400">
                {date.slice(8)}
              </span>
            </div>
          ))}
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
