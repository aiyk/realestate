import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { title: true, status: true, agentId: true, isFeatured: true },
    });
    if (!listing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (listing.status !== "PUBLISHED") {
      return Response.json(
        {
          error: {
            code: "invalid_state",
            message: "Only live listings can be boosted.",
          },
        },
        { status: 409 },
      );
    }
    if (listing.isFeatured) {
      return Response.json({
        ok: true,
        message: "Already featured.",
      });
    }
    await audit({
      actorId: u.id,
      action: "listing.boost.requested",
      entityType: "Listing",
      entityId: id,
    });
    // Notify all admins (lightweight in-app)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        notify({
          userId: a.id,
          type: "SYSTEM",
          title: `Boost requested — ${listing.title}`,
          body: "Agent requested featured placement. Review and approve.",
          entityType: "Listing",
          entityId: id,
          actionUrl: `/admin/listings/${id}`,
        }),
      ),
    );
    return Response.json({
      ok: true,
      message: "Boost requested. An admin will review shortly.",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
