import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const patchSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  capacity: z.coerce.number().int().min(1).max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

type Params = { params: Promise<{ id: string; ohId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id, ohId } = await params;
    const u = await requireListingOwnership(id);
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const existing = await prisma.openHouse.findUnique({
      where: { id: ohId },
      select: { listingId: true },
    });
    if (!existing || existing.listingId !== id) {
      throw new AuthError("not_found", "Open house not found", 404);
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.startsAt) data.startsAt = new Date(parsed.data.startsAt);
    if (parsed.data.endsAt) data.endsAt = new Date(parsed.data.endsAt);
    if (parsed.data.capacity !== undefined) data.capacity = parsed.data.capacity;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
    const row = await prisma.openHouse.update({
      where: { id: ohId },
      data,
    });
    await audit({
      actorId: u.id,
      action: "listing.openHouse.update",
      entityType: "OpenHouse",
      entityId: ohId,
    });
    return Response.json({ openHouse: row });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id, ohId } = await params;
    const u = await requireListingOwnership(id);
    const existing = await prisma.openHouse.findUnique({
      where: { id: ohId },
      select: { listingId: true },
    });
    if (!existing || existing.listingId !== id) {
      throw new AuthError("not_found", "Open house not found", 404);
    }
    await prisma.openHouse.update({
      where: { id: ohId },
      data: { cancelledAt: new Date() },
    });
    await audit({
      actorId: u.id,
      action: "listing.openHouse.cancel",
      entityType: "OpenHouse",
      entityId: ohId,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
