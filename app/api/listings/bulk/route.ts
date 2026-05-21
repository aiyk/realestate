import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const bulkSchema = z.object({
  action: z.enum(["archive", "submit", "unarchive"]),
  ids: z.array(z.string().min(1)).min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const u = await requireAuth();
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const ids = Array.from(new Set(parsed.data.ids));
    const owned = await prisma.listing.findMany({
      where: {
        id: { in: ids },
        ...(u.role === "ADMIN" ? {} : { agentId: u.id }),
      },
      select: { id: true, status: true, title: true },
    });
    if (owned.length === 0) {
      return Response.json(
        { error: { code: "not_found", message: "No listings to act on" } },
        { status: 404 },
      );
    }
    const ownedIds = owned.map((l) => l.id);

    let updated = 0;
    let skipped = 0;
    if (parsed.data.action === "archive") {
      const candidates = owned.filter(
        (l) =>
          l.status === "DRAFT" ||
          l.status === "REJECTED" ||
          l.status === "PUBLISHED",
      );
      if (candidates.length > 0) {
        const res = await prisma.listing.updateMany({
          where: { id: { in: candidates.map((c) => c.id) } },
          data: { status: "ARCHIVED", archivedAt: new Date() },
        });
        updated = res.count;
      }
      skipped = owned.length - candidates.length;
    } else if (parsed.data.action === "unarchive") {
      const candidates = owned.filter((l) => l.status === "ARCHIVED");
      if (candidates.length > 0) {
        const res = await prisma.listing.updateMany({
          where: { id: { in: candidates.map((c) => c.id) } },
          data: { status: "DRAFT", archivedAt: null },
        });
        updated = res.count;
      }
      skipped = owned.length - candidates.length;
    } else if (parsed.data.action === "submit") {
      const candidates = owned.filter(
        (l) => l.status === "DRAFT" || l.status === "REJECTED",
      );
      if (candidates.length > 0) {
        const res = await prisma.listing.updateMany({
          where: { id: { in: candidates.map((c) => c.id) } },
          data: { status: "PENDING_REVIEW", rejectionReason: null },
        });
        updated = res.count;
      }
      skipped = owned.length - candidates.length;
    }

    await audit({
      actorId: u.id,
      action: `listing.bulk.${parsed.data.action}`,
      entityType: "Listing",
      entityId: ownedIds.join(","),
      meta: { ids: ownedIds, updated, skipped },
    });

    return Response.json({ ok: true, updated, skipped, requested: ids.length });
  } catch (err) {
    return errorResponse(err);
  }
}
