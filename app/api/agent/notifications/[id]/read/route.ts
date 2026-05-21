import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAuth } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const row = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true, readAt: true },
    });
    if (!row) throw new AuthError("not_found", "Notification not found", 404);
    if (row.userId !== user.id) {
      throw new AuthError("forbidden", "Not your notification", 403);
    }
    if (row.readAt) return Response.json({ ok: true, alreadyRead: true });
    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
