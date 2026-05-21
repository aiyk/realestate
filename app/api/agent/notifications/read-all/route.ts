import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";

export async function POST() {
  try {
    const user = await requireAuth();
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return Response.json({ ok: true, marked: result.count });
  } catch (err) {
    return errorResponse(err);
  }
}
