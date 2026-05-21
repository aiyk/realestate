import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { profileFaqsSchema } from "@/lib/schemas/agent";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAgent();
    const body = await req.json();
    const parsed = profileFaqsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const profile = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) {
      throw new AuthError("not_found", "Agent profile not found", 404);
    }
    await prisma.$transaction([
      prisma.agentFaq.deleteMany({ where: { agentId: profile.id } }),
      prisma.agentFaq.createMany({
        data: parsed.data.faqs.map((f, idx) => ({
          agentId: profile.id,
          question: f.question,
          answer: f.answer,
          isPublished: f.isPublished ?? true,
          sortOrder: idx,
        })),
      }),
    ]);
    await audit({
      actorId: user.id,
      action: "agent.profile.faqs.replace",
      entityType: "AgentProfile",
      entityId: profile.id,
      meta: { count: parsed.data.faqs.length },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
