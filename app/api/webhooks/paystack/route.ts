import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";
import { logger } from "@/lib/logger";
import { audit } from "@/lib/audit";
import { sendMail, templates } from "@/lib/mailer";
import { notify } from "@/lib/notifications";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

type PaystackEvent =
  | {
      event: "charge.success";
      data: { reference: string; status: string; amount: number };
    }
  | {
      event: "transfer.success";
      data: { reference: string };
    }
  | {
      event: "transfer.failed";
      data: { reference: string; reason?: string };
    };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") ?? "";

  // In production: require valid HMAC.
  // In dev (placeholder keys): accept signed-by-dev marker so the simulator can post.
  if (HAS_PAYSTACK) {
    if (!verifyWebhookSignature(raw, sig)) {
      logger.warn("Paystack webhook signature failed");
      return Response.json({ ok: false }, { status: 400 });
    }
  } else if (sig !== "dev-simulator") {
    logger.warn("Paystack dev webhook missing dev-simulator header");
    return Response.json({ ok: false }, { status: 400 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (event.event === "charge.success") {
    await handleChargeSuccess(event.data.reference);
  } else if (event.event === "transfer.success") {
    await handleTransferSuccess(event.data.reference);
  } else if (event.event === "transfer.failed") {
    await handleTransferFailed(event.data.reference, event.data.reason);
  }

  return Response.json({ ok: true });
}

async function handleChargeSuccess(reference: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { reference },
    include: {
      listing: { include: { agent: { select: { email: true, fullName: true } } } },
      buyer: { select: { email: true, fullName: true } },
    },
  });
  if (!reservation) return;
  if (reservation.status === "PAID" || reservation.status === "CONVERTED") {
    // Idempotent: already processed
    return;
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    prisma.listing.update({
      where: { id: reservation.listingId },
      data: { status: "RESERVED" },
    }),
  ]);

  await audit({
    actorId: reservation.buyerId,
    action: "reservation.paid",
    entityType: "Reservation",
    entityId: reservation.id,
  });

  await sendMail({
    to: reservation.buyer.email,
    ...templates.reservationPaidBuyer(
      reservation.listing.title,
      reservation.reference,
    ),
  });
  if (reservation.listing.agent?.email) {
    await sendMail({
      to: reservation.listing.agent.email,
      ...templates.reservationPaidAgent(
        reservation.listing.title,
        reservation.buyer.fullName,
      ),
    });
  }
  if (reservation.listing.agentId) {
    await notify({
      userId: reservation.listing.agentId,
      type: "RESERVATION_PAID",
      title: `Reservation paid — ${reservation.listing.title}`,
      body: `${reservation.buyer.fullName} paid the deposit.`,
      entityType: "Reservation",
      entityId: reservation.id,
      actionUrl: "/agent/reservations",
    });
  }
}

async function handleTransferSuccess(reference: string) {
  const ledger = await prisma.commissionLedger.findFirst({
    where: { paystackTransferRef: reference },
  });
  if (!ledger || ledger.status === "PAID") return;
  await prisma.commissionLedger.update({
    where: { id: ledger.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  await audit({
    actorId: null,
    action: "payout.paid",
    entityType: "CommissionLedger",
    entityId: ledger.id,
  });
}

async function handleTransferFailed(reference: string, reason?: string) {
  const ledger = await prisma.commissionLedger.findFirst({
    where: { paystackTransferRef: reference },
  });
  if (!ledger) return;
  await prisma.commissionLedger.update({
    where: { id: ledger.id },
    data: {
      status: "ON_HOLD",
      notes: reason ?? "Transfer failed",
    },
  });
  await audit({
    actorId: null,
    action: "payout.failed",
    entityType: "CommissionLedger",
    entityId: ledger.id,
    meta: { reason },
  });
}
