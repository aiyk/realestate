import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

const moderateSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({ decision: z.literal("reject"), reason: z.string().min(5).max(500) }),
]);

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = moderateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (listing.status !== "PENDING_REVIEW") {
      return Response.json(
        { error: { code: "invalid_state", message: "Not under review" } },
        { status: 409 },
      );
    }

    if (parsed.data.decision === "approve") {
      await prisma.listing.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      await audit({
        actorId: admin.id,
        action: "listing.approve",
        entityType: "Listing",
        entityId: id,
      });
      if (listing.agentId) {
        await notify({
          userId: listing.agentId,
          type: "LISTING_APPROVED",
          title: `Listing approved — ${listing.title}`,
          body: "Your listing is now live and visible to buyers.",
          entityType: "Listing",
          entityId: id,
          actionUrl: `/agent/listings/${id}/edit`,
        });
      }
    } else {
      await prisma.listing.update({
        where: { id },
        data: { status: "REJECTED", rejectionReason: parsed.data.reason },
      });
      await audit({
        actorId: admin.id,
        action: "listing.reject",
        entityType: "Listing",
        entityId: id,
        meta: { reason: parsed.data.reason },
      });
      if (listing.agentId) {
        await notify({
          userId: listing.agentId,
          type: "LISTING_REJECTED",
          title: `Listing needs changes — ${listing.title}`,
          body: parsed.data.reason,
          entityType: "Listing",
          entityId: id,
          actionUrl: `/agent/listings/${id}/edit`,
        });
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
