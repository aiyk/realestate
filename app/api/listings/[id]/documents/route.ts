import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const docSchema = z.object({
  kind: z.enum([
    "TITLE_DEED",
    "SURVEY_PLAN",
    "C_OF_O",
    "DEED_OF_ASSIGNMENT",
    "OTHER",
  ]),
  title: z.string().min(2).max(160),
  storageKey: z.string().min(1),
  url: z.string().url(),
  sizeBytes: z.coerce.number().int().min(0).optional(),
  mimeType: z.string().min(1).max(80),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireListingOwnership(id);
    const docs = await prisma.listingDocument.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ items: docs });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    const body = await req.json();
    const parsed = docSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const row = await prisma.listingDocument.create({
      data: {
        listingId: id,
        kind: parsed.data.kind,
        title: parsed.data.title,
        storageKey: parsed.data.storageKey,
        url: parsed.data.url,
        sizeBytes: parsed.data.sizeBytes ?? null,
        mimeType: parsed.data.mimeType,
        uploadedById: u.id,
      },
    });
    await audit({
      actorId: u.id,
      action: "listing.document.create",
      entityType: "ListingDocument",
      entityId: row.id,
      meta: { listingId: id, kind: parsed.data.kind },
    });
    return Response.json({ document: row }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
