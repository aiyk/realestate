import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { profileServiceAreasSchema } from "@/lib/schemas/agent";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAgent();
    const body = await req.json();
    const parsed = profileServiceAreasSchema.safeParse(body);
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
    const dedup = new Map<string, (typeof parsed.data.serviceAreas)[number]>();
    for (const a of parsed.data.serviceAreas) {
      const key = `${a.city.toLowerCase()}|${a.state.toLowerCase()}`;
      if (!dedup.has(key)) dedup.set(key, a);
    }
    const rows = Array.from(dedup.values());
    await prisma.$transaction([
      prisma.agentServiceArea.deleteMany({ where: { agentId: profile.id } }),
      prisma.agentServiceArea.createMany({
        data: rows.map((a) => ({
          agentId: profile.id,
          city: a.city,
          state: a.state,
          radiusKm: a.radiusKm ?? null,
          isPrimary: a.isPrimary ?? false,
        })),
        skipDuplicates: true,
      }),
    ]);
    await audit({
      actorId: user.id,
      action: "agent.profile.serviceAreas.replace",
      entityType: "AgentProfile",
      entityId: profile.id,
      meta: { count: rows.length },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
