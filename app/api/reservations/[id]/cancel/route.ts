import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { cancelReservationSchema } from "@/lib/schemas/reservation";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = cancelReservationSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        listing: true,
        commissionLedger: true,
      },
    });
    if (!reservation) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const isOwner =
      user.role === "ADMIN" ||
      (user.role === "AGENT" && reservation.listing.agentId === user.id);
    const isBuyer = reservation.buyerId === user.id;
    if (!isOwner && !isBuyer) {
      return Response.json({ error: { code: "forbidden" } }, { status: 403 });
    }
    if (
      reservation.commissionLedger &&
      reservation.commissionLedger.status === "PROCESSING"
    ) {
      return Response.json(
        {
          error: {
            code: "payout_in_progress",
            message: "Cannot cancel while payout is processing",
          },
        },
        { status: 409 },
      );
    }
    if (
      !["PENDING", "PAID", "CONVERTED"].includes(reservation.status)
    ) {
      return Response.json(
        { error: { code: "invalid_state" } },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: "CANCELLED", notes: parsed.data.reason },
      });
      // If the listing was reserved/sold for this reservation, revert to PUBLISHED
      if (
        ["RESERVED", "SOLD"].includes(reservation.listing.status)
      ) {
        await tx.listing.update({
          where: { id: reservation.listingId },
          data: { status: "PUBLISHED", soldAt: null },
        });
      }
      if (reservation.commissionLedger) {
        await tx.commissionLedger.update({
          where: { id: reservation.commissionLedger.id },
          data: { status: "CANCELLED", notes: parsed.data.reason },
        });
      }
    });

    await audit({
      actorId: user.id,
      action: "reservation.cancel",
      entityType: "Reservation",
      entityId: reservation.id,
      meta: { reason: parsed.data.reason },
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
