import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/schemas/auth";
import { audit } from "@/lib/audit";
import { sendMail, templates } from "@/lib/mailer";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", issues: parsed.error.issues } },
      { status: 400 },
    );
  }
  const { email, password, fullName, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { error: { code: "email_exists", message: "Email already registered" } },
      { status: 409 },
    );
  }

  const passwordHash = await hash(password, 12);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      role: "BUYER",
      emailVerifyToken: token,
      emailVerifyExpires: expires,
    },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${base}/verify-email?token=${token}`;
  await sendMail({ to: email, ...templates.verifyEmail(link) });
  logger.info("signup created", { userId: user.id });
  await audit({
    actorId: user.id,
    action: "user.signup",
    entityType: "User",
    entityId: user.id,
  });

  return Response.json({ ok: true });
}
