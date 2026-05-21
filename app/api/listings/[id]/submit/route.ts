import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const agent = await requireAgent();
    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.agentId !== agent.id) {
      return Response.json({ error: { code: "forbidden" } }, { status: 403 });
    }
    if (!["DRAFT", "REJECTED"].includes(listing.status)) {
      return Response.json(
        {
          error: {
            code: "invalid_state",
            message: `Cannot submit from ${listing.status}`,
          },
        },
        { status: 409 },
      );
    }
    const updated = await prisma.listing.update({
      where: { id },
      data: { status: "PENDING_REVIEW", rejectionReason: null },
    });
    await audit({
      actorId: agent.id,
      action: "listing.submit",
      entityType: "Listing",
      entityId: id,
    });
    return Response.json({ listing: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
