import { NextRequest } from "next/server";
import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";
import { paginationSchema } from "@/lib/schemas/pagination";
import { pageBounds } from "@/lib/pagination";

const LEAD_STATUSES: readonly LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "BOOKED",
  "LOST",
];

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;

    const { page, perPage } = paginationSchema.parse({
      page: sp.get("page") ?? undefined,
      perPage: sp.get("perPage") ?? undefined,
    });
    const { skip, take } = pageBounds(page, perPage);

    const rawStatus = sp.get("status") ?? undefined;
    const status =
      rawStatus && (LEAD_STATUSES as readonly string[]).includes(rawStatus)
        ? (rawStatus as LeadStatus)
        : undefined;
    const listingId = sp.get("listingId") ?? undefined;
    const q = sp.get("q") ?? undefined;

    const where: Prisma.LeadWhereInput = {
      agentId: u.id,
      ...(status && { status }),
      ...(listingId && { listingId }),
      ...(q && {
        OR: [
          { buyerName: { contains: q, mode: "insensitive" } },
          { buyerEmail: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take,
        include: { listing: { select: { title: true, slug: true } } },
      }),
      prisma.lead.count({ where }),
    ]);

    return Response.json({
      items,
      total,
      page,
      perPage,
      pages: Math.max(1, Math.ceil(total / perPage)),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
