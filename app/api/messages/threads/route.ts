import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { createThreadSchema } from "@/lib/schemas/message";
import { emitThreadEvent } from "@/lib/events";

export async function GET() {
  try {
    const user = await requireAuth();
    const threads = await prisma.messageThread.findMany({
      where:
        user.role === "ADMIN"
          ? {}
          : {
              participants: {
                some: { userId: user.id },
              },
            },
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      include: {
        listing: { select: { title: true, slug: true } },
        participants: { select: { userId: true, role: true, lastReadAt: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, senderId: true, createdAt: true },
        },
      },
    });

    const enriched = threads.map((t) => {
      const me = t.participants.find((p) => p.userId === user.id);
      return {
        id: t.id,
        listingId: t.listingId,
        listingTitle: t.listing.title,
        listingSlug: t.listing.slug,
        lastMessage: t.messages[0] ?? null,
        lastMessageAt: t.lastMessageAt,
        lastReadAt: me?.lastReadAt ?? null,
      };
    });

    return Response.json({ threads: enriched });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const { listingId, initialMessage } = parsed.data;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, agentId: true, title: true },
    });
    if (!listing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }

    // Determine canonical buyerId. If the requester is the agent or admin
    // they can target an existing thread (we expect buyerId in body in that case),
    // but for v1 we only let buyers create threads.
    if (user.role !== "BUYER") {
      return Response.json(
        { error: { code: "forbidden", message: "Only buyers can start threads" } },
        { status: 403 },
      );
    }
    const buyerId = user.id;

    const existing = await prisma.messageThread.findUnique({
      where: { listingId_buyerId: { listingId, buyerId } },
    });

    let thread: { id: string };
    if (existing) {
      thread = existing;
    } else {
      thread = await prisma.messageThread.create({
        data: {
          listingId,
          buyerId,
          subject: `Inquiry: ${listing.title}`,
          participants: {
            create: [
              { userId: buyerId, role: "BUYER" },
              ...(listing.agentId
                ? [{ userId: listing.agentId, role: "AGENT" as const }]
                : []),
              // Admin: pick the first admin user for oversight participation
            ],
          },
        },
      });
      // Add platform admins as silent participants
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      if (admins.length > 0) {
        await prisma.threadParticipant.createMany({
          data: admins.map((a) => ({
            threadId: thread.id,
            userId: a.id,
            role: "ADMIN" as const,
          })),
          skipDuplicates: true,
        });
      }
    }

    if (initialMessage) {
      const msg = await prisma.message.create({
        data: { threadId: thread.id, senderId: user.id, body: initialMessage },
      });
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: msg.createdAt },
      });
      emitThreadEvent(thread.id, {
        type: "message",
        threadId: thread.id,
        message: {
          id: msg.id,
          senderId: msg.senderId,
          body: msg.body,
          createdAt: msg.createdAt.toISOString(),
        },
      });
    }

    return Response.json({ thread: { id: thread.id, listingId } });
  } catch (err) {
    return errorResponse(err);
  }
}
