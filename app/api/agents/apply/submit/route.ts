import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireKyc } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function POST() {
  try {
    const user = await requireKyc();
    const profile = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new AuthError(
        "no_profile",
        "Complete previous steps first",
        400,
      );
    }
    if (!profile.bankCode || !profile.bankAccountNo) {
      throw new AuthError(
        "missing_payout",
        "Complete the payout step first",
        400,
      );
    }
    if (profile.status !== "PENDING" && profile.status !== "REJECTED") {
      return Response.json(
        { error: { code: "invalid_state" } },
        { status: 409 },
      );
    }

    const updated = await prisma.agentProfile.update({
      where: { id: profile.id },
      data: { status: "PENDING", rejectionReason: null },
    });

    await audit({
      actorId: user.id,
      action: "agent.submit",
      entityType: "AgentProfile",
      entityId: profile.id,
    });

    return Response.json({ profile: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
