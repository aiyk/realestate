import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { profileSpecialtiesSchema } from "@/lib/schemas/agent";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAgent();
    const body = await req.json();
    const parsed = profileSpecialtiesSchema.safeParse(body);
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
    const unique = Array.from(new Set(parsed.data.specialties));
    await prisma.$transaction([
      prisma.agentSpecialty.deleteMany({ where: { agentId: profile.id } }),
      prisma.agentSpecialty.createMany({
        data: unique.map((propertyType) => ({
          agentId: profile.id,
          propertyType,
        })),
        skipDuplicates: true,
      }),
    ]);
    await audit({
      actorId: user.id,
      action: "agent.profile.specialties.replace",
      entityType: "AgentProfile",
      entityId: profile.id,
      meta: { count: unique.length },
    });
    return Response.json({ ok: true, specialties: unique });
  } catch (err) {
    return errorResponse(err);
  }
}
