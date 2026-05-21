import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAgent, errorResponse } from "@/lib/rbac";
import { createListingSchema, listingFilterSchema } from "@/lib/schemas/listing";
import { audit } from "@/lib/audit";
import { slugify, shortId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = listingFilterSchema.safeParse(Object.fromEntries(sp.entries()));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_filter", issues: parsed.error.issues } },
      { status: 400 },
    );
  }
  const f = parsed.data;

  const where: Prisma.ListingWhereInput = {
    status: { in: ["PUBLISHED", "RESERVED", "SOLD"] },
    ...(f.city && { city: { contains: f.city, mode: "insensitive" } }),
    ...(f.propertyType && { propertyType: f.propertyType }),
    ...(f.minPrice !== undefined && { priceNgn: { gte: f.minPrice } }),
    ...(f.maxPrice !== undefined && {
      priceNgn: {
        gte: f.minPrice ?? 0,
        lte: f.maxPrice,
      },
    }),
    ...(f.bedrooms !== undefined && { bedrooms: { gte: f.bedrooms } }),
    ...(f.agentId && { agentId: f.agentId }),
  };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (f.page - 1) * f.perPage,
      take: f.perPage,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        agent: { select: { id: true, fullName: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);
  return Response.json({
    items,
    total,
    page: f.page,
    perPage: f.perPage,
    pages: Math.max(1, Math.ceil(total / f.perPage)),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    let actorId: string;
    let role: "ADMIN" | "AGENT";
    let agentId: string | null = null;
    try {
      const admin = await requireAdmin();
      actorId = admin.id;
      role = "ADMIN";
    } catch {
      const agent = await requireAgent();
      actorId = agent.id;
      role = "AGENT";
      agentId = agent.id;
    }

    const slug = `${slugify(data.title)}-${shortId(6)}`;
    const listing = await prisma.listing.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        priceNgn: new Prisma.Decimal(data.priceNgn),
        depositNgn: new Prisma.Decimal(data.depositNgn),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqm:
          data.areaSqm !== undefined ? new Prisma.Decimal(data.areaSqm) : null,
        addressLine: data.addressLine,
        city: data.city,
        state: data.state,
        country: data.country,
        latitude:
          data.latitude !== undefined ? new Prisma.Decimal(data.latitude) : null,
        longitude:
          data.longitude !== undefined
            ? new Prisma.Decimal(data.longitude)
            : null,
        videoUrl: data.videoUrl ?? null,
        virtualTourUrl: data.virtualTourUrl ?? null,
        youtubeEmbedId: data.youtubeEmbedId ?? null,
        amenities: data.amenities,
        agentId,
        agentCommissionPct:
          data.agentCommissionPct !== undefined
            ? new Prisma.Decimal(data.agentCommissionPct)
            : null,
        platformFeePct: new Prisma.Decimal(data.platformFeePct ?? 1),
        createdById: actorId,
        status: role === "ADMIN" ? "DRAFT" : "DRAFT",
        images: {
          create: data.images.map((img, i) => ({
            storageKey: img.storageKey,
            url: img.url,
            altText: img.altText ?? null,
            caption: img.caption ?? null,
            sortOrder: img.sortOrder ?? i,
            isCover: img.isCover ?? i === 0,
          })),
        },
      },
      include: { images: true },
    });

    await audit({
      actorId,
      action: "listing.create",
      entityType: "Listing",
      entityId: listing.id,
      meta: { title: listing.title, role },
    });

    return Response.json({ listing }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
