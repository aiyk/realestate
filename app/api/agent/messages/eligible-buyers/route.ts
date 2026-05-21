import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;
    const listingId = sp.get("listingId") ?? undefined;
    const q = (sp.get("q") ?? "").trim();

    const reservations = await prisma.reservation.findMany({
      where: {
        listing: { agentId: u.id },
        ...(listingId && { listingId }),
      },
      select: { buyerId: true, listingId: true },
    });
    const inquiries = await prisma.contactInquiry.findMany({
      where: {
        agent: { userId: u.id },
        ...(listingId && { listingId }),
      },
      select: { listingId: true, email: true, name: true },
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
    });
  } catch (err) {
    return errorResponse(err);
  }
}
