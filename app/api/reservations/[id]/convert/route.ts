import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { convertReservationSchema } from "@/lib/schemas/reservation";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = convertReservationSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!reservation) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const ownsListing =
      user.role === "ADMIN" ||
      (user.role === "AGENT" && reservation.listing.agentId === user.id);
    if (!ownsListing) {
      return Response.json({ error: { code: "forbidden" } }, { status: 403 });
    }
    if (reservation.status !== "PAID") {
      return Response.json(
        { error: { code: "invalid_state", message: "Reservation not in PAID state" } },
        { status: 409 },
      );
    }

    // Snapshot commission settings
    const listing = reservation.listing;
    const agentCommissionPct = listing.agentCommissionPct
      ? new Prisma.Decimal(listing.agentCommissionPct)
      : new Prisma.Decimal(5);
    const platformFeePct = new Prisma.Decimal(listing.platformFeePct);
    const salePrice = new Prisma.Decimal(listing.priceNgn);

    const agentCommissionNgn = salePrice.mul(agentCommissionPct).div(100);
    const platformFeeNgn = salePrice.mul(platformFeePct).div(100);
    const netPayoutNgn = agentCommissionNgn.minus(platformFeeNgn);
    const netFinal = netPayoutNgn.lessThan(0) ? new Prisma.Decimal(0) : netPayoutNgn;

    let agentProfileId: string | null = null;
    if (listing.agentId) {
      const ap = await prisma.agentProfile.findUnique({
        where: { userId: listing.agentId },
        select: { id: true },
      });
      agentProfileId = ap?.id ?? null;
    }

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: "CONVERTED", notes: parsed.data.notes },
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { status: "SOLD", soldAt: new Date() },
      }),
      prisma.commissionLedger.create({
        data: {
          listingId: listing.id,
          reservationId: reservation.id,
          agentId: agentProfileId,
          salePriceNgn: salePrice,
          agentCommissionPct,
          agentCommissionNgn: listing.agentId ? agentCommissionNgn : new Prisma.Decimal(0),
          platformFeePct,
          platformFeeNgn,
          netPayoutNgn: listing.agentId ? netFinal : new Prisma.Decimal(0),
          status: listing.agentId ? "PENDING_PAYOUT" : "PAID",
          paidAt: listing.agentId ? null : new Date(),
        },
      }),
    ]);

    await audit({
      actorId: user.id,
      action: "reservation.convert",
      entityType: "Reservation",
      entityId: reservation.id,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
