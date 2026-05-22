import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAgent } from "@/lib/rbac";

const schema = z.object({ body: z.string().min(1).max(2000) });

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u = await requireAgent();
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { agentId: true },
    });
    if (!lead || lead.agentId !== u.id) {
      throw new AuthError("not_found", "Lead not found", 404);
    }
    const note = await prisma.leadNote.create({
      data: { leadId: id, authorId: u.id, body: parsed.data.body },
      include: { author: { select: { fullName: true } } },
    });
    return Response.json({ note }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
