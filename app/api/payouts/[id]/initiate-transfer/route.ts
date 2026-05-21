import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { initiateTransfer } from "@/lib/paystack";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const ledger = await prisma.commissionLedger.findUnique({
      where: { id },
      include: { agent: true },
    });
    if (!ledger) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (ledger.status !== "PENDING_PAYOUT" && ledger.status !== "ON_HOLD") {
      return Response.json(
        { error: { code: "invalid_state" } },
        { status: 409 },
      );
    }
    if (!ledger.agent?.paystackRecipientCode) {
      return Response.json(
        { error: { code: "no_recipient", message: "Agent has no Paystack recipient" } },
        { status: 409 },
      );
    }
    const reference = `PAY_${crypto.randomBytes(8).toString("hex")}`;

    if (HAS_PAYSTACK) {
      try {
        await initiateTransfer({
          amountKobo: Math.round(Number(ledger.netPayoutNgn) * 100),
          recipientCode: ledger.agent.paystackRecipientCode,
          reference,
          reason: `Commission for listing ${ledger.listingId}`,
        });
      } catch (err) {
        logger.error("Paystack transfer init failed", { err: String(err) });
        return Response.json(
          { error: { code: "paystack_error" } },
          { status: 502 },
        );
      }
    }

    await prisma.commissionLedger.update({
      where: { id },
      data: {
        status: "PROCESSING",
        paystackTransferRef: reference,
      },
    });

    await audit({
      actorId: admin.id,
      action: "payout.initiate_transfer",
      entityType: "CommissionLedger",
      entityId: id,
      meta: { reference, dev: !HAS_PAYSTACK },
    });

    return Response.json({ ok: true, reference });
  } catch (err) {
    return errorResponse(err);
  }
}
