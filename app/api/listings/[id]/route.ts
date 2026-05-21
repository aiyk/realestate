import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse, requireListingOwnership } from "@/lib/rbac";
import { updateListingSchema } from "@/lib/schemas/listing";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

const HARD_LOCKED_FIELDS = [
  "addressLine",
  "city",
  "state",
  "country",
  "propertyType",
  "latitude",
  "longitude",
  "agentCommissionPct",
  "platformFeePct",
] as const;

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

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { status: true, priceNgn: true, title: true, agentId: true },
    });
    if (!existing) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const isAdmin = u.role === "ADMIN";
    const status = existing.status;
    const isFullyLocked =
      !isAdmin &&
      (status === "PENDING_REVIEW" ||
        status === "RESERVED" ||
        status === "SOLD" ||
        status === "ARCHIVED");
    if (isFullyLocked) {
      return Response.json(
        {
          error: {
            code: "field_locked",
            message: `Listing edits are paused in ${status}.`,
          },
        },
        { status: 409 },
      );
    }
    const isLimited = !isAdmin && status === "PUBLISHED";
    if (isLimited) {
      for (const field of HARD_LOCKED_FIELDS) {
        const next = (parsed.data as Record<string, unknown>)[field];
        if (next === undefined) continue;
        return Response.json(
          {
            error: {
              code: "field_locked",
              message: `${field} is locked once a listing is live.`,
              field,
            },
          },
          { status: 409 },
        );
      }
    }

    const d = parsed.data;
    const data: Prisma.ListingUpdateInput = {};
    if (d.title) data.title = d.title;
    if (d.description) data.description = d.description;
    if (!isLimited && d.propertyType) data.propertyType = d.propertyType;
    if (d.priceNgn !== undefined)
      data.priceNgn = new Prisma.Decimal(d.priceNgn);
    if (d.depositNgn !== undefined)
      data.depositNgn = new Prisma.Decimal(d.depositNgn);
    if (d.bedrooms !== undefined) data.bedrooms = d.bedrooms;
    if (d.bathrooms !== undefined) data.bathrooms = d.bathrooms;
    if (d.areaSqm !== undefined)
      data.areaSqm = new Prisma.Decimal(d.areaSqm);
    if (!isLimited) {
      if (d.addressLine) data.addressLine = d.addressLine;
      if (d.city) data.city = d.city;
      if (d.state) data.state = d.state;
      if (d.country) data.country = d.country;
      if (d.latitude !== undefined)
        data.latitude = new Prisma.Decimal(d.latitude);
      if (d.longitude !== undefined)
        data.longitude = new Prisma.Decimal(d.longitude);
      if (d.agentCommissionPct !== undefined)
        data.agentCommissionPct = new Prisma.Decimal(d.agentCommissionPct);
      if (d.platformFeePct !== undefined)
        data.platformFeePct = new Prisma.Decimal(d.platformFeePct);
    }
    if (d.videoUrl !== undefined) data.videoUrl = d.videoUrl ?? null;
    if (d.virtualTourUrl !== undefined)
      data.virtualTourUrl = d.virtualTourUrl ?? null;
    if (d.youtubeEmbedId !== undefined)
      data.youtubeEmbedId = d.youtubeEmbedId ?? null;
    if (d.amenities) data.amenities = d.amenities;

    // ±10% price rule on PUBLISHED listings.
    let priceHistoryEntry: {
      oldPriceNgn: Prisma.Decimal;
      newPriceNgn: Prisma.Decimal;
      triggeredReview: boolean;
    } | null = null;
    if (status === "PUBLISHED" && d.priceNgn !== undefined) {
      const oldPrice = Number(existing.priceNgn);
      const newPrice = Number(d.priceNgn);
      if (oldPrice > 0 && Math.abs(newPrice - oldPrice) / oldPrice > 0.1) {
        data.status = "PENDING_REVIEW";
        data.priceReviewRequired = true;
        priceHistoryEntry = {
          oldPriceNgn: existing.priceNgn,
          newPriceNgn: new Prisma.Decimal(d.priceNgn),
          triggeredReview: true,
        };
      } else if (Math.abs(newPrice - oldPrice) > 0.01) {
        priceHistoryEntry = {
          oldPriceNgn: existing.priceNgn,
          newPriceNgn: new Prisma.Decimal(d.priceNgn),
          triggeredReview: false,
        };
      }
      if (priceHistoryEntry) {
        data.priceLastChangedAt = new Date();
      }
    }

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
            caption: img.caption ?? null,
            sortOrder: img.sortOrder ?? i,
            isCover: img.isCover ?? i === 0,
          })),
        });
      }
      if (priceHistoryEntry) {
        await txClient.listingPriceHistory.create({
          data: {
            listingId: id,
            oldPriceNgn: priceHistoryEntry.oldPriceNgn,
            newPriceNgn: priceHistoryEntry.newPriceNgn,
            changedById: u.id,
            triggeredReview: priceHistoryEntry.triggeredReview,
          },
        });
      }
      return updated;
    });

    await audit({
      actorId: u.id,
      action: priceHistoryEntry?.triggeredReview
        ? "listing.priceReviewTriggered"
        : "listing.update",
      entityType: "Listing",
      entityId: id,
      meta: priceHistoryEntry
        ? {
            oldPriceNgn: priceHistoryEntry.oldPriceNgn.toString(),
            newPriceNgn: priceHistoryEntry.newPriceNgn.toString(),
            triggeredReview: priceHistoryEntry.triggeredReview,
          }
        : undefined,
    });

    if (priceHistoryEntry?.triggeredReview && existing.agentId) {
      await notify({
        userId: existing.agentId,
        type: "LISTING_REJECTED",
        title: `Price change paused ${existing.title} for re-review`,
        body: "Changes over ±10% need admin approval before going live again.",
        entityType: "Listing",
        entityId: id,
        actionUrl: `/agent/listings/${id}/edit`,
      });
    }

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
      data: { status: "ARCHIVED", archivedAt: new Date() },
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
