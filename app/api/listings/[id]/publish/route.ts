import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (!["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(listing.status)) {
      return Response.json(
        {
          error: {
            code: "invalid_state",
            message: `Cannot publish from ${listing.status}`,
          },
        },
        { status: 409 },
      );
    }
    const updated = await prisma.listing.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await audit({
      actorId: admin.id,
      action: "listing.publish",
      entityType: "Listing",
      entityId: id,
    });
    if (updated.agentId) {
      await notify({
        userId: updated.agentId,
        type: "LISTING_APPROVED",
        title: `Listing approved — ${updated.title}`,
        body: "Your listing is now live and visible to buyers.",
        entityType: "Listing",
        entityId: id,
        actionUrl: `/agent/listings/${id}/edit`,
      });
    }
    return Response.json({ listing: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
