import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireAuth();
    const count = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });
    return Response.json({ count });
  } catch (err) {
    return errorResponse(err);
  }
}
