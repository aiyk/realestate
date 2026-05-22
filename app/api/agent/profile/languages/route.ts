import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { profileLanguagesSchema } from "@/lib/schemas/agent";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAgent();
    const body = await req.json();
    const parsed = profileLanguagesSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const unique = Array.from(
      new Set(parsed.data.languages.map((l) => l.trim())),
    ).filter(Boolean);
    const updated = await prisma.agentProfile.update({
      where: { userId: user.id },
      data: { languages: unique },
      select: { id: true, languages: true },
    });
    await audit({
      actorId: user.id,
      action: "agent.profile.languages.replace",
      entityType: "AgentProfile",
      entityId: updated.id,
      meta: { count: unique.length },
    });
    return Response.json({ ok: true, languages: updated.languages });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse(
        new AuthError("not_found", "Agent profile not found", 404),
      );
    }
    return errorResponse(err);
  }
}
