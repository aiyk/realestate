import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";

const RESERVATION_LIMIT = 200;
const INQUIRY_LIMIT = 200;
const BUYER_LIMIT = 100;
const LISTING_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;
    const listingId = sp.get("listingId") ?? undefined;
    const q = (sp.get("q") ?? "").trim();

    // Bound every list — an active agent can accumulate thousands of
    // reservations and inquiries; we only need the most recent.
    const reservations = await prisma.reservation.findMany({
      where: {
        listing: { agentId: u.id },
        ...(listingId && { listingId }),
      },
      select: { buyerId: true, listingId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: RESERVATION_LIMIT,
    });
    const inquiries = await prisma.contactInquiry.findMany({
      where: {
        agent: { userId: u.id },
        ...(listingId && { listingId }),
      },
      select: {
        listingId: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: INQUIRY_LIMIT,
    });

    const buyerIds = Array.from(new Set(reservations.map((r) => r.buyerId)));
    const buyers = buyerIds.length
      ? await prisma.user.findMany({
          where: {
            id: { in: buyerIds },
            ...(q && {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }),
          },
          select: { id: true, fullName: true, email: true },
          orderBy: { fullName: "asc" },
          take: BUYER_LIMIT,
        })
      : [];

    // Inquiry-only buyers (no account yet) — surface with email only
    const inquiryOnly = inquiries
      .filter((i) =>
        q
          ? i.name.toLowerCase().includes(q.toLowerCase()) ||
            i.email.toLowerCase().includes(q.toLowerCase())
          : true,
      )
      .map((i) => ({
        id: null,
        fullName: i.name,
        email: i.email,
        source: "inquiry" as const,
        listingId: i.listingId,
      }));

    const ownsListings = await prisma.listing.findMany({
      where: {
        agentId: u.id,
        ...(listingId && { id: listingId }),
      },
      select: { id: true, title: true, slug: true },
      orderBy: { publishedAt: "desc" },
      take: LISTING_LIMIT,
    });

    return Response.json({
      buyers: buyers.map((b) => ({
        id: b.id,
        fullName: b.fullName,
        email: b.email,
        source: "reservation" as const,
      })),
      inquiryOnly,
      listings: ownsListings,
      hasMore:
        reservations.length === RESERVATION_LIMIT ||
        inquiries.length === INQUIRY_LIMIT,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
