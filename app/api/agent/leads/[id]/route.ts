import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "LOST"]).optional(),
  followUpAt: z.string().datetime().nullable().optional(),
  lostReason: z.string().max(400).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const u = await requireAgent();
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        listing: { select: { title: true, slug: true } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { fullName: true } } },
        },
        thread: { select: { id: true } },
      },
    });
    if (!lead || lead.agentId !== u.id) {
      throw new AuthError("not_found", "Lead not found", 404);
    }
    return Response.json({ lead });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const u = await requireAgent();
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { agentId: true, status: true },
    });
    if (!existing || existing.agentId !== u.id) {
      throw new AuthError("not_found", "Lead not found", 404);
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.status) {
      data.status = parsed.data.status;
      if (parsed.data.status !== "NEW" && existing.status === "NEW") {
        data.lastContactedAt = new Date();
      }
    }
    if (parsed.data.followUpAt !== undefined) {
      data.followUpAt = parsed.data.followUpAt
        ? new Date(parsed.data.followUpAt)
        : null;
    }
    if (parsed.data.lostReason !== undefined) {
      data.lostReason = parsed.data.lostReason;
    }
    const lead = await prisma.lead.update({ where: { id }, data });
    await audit({
      actorId: u.id,
      action: "agent.lead.update",
      entityType: "Lead",
      entityId: id,
      meta: parsed.data,
    });
    return Response.json({ lead });
  } catch (err) {
    return errorResponse(err);
  }
}
