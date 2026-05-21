import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";
import { emitThreadEvent } from "@/lib/events";
import { notify } from "@/lib/notifications";
import { audit } from "@/lib/audit";

const schema = z.object({
  buyerId: z.string().min(1),
  listingId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const u = await requireAgent();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const { buyerId, listingId, body: msgBody } = parsed.data;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, agentId: true, title: true },
    });
    if (!listing || listing.agentId !== u.id) {
      return Response.json(
        { error: { code: "forbidden", message: "Not your listing." } },
        { status: 403 },
      );
    }

    // Eligibility: buyer must have prior engagement (reservation OR inquiry-as-user OR thread)
    const prior = await prisma.reservation.count({
      where: { listingId, buyerId },
    });
    if (prior === 0) {
      const anyOther = await prisma.reservation.count({
        where: {
          buyerId,
          listing: { agentId: u.id },
        },
      });
      if (anyOther === 0) {
        return Response.json(
          {
            error: {
              code: "no_prior_engagement",
              message:
                "You can only initiate a thread with a buyer who reserved one of your listings.",
            },
          },
          { status: 403 },
        );
      }
    }

    const thread = await prisma.messageThread.upsert({
      where: { listingId_buyerId: { listingId, buyerId } },
      create: {
        listingId,
        buyerId,
        subject: listing.title,
        participants: {
          create: [
            { userId: u.id, role: "AGENT" },
            { userId: buyerId, role: "BUYER" },
          ],
        },
      },
      update: {},
    });

    const message = await prisma.message.create({
      data: { threadId: thread.id, senderId: u.id, body: msgBody },
    });
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: message.createdAt },
    });

    emitThreadEvent(thread.id, {
      type: "message",
      threadId: thread.id,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });

    await notify({
      userId: buyerId,
      type: "MESSAGE_NEW",
      title: `New message — ${listing.title}`,
      body: msgBody.slice(0, 140),
      entityType: "MessageThread",
      entityId: thread.id,
      actionUrl: `/account/messages/${thread.id}`,
    });

    await audit({
      actorId: u.id,
      action: "agent.message.initiate",
      entityType: "MessageThread",
      entityId: thread.id,
      meta: { listingId, buyerId },
    });

    return Response.json({ threadId: thread.id });
  } catch (err) {
    return errorResponse(err);
  }
}
