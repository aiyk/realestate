import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { errorResponse, requireKyc } from "@/lib/rbac";
import { createReservationSchema } from "@/lib/schemas/reservation";
import { initializeTransaction } from "@/lib/paystack";
import { audit } from "@/lib/audit";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3100";

export async function POST(req: NextRequest) {
  try {
    const user = await requireKyc();
    const body = await req.json();
    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    // Transactional check + create. Uses SELECT … FOR UPDATE via Prisma's
    // serializable isolation as a belt-and-braces guard against two buyers
    // racing on the same listing.
    const result = await prisma.$transaction(
      async (tx) => {
        const listing = await tx.listing.findUnique({
          where: { id: parsed.data.listingId },
        });
        if (!listing) {
          return { error: "not_found" as const };
        }
        if (listing.status !== "PUBLISHED") {
          return { error: "not_available" as const };
        }
        const reference = `RES_${crypto.randomBytes(8).toString("hex")}`;
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const reservation = await tx.reservation.create({
          data: {
            reference,
            listingId: listing.id,
            buyerId: user.id,
            depositNgn: listing.depositNgn,
            status: "PENDING",
            expiresAt,
          },
        });
        return { listing, reservation };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if ("error" in result) {
      const code = result.error;
      const msg =
        code === "not_found"
          ? "Listing not found"
          : "This listing is no longer available";
      return Response.json({ error: { code, message: msg } }, { status: 409 });
    }

    const { listing, reservation } = result;
    const callback = `${NEXTAUTH_URL}/checkout/${listing.id}/return?reference=${reservation.reference}`;
    let authUrl: string;

    if (HAS_PAYSTACK) {
      const init = await initializeTransaction({
        email: user.email,
        amountKobo: Math.round(Number(listing.depositNgn) * 100),
        reference: reservation.reference,
        callbackUrl: callback,
        metadata: { listingId: listing.id, buyerId: user.id },
      });
      authUrl = init.authorization_url;
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paystackAuthUrl: authUrl,
          paystackAccessCode: init.access_code,
        },
      });
    } else {
      // Dev simulator
      authUrl = `${NEXTAUTH_URL}/dev/paystack/${reservation.reference}`;
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paystackAuthUrl: authUrl },
      });
    }

    await audit({
      actorId: user.id,
      action: "reservation.create",
      entityType: "Reservation",
      entityId: reservation.id,
      meta: { listingId: listing.id },
    });

    return Response.json({
      reservation: { id: reservation.id, reference: reservation.reference },
      authUrl,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
