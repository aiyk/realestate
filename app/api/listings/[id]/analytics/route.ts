import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireListingOwnership(id);

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [listing, recentEvents, inquiryCount, reservationCount, viewersCount] =
      await Promise.all([
        prisma.listing.findUnique({
          where: { id },
          select: {
            title: true,
            slug: true,
            status: true,
            publishedAt: true,
            viewCount: true,
            inquiryCount: true,
            lastViewedAt: true,
          },
        }),
        prisma.listingAnalyticsEvent.findMany({
          where: {
            listingId: id,
            kind: "LISTING_VIEW",
            createdAt: { gte: fourteenDaysAgo },
          },
          select: { createdAt: true, visitorHash: true },
        }),
        prisma.contactInquiry.count({ where: { listingId: id } }),
        prisma.reservation.count({ where: { listingId: id } }),
        prisma.listingAnalyticsEvent.findMany({
          where: {
            listingId: id,
            kind: "LISTING_VIEW",
            createdAt: { gte: fourteenDaysAgo },
          },
          select: { visitorHash: true },
          distinct: ["visitorHash"],
        }),
      ]);

    if (!listing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }

    const buckets = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      buckets.set(dayKey(d), 0);
    }
    let viewsThisWeek = 0;
    for (const e of recentEvents) {
      const key = dayKey(e.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
      if (e.createdAt >= sevenDaysAgo) viewsThisWeek += 1;
    }
    const timeline = Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    const daysOnMarket = listing.publishedAt
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - listing.publishedAt.getTime()) / 86400000,
          ),
        )
      : null;

    const conversionRate =
      listing.viewCount > 0
        ? Math.round((reservationCount / listing.viewCount) * 1000) / 10
        : 0;

    return Response.json({
      summary: {
        title: listing.title,
        slug: listing.slug,
        status: listing.status,
        views: listing.viewCount,
        viewsThisWeek,
        uniqueViewers: viewersCount.length,
        inquiries: Math.max(listing.inquiryCount, inquiryCount),
        reservations: reservationCount,
        conversionRate,
        daysOnMarket,
        lastViewedAt: listing.lastViewedAt,
      },
      timeline,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
