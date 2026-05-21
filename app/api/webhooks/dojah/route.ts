import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/dojah";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-dojah-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig)) {
    logger.warn("Dojah webhook signature failed");
    return Response.json({ ok: false }, { status: 400 });
  }
  let body: { providerRef?: string; status?: string; reason?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!body.providerRef) return Response.json({ ok: true });

  const submission = await prisma.kycSubmission.findFirst({
    where: { providerRef: body.providerRef },
  });
  if (!submission) return Response.json({ ok: true });

  const verified = body.status === "verified";
  await prisma.kycSubmission.update({
    where: { id: submission.id },
    data: {
      status: verified ? "VERIFIED" : "FAILED",
      failureReason: verified ? null : body.reason ?? "Verification failed",
      decidedAt: new Date(),
    },
  });
  await prisma.user.update({
    where: { id: submission.userId },
    data: verified
      ? { kycStatus: "VERIFIED", kycVerifiedAt: new Date() }
      : { kycStatus: "FAILED" },
  });

  return Response.json({ ok: true });
}
