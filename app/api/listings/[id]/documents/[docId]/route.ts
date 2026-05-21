import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id, docId } = await params;
    const u = await requireListingOwnership(id);
    const doc = await prisma.listingDocument.findUnique({
      where: { id: docId },
      select: { listingId: true },
    });
    if (!doc || doc.listingId !== id) {
      throw new AuthError("not_found", "Document not found", 404);
    }
    await prisma.listingDocument.delete({ where: { id: docId } });
    await audit({
      actorId: u.id,
      action: "listing.document.delete",
      entityType: "ListingDocument",
      entityId: docId,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
