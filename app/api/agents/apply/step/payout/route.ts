import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireKyc } from "@/lib/rbac";
import { payoutStepSchema } from "@/lib/schemas/agent";
import { resolveAccount } from "@/lib/paystack";
import { normalizeName } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { audit } from "@/lib/audit";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

export async function POST(req: NextRequest) {
  try {
    const user = await requireKyc();
    const body = await req.json();
    const parsed = payoutStepSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const { bankCode, bankAccountNo } = parsed.data;

    const profile = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new AuthError(
        "no_profile",
        "Complete the business step first",
        400,
      );
    }

    const userRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { fullName: true },
    });
    const userNameNorm = normalizeName(userRow?.fullName ?? "");

    let bankAccountName: string;
    if (HAS_PAYSTACK) {
      try {
        const result = await resolveAccount(bankAccountNo, bankCode);
        bankAccountName = result.account_name;
      } catch (err) {
        logger.warn("Paystack resolveAccount failed", { err: String(err) });
        return Response.json(
          {
            error: {
              code: "bank_resolve_failed",
              message: "Could not verify account with the bank. Check the details.",
            },
          },
          { status: 400 },
        );
      }
    } else {
      // Dev fallback: pretend bank returned the user's full name (always matches).
      bankAccountName = userRow?.fullName ?? "";
    }

    // Name match check
    const bankNameNorm = normalizeName(bankAccountName);
    const userTokens = userNameNorm.split(" ");
    const bankTokens = bankNameNorm.split(" ");
    const overlap = userTokens.filter((t) => bankTokens.includes(t)).length;
    if (overlap < 2) {
      return Response.json(
        {
          error: {
            code: "name_mismatch",
            message: `Account holder "${bankAccountName}" does not match your account name. Use your own bank account.`,
          },
        },
        { status: 400 },
      );
    }

    const updated = await prisma.agentProfile.update({
      where: { id: profile.id },
      data: { bankCode, bankAccountNo, bankAccountName },
    });

    await audit({
      actorId: user.id,
      action: "agent.payout_saved",
      entityType: "AgentProfile",
      entityId: profile.id,
    });

    return Response.json({ profile: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
