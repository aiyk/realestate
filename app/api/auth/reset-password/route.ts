import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", issues: parsed.error.issues } },
      { status: 400 },
    );
  }
  const { token, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return Response.json(
      { error: { code: "invalid_token", message: "Token invalid or expired" } },
      { status: 400 },
    );
  }
  const passwordHash = await hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  await audit({
    actorId: user.id,
    action: "user.password_reset",
    entityType: "User",
    entityId: user.id,
  });
  return Response.json({ ok: true });
}
