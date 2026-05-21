import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { requestPasswordResetSchema } from "@/lib/schemas/auth";
import { sendMail, templates } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: true }); // do not leak validation
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    // Do not reveal whether an email exists.
    return Response.json({ ok: true });
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${base}/reset-password?token=${token}`;
  await sendMail({ to: user.email, ...templates.passwordReset(link) });
  return Response.json({ ok: true });
}
