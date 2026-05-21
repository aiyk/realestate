import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const openHouseSchema = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    capacity: z.coerce.number().int().min(1).max(500).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireListingOwnership(id);
    const rows = await prisma.openHouse.findMany({
      where: { listingId: id, cancelledAt: null },
      orderBy: { startsAt: "asc" },
    });
    return Response.json({ items: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    const body = await req.json();
    const parsed = openHouseSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const row = await prisma.openHouse.create({
      data: {
        listingId: id,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
        capacity: parsed.data.capacity ?? null,
        notes: parsed.data.notes ?? null,
      },
    });
    await audit({
      actorId: u.id,
      action: "listing.openHouse.create",
      entityType: "OpenHouse",
      entityId: row.id,
      meta: { listingId: id, startsAt: parsed.data.startsAt },
    });
    return Response.json({ openHouse: row }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
