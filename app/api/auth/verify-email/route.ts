import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return Response.redirect(new URL("/verify-email?error=missing", req.url));

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    return Response.redirect(new URL("/verify-email?error=invalid", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });
  await audit({
    actorId: user.id,
    action: "user.email_verified",
    entityType: "User",
    entityId: user.id,
  });

  return Response.redirect(new URL("/verify-email?ok=1", req.url));
}
