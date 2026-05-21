import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAuth } from "@/lib/rbac";
import { agentReviewFlagSchema } from "@/lib/schemas/agent";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ slug: string; reviewId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u = await requireAuth();
    const { reviewId } = await params;
    const body = await req.json();
    const parsed = agentReviewFlagSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const review = await prisma.agentReview.findUnique({
      where: { id: reviewId },
      select: { id: true, status: true },
    });
    if (!review) {
      throw new AuthError("not_found", "Review not found", 404);
    }
    await prisma.agentReview.update({
      where: { id: reviewId },
      data: {
        status: "FLAGGED",
        flagReason: parsed.data.reason,
        flaggedAt: new Date(),
      },
    });
    await audit({
      actorId: u.id,
      action: "agent.review.flag",
      entityType: "AgentReview",
      entityId: reviewId,
      meta: { reason: parsed.data.reason },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
