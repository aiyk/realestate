import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { slugify, shortId } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const u = await requireListingOwnership(id);
    const source = await prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!source) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const title = `${source.title} (copy)`;
    const slug = `${slugify(title)}-${shortId(6)}`;
    const duplicated = await prisma.listing.create({
      data: {
        slug,
        title,
        description: source.description,
        propertyType: source.propertyType,
        priceNgn: source.priceNgn,
        depositNgn: source.depositNgn,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        areaSqm: source.areaSqm,
        addressLine: source.addressLine,
        city: source.city,
        state: source.state,
        country: source.country,
        latitude: source.latitude,
        longitude: source.longitude,
        videoUrl: source.videoUrl,
        virtualTourUrl: source.virtualTourUrl,
        youtubeEmbedId: source.youtubeEmbedId,
        amenities: source.amenities,
        agentId: source.agentId,
        agentCommissionPct: source.agentCommissionPct,
        platformFeePct: source.platformFeePct,
        createdById: u.id,
        status: "DRAFT",
        duplicatedFromId: source.id,
        images: {
          create: source.images.map((img, i) => ({
            storageKey: img.storageKey,
            url: img.url,
            altText: img.altText,
            caption: img.caption,
            sortOrder: img.sortOrder ?? i,
            isCover: img.isCover,
          })),
        },
      },
    });
    await audit({
      actorId: u.id,
      action: "listing.duplicate",
      entityType: "Listing",
      entityId: duplicated.id,
      meta: { sourceId: source.id },
    });
    return Response.json({ listing: duplicated }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
