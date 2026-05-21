import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { rejectAgentSchema } from "@/lib/schemas/agent";
import { sendMail, templates } from "@/lib/mailer";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = rejectAgentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const profile = await prisma.agentProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!profile) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    await prisma.agentProfile.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: parsed.data.reason,
      },
    });
    await audit({
      actorId: admin.id,
      action: "agent.reject",
      entityType: "AgentProfile",
      entityId: profile.id,
      meta: { reason: parsed.data.reason },
    });
    await sendMail({
      to: profile.user.email,
      ...templates.agentRejected(profile.businessName, parsed.data.reason),
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
