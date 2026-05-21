import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;
    const address = (sp.get("address") ?? "").trim();
    const city = (sp.get("city") ?? "").trim();
    if (address.length < 5) {
      return Response.json({ matches: [] });
    }
    const matches = await prisma.listing.findMany({
      where: {
        agentId: u.id,
        addressLine: { contains: address, mode: "insensitive" },
        ...(city && { city: { equals: city, mode: "insensitive" } }),
        status: { notIn: ["ARCHIVED"] },
      },
      select: {
        id: true,
        title: true,
        addressLine: true,
        city: true,
        status: true,
      },
      take: 5,
    });
    return Response.json({ matches });
  } catch (err) {
    return errorResponse(err);
  }
}
