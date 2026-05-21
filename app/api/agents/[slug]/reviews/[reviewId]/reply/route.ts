import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { agentReviewReplySchema } from "@/lib/schemas/agent";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ slug: string; reviewId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u = await requireAgent();
    const { slug, reviewId } = await params;
    const body = await req.json();
    const parsed = agentReviewReplySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const agent = await prisma.agentProfile.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });
    if (!agent || agent.userId !== u.id) {
      throw new AuthError("forbidden", "Not your profile", 403);
    }
    const review = await prisma.agentReview.findUnique({
      where: { id: reviewId },
      select: { agentId: true },
    });
    if (!review || review.agentId !== agent.id) {
      throw new AuthError("not_found", "Review not found", 404);
    }
    const updated = await prisma.agentReview.update({
      where: { id: reviewId },
      data: {
        agentReplyBody: parsed.data.body,
        agentRepliedAt: new Date(),
      },
    });
    await audit({
      actorId: u.id,
      action: "agent.review.reply",
      entityType: "AgentReview",
      entityId: reviewId,
    });
    return Response.json({ review: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
