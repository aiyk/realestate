import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireThreadParticipant } from "@/lib/rbac";
import { sendMessageSchema } from "@/lib/schemas/message";
import { emitThreadEvent } from "@/lib/events";
import { sendMail, templates } from "@/lib/mailer";
import { notify } from "@/lib/notifications";

// In-memory map: threadId → connected user IDs (populated by SSE handler)
declare global {
  var __threadConnections: Map<string, Set<string>> | undefined;
}
const connections = (globalThis.__threadConnections ??= new Map());

// Throttle email notifications: threadId+recipientId → last email timestamp
const emailDedup = new Map<string, number>();
const EMAIL_DEBOUNCE_MS = 10 * 60 * 1000; // 10 minutes
const OFFLINE_GRACE_MS = 60 * 1000; // 60 s grace before sending email

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireThreadParticipant(id);
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const message = await prisma.message.create({
      data: { threadId: id, senderId: user.id, body: parsed.data.body },
    });
    await prisma.messageThread.update({
      where: { id },
      data: { lastMessageAt: message.createdAt },
    });

    emitThreadEvent(id, {
      type: "message",
      threadId: id,
      message: {
        id: message.id,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });

    // In-app notification bell for the other participants
    {
      const thread = await prisma.messageThread.findUnique({
        where: { id },
        select: {
          listing: { select: { title: true } },
          participants: { select: { userId: true } },
        },
      });
      if (thread) {
        const previewBody = parsed.data.body.slice(0, 140);
        await Promise.all(
          thread.participants
            .filter((p) => p.userId !== user.id)
            .map((p) =>
              notify({
                userId: p.userId,
                type: "MESSAGE_NEW",
                title: `New message — ${thread.listing.title}`,
                body: previewBody,
                entityType: "MessageThread",
                entityId: id,
                actionUrl: `/account/messages/${id}`,
              }),
            ),
        );
      }
    }

    // Schedule offline email notifications for participants not connected via SSE
    setTimeout(async () => {
      const thread = await prisma.messageThread.findUnique({
        where: { id },
        include: {
          listing: { select: { title: true } },
          participants: {
            include: {
              user: { select: { id: true, email: true } },
            },
          },
        },
      });
      if (!thread) return;
      const connected = connections.get(id) ?? new Set<string>();
      for (const p of thread.participants) {
        if (p.userId === user.id) continue; // skip sender
        if (connected.has(p.userId)) continue; // skip live viewers
        const dedupKey = `${id}:${p.userId}`;
        const last = emailDedup.get(dedupKey) ?? 0;
        if (Date.now() - last < EMAIL_DEBOUNCE_MS) continue;
        emailDedup.set(dedupKey, Date.now());
        const base = process.env.NEXTAUTH_URL ?? "http://localhost:3100";
        const threadUrl = `${base}/account/messages/${id}`;
        await sendMail({
          to: p.user.email,
          ...templates.newMessage(thread.listing.title, threadUrl),
        });
      }
    }, OFFLINE_GRACE_MS);

    return Response.json({ message });
  } catch (err) {
    return errorResponse(err);
  }
}
