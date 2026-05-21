import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, requireAdmin } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const schema = z.object({ notes: z.string().max(500).optional() });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
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
    if (ledger.status === "PAID") {
      return Response.json({ ok: true, alreadyPaid: true });
    }
    if (ledger.status !== "PENDING_PAYOUT" && ledger.status !== "ON_HOLD") {
      return Response.json(
        { error: { code: "invalid_state" } },
        { status: 409 },
      );
    }
    await prisma.commissionLedger.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        notes: parsed.data.notes ?? ledger.notes,
      },
    });
    await audit({
      actorId: admin.id,
      action: "payout.mark_paid",
      entityType: "CommissionLedger",
      entityId: id,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
