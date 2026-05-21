import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireThreadParticipant } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireThreadParticipant(id);
    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
        participants: { select: { userId: true, role: true } },
      },
    });
    if (!thread) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    // Mark read
    await prisma.threadParticipant.updateMany({
      where: { threadId: id, userId: user.id },
      data: { lastReadAt: new Date() },
    });
    return Response.json({ thread });
  } catch (err) {
    return errorResponse(err);
  }
}
