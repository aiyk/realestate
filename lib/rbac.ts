import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { UserRole, KycStatus } from "@prisma/client";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  kycStatus: KycStatus;
  emailVerified: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      kycStatus: true,
      emailVerified: true,
    },
  });
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    kycStatus: u.kycStatus,
    emailVerified: u.emailVerified !== null,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new AuthError("unauthenticated", "Sign in required", 401);
  return u;
}

export async function requireEmailVerified(): Promise<SessionUser> {
  const u = await requireAuth();
  if (!u.emailVerified) {
    throw new AuthError("email_unverified", "Verify your email first", 403);
  }
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireAuth();
  if (u.role !== "ADMIN") {
    throw new AuthError("forbidden", "Admin access required", 403);
  }
  return u;
}

export async function requireAgent(): Promise<SessionUser> {
  const u = await requireAuth();
  if (u.role !== "AGENT") {
    throw new AuthError("forbidden", "Agent access required", 403);
  }
  return u;
}

export async function requireBuyer(): Promise<SessionUser> {
  const u = await requireAuth();
  if (u.role !== "BUYER") {
    throw new AuthError("forbidden", "Buyer access required", 403);
  }
  return u;
}

export async function requireKyc(): Promise<SessionUser> {
  const u = await requireEmailVerified();
  if (u.kycStatus !== "VERIFIED") {
    throw new AuthError("kyc_required", "KYC verification required", 403);
  }
  return u;
}

export async function requireListingOwnership(
  listingId: string,
): Promise<SessionUser> {
  const u = await requireAuth();
  if (u.role === "ADMIN") return u;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { agentId: true },
  });
  if (!listing) throw new AuthError("not_found", "Listing not found", 404);
  if (listing.agentId !== u.id) {
    throw new AuthError("forbidden", "Not the listing owner", 403);
  }
  return u;
}

export async function requireThreadParticipant(
  threadId: string,
): Promise<SessionUser> {
  const u = await requireAuth();
  if (u.role === "ADMIN") return u;
  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId: u.id } },
    select: { id: true },
  });
  if (!participant) {
    throw new AuthError("forbidden", "Not a thread participant", 403);
  }
  return u;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return Response.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return Response.json(
    { error: { code: "internal", message } },
    { status: 500 },
  );
}
