import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { approveAgentSchema } from "@/lib/schemas/agent";
import { createTransferRecipient } from "@/lib/paystack";
import { sendMail, templates } from "@/lib/mailer";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = approveAgentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    const profile = await prisma.agentProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, kycStatus: true } } },
    });
    if (!profile) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (profile.status === "APPROVED") {
      return Response.json({ ok: true, alreadyApproved: true });
    }
    if (profile.user.kycStatus !== "VERIFIED") {
      return Response.json(
        {
          error: {
            code: "kyc_not_verified",
            message: "Agent must be KYC-verified before approval",
          },
        },
        { status: 409 },
      );
    }
    if (!profile.bankCode || !profile.bankAccountNo || !profile.bankAccountName) {
      return Response.json(
        {
          error: {
            code: "missing_payout",
            message: "Agent has not completed payout details",
          },
        },
        { status: 409 },
      );
    }

    let recipientCode: string | null = profile.paystackRecipientCode;
    if (HAS_PAYSTACK && !recipientCode) {
      try {
        const r = await createTransferRecipient({
          name: profile.bankAccountName,
          accountNumber: profile.bankAccountNo,
          bankCode: profile.bankCode,
        });
        recipientCode = r.recipient_code;
      } catch (err) {
        logger.error("Failed to create transfer recipient", { err: String(err) });
        return Response.json(
          {
            error: {
              code: "paystack_error",
              message: "Failed to create Paystack transfer recipient",
            },
          },
          { status: 502 },
        );
      }
    } else if (!HAS_PAYSTACK && !recipientCode) {
      // Dev fallback: synthesize a placeholder recipient code so downstream code can branch on it
      recipientCode = `RCP_DEV_${profile.id}`;
    }

    await prisma.$transaction([
      prisma.agentProfile.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedById: admin.id,
          paystackRecipientCode: recipientCode,
          rejectionReason: null,
          ...(parsed.data.defaultCommissionPct !== undefined && {
            defaultCommissionPct: parsed.data.defaultCommissionPct,
          }),
        },
      }),
      prisma.user.update({
        where: { id: profile.userId },
        data: { role: "AGENT" },
      }),
    ]);

    await audit({
      actorId: admin.id,
      action: "agent.approve",
      entityType: "AgentProfile",
      entityId: profile.id,
    });

    await sendMail({
      to: profile.user.email,
      ...templates.agentApproved(profile.businessName),
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
