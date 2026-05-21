import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const u = await requireAgent();
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { listing: { select: { id: true, agentId: true } } },
    });
    if (!lead || lead.agentId !== u.id) {
      throw new AuthError("not_found", "Lead not found", 404);
    }
    if (!lead.listingId || !lead.listing) {
      return Response.json(
        {
          error: {
            code: "no_listing",
            message:
              "This lead isn't attached to a listing yet — open it manually in messages.",
          },
        },
        { status: 409 },
      );
    }
    if (!lead.buyerUserId) {
      return Response.json(
        {
          error: {
            code: "no_buyer_user",
            message: "Anonymous leads need an account to message in-app.",
          },
        },
        { status: 409 },
      );
    }
    const thread = await prisma.messageThread.upsert({
      where: {
        listingId_buyerId: {
          listingId: lead.listingId,
          buyerId: lead.buyerUserId,
        },
      },
      create: {
        listingId: lead.listingId,
        buyerId: lead.buyerUserId,
        subject: lead.buyerName,
        participants: {
          create: [
            { userId: u.id, role: "AGENT" },
            { userId: lead.buyerUserId, role: "BUYER" },
          ],
        },
      },
      update: {},
    });
    await prisma.lead.update({
      where: { id },
      data: {
        threadId: thread.id,
        status: lead.status === "NEW" ? "CONTACTED" : lead.status,
        lastContactedAt: new Date(),
      },
    });
    await audit({
      actorId: u.id,
      action: "agent.lead.convert",
      entityType: "Lead",
      entityId: id,
      meta: { threadId: thread.id },
    });
    return Response.json({ threadId: thread.id });
  } catch (err) {
    return errorResponse(err);
  }
}
