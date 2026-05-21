import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAuth } from "@/lib/rbac";
import { businessStepSchema } from "@/lib/schemas/agent";
import { slugify, shortId } from "@/lib/utils";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = businessStepSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const existing = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
    });

    if (existing && existing.status === "APPROVED") {
      return Response.json(
        { error: { code: "already_approved", message: "You are already an approved agent" } },
        { status: 409 },
      );
    }

    const profile = existing
      ? await prisma.agentProfile.update({
          where: { userId: user.id },
          data: {
            businessName: data.businessName,
            cacNumber: data.cacNumber,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
          },
        })
      : await prisma.agentProfile.create({
          data: {
            userId: user.id,
            slug: `${slugify(data.businessName)}-${shortId(4)}`,
            businessName: data.businessName,
            cacNumber: data.cacNumber,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            status: "PENDING",
          },
        });

    await audit({
      actorId: user.id,
      action: "agent.business_saved",
      entityType: "AgentProfile",
      entityId: profile.id,
    });

    return Response.json({ profile });
  } catch (err) {
    return errorResponse(err);
  }
}
