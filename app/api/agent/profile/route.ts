import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { profileBasicsSchema, profileSocialsSchema } from "@/lib/schemas/agent";

export async function GET() {
  try {
    const user = await requireAgent();
    const profile = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
      include: {
        specialties: true,
        serviceAreas: { orderBy: [{ isPrimary: "desc" }, { state: "asc" }] },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!profile) {
      throw new AuthError("not_found", "Agent profile not found", 404);
    }
    return Response.json({ profile });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAgent();
    const body = await req.json();
    const basicsParsed = profileBasicsSchema.partial().safeParse(body);
    const socialsParsed = profileSocialsSchema.partial().safeParse(body);
    if (!basicsParsed.success && !socialsParsed.success) {
      return Response.json(
        {
          error: {
            code: "invalid_input",
            issues: basicsParsed.error?.issues ?? socialsParsed.error?.issues,
          },
        },
        { status: 400 },
      );
    }
    const data: Record<string, unknown> = {
      ...(basicsParsed.success ? basicsParsed.data : {}),
      ...(socialsParsed.success ? socialsParsed.data : {}),
    };
    const before = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
      select: { businessName: true },
    });
    if (!before) {
      throw new AuthError("not_found", "Agent profile not found", 404);
    }
    if (
      typeof data.businessName === "string" &&
      data.businessName !== before.businessName
    ) {
      data.businessNameLastChangedAt = new Date();
      await audit({
        actorId: user.id,
        action: "agent.profile.businessNameChange",
        entityType: "AgentProfile",
        entityId: user.id,
        meta: { from: before.businessName, to: data.businessName },
      });
    }
    const updated = await prisma.agentProfile.update({
      where: { userId: user.id },
      data,
    });
    await audit({
      actorId: user.id,
      action: "agent.profile.update",
      entityType: "AgentProfile",
      entityId: updated.id,
      meta: { fields: Object.keys(data) },
    });
    return Response.json({ profile: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
