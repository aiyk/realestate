import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { kycInitiateSchema } from "@/lib/schemas/kyc";
import { hashId, lookupBvn, lookupNin } from "@/lib/dojah";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { normalizeName } from "@/lib/utils";

const HAS_DOJAH = !!process.env.DOJAH_APP_ID && !!process.env.DOJAH_PRIVATE_KEY;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = kycInitiateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const { bvn, nin, dob, selfieKey } = parsed.data;

    // Rate limit: max 5 attempts/24h
    const recent = await prisma.kycSubmission.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recent >= 5) {
      return Response.json(
        { error: { code: "rate_limited", message: "Too many attempts. Try again tomorrow." } },
        { status: 429 },
      );
    }

    const userRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { fullName: true },
    });
    if (!userRow) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const fullNameNormalized = normalizeName(userRow.fullName);

    const submission = await prisma.kycSubmission.create({
      data: {
        userId: user.id,
        bvnHash: hashId(bvn),
        ninHash: nin ? hashId(nin) : null,
        dob: new Date(dob),
        selfieKey,
        status: "PENDING",
      },
    });

    let verified = false;
    let failureReason: string | null = null;

    if (HAS_DOJAH) {
      try {
        const bvnResult = await lookupBvn(bvn);
        const provName = normalizeName(
          `${bvnResult.first_name} ${bvnResult.last_name}`,
        );
        if (provName !== fullNameNormalized) {
          // Allow partial match if both first and last name appear
          const userTokens = fullNameNormalized.split(" ");
          const provTokens = provName.split(" ");
          const overlap = userTokens.filter((t) => provTokens.includes(t)).length;
          if (overlap < 2) {
            failureReason = "Name on BVN does not match account name";
          }
        }
        if (!failureReason && nin) {
          const ninResult = await lookupNin(nin);
          const ninName = normalizeName(
            `${ninResult.first_name} ${ninResult.surname}`,
          );
          const userTokens = fullNameNormalized.split(" ");
          const ninTokens = ninName.split(" ");
          const overlap = userTokens.filter((t) => ninTokens.includes(t)).length;
          if (overlap < 2) {
            failureReason = "Name on NIN does not match account name";
          }
        }
        verified = !failureReason;
      } catch (err) {
        logger.warn("Dojah lookup failed", { err: String(err) });
        failureReason = "Identity verification provider error";
      }
    } else {
      // Dev/demo fallback: BVN starting with "22222" is treated as verified.
      // Allows full e2e testing without real Dojah keys.
      verified = bvn.startsWith("22222");
      if (!verified) failureReason = "Sandbox: BVN must start with 22222 in dev";
    }

    const status = verified ? "VERIFIED" : "FAILED";
    await prisma.kycSubmission.update({
      where: { id: submission.id },
      data: {
        status,
        failureReason,
        decidedAt: new Date(),
      },
    });

    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: "VERIFIED", kycVerifiedAt: new Date() },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: "FAILED" },
      });
    }

    await audit({
      actorId: user.id,
      action: verified ? "kyc.verified" : "kyc.failed",
      entityType: "KycSubmission",
      entityId: submission.id,
      meta: { reason: failureReason ?? undefined },
    });

    return Response.json({
      status,
      reason: failureReason,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
