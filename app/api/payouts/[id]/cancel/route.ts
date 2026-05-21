import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const schema = z.object({ reason: z.string().min(5).max(500) });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const ledger = await prisma.commissionLedger.findUnique({ where: { id } });
    if (!ledger) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    if (ledger.status === "PROCESSING") {
      return Response.json(
        { error: { code: "payout_in_progress" } },
        { status: 409 },
      );
    }
    await prisma.commissionLedger.update({
      where: { id },
      data: {
        status: "CANCELLED",
        notes: parsed.data.reason,
      },
    });
    await audit({
      actorId: admin.id,
      action: "payout.cancel",
      entityType: "CommissionLedger",
      entityId: id,
      meta: { reason: parsed.data.reason },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
