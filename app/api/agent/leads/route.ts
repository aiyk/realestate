import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") ?? undefined;
    const listingId = sp.get("listingId") ?? undefined;
    const q = sp.get("q") ?? undefined;

    const items = await prisma.lead.findMany({
      where: {
        agentId: u.id,
        ...(status && { status: status as never }),
        ...(listingId && { listingId }),
        ...(q && {
          OR: [
            { buyerName: { contains: q, mode: "insensitive" } },
            { buyerEmail: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        listing: { select: { title: true, slug: true } },
      },
    });
    return Response.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}
