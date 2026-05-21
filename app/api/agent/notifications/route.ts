import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unreadOnly") === "1";
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const take = Math.min(50, Number(url.searchParams.get("take") ?? 20));

    const rows = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly && { readAt: null }),
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;
    return Response.json({
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
