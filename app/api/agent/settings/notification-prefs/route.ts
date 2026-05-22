import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const channelSchema = z.object({
  in_app: z.boolean().default(true),
  email: z.boolean().default(false),
});

const prefsSchema = z.record(z.string(), channelSchema);

export async function GET() {
  try {
    const u = await requireAgent();
    const row = await prisma.agentNotificationPref.findUnique({
      where: { userId: u.id },
    });
    return Response.json({ prefs: row?.prefs ?? {} });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const u = await requireAgent();
    const body = await req.json();
    const parsed = prefsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    await prisma.agentNotificationPref.upsert({
      where: { userId: u.id },
      create: { userId: u.id, prefs: parsed.data as object },
      update: { prefs: parsed.data as object },
    });
    await audit({
      actorId: u.id,
      action: "agent.notifications.prefs.update",
      entityType: "AgentNotificationPref",
      entityId: u.id,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
