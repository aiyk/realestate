import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { updateListingSchema } from "@/lib/schemas/listing";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: { select: { id: true, fullName: true, agentProfile: true } },
    },
  });
  if (!listing) {
    return Response.json({ error: { code: "not_found" } }, { status: 404 });
  }
  return Response.json({ listing });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    const body = await req.json();
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const data: Prisma.ListingUpdateInput = {};
    if (d.title) data.title = d.title;
    if (d.description) data.description = d.description;
    if (d.propertyType) data.propertyType = d.propertyType;
    if (d.priceNgn !== undefined) data.priceNgn = new Prisma.Decimal(d.priceNgn);
    if (d.depositNgn !== undefined)
      data.depositNgn = new Prisma.Decimal(d.depositNgn);
    if (d.bedrooms !== undefined) data.bedrooms = d.bedrooms;
    if (d.bathrooms !== undefined) data.bathrooms = d.bathrooms;
    if (d.areaSqm !== undefined)
      data.areaSqm = new Prisma.Decimal(d.areaSqm);
    if (d.addressLine) data.addressLine = d.addressLine;
    if (d.city) data.city = d.city;
    if (d.state) data.state = d.state;
    if (d.country) data.country = d.country;
    if (d.amenities) data.amenities = d.amenities;
    if (d.agentCommissionPct !== undefined)
      data.agentCommissionPct = new Prisma.Decimal(d.agentCommissionPct);
    if (d.platformFeePct !== undefined)
      data.platformFeePct = new Prisma.Decimal(d.platformFeePct);

    const tx = await prisma.$transaction(async (txClient) => {
      const updated = await txClient.listing.update({
        where: { id },
        data,
      });
      if (d.images) {
        await txClient.listingImage.deleteMany({ where: { listingId: id } });
        await txClient.listingImage.createMany({
          data: d.images.map((img, i) => ({
            listingId: id,
            storageKey: img.storageKey,
            url: img.url,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder ?? i,
            isCover: img.isCover ?? i === 0,
          })),
        });
      }
      return updated;
    });

    await audit({
      actorId: u.id,
      action: "listing.update",
      entityType: "Listing",
      entityId: id,
    });
    return Response.json({ listing: tx });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    await prisma.listing.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    await audit({
      actorId: u.id,
      action: "listing.archive",
      entityType: "Listing",
      entityId: id,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
