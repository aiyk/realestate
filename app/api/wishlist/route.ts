import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Wishlist capture — marketing-surface email signups.
 *
 * No DB write yet (a follow-up will add a `Wishlist` Prisma model). We
 * log the submission so it shows up in operational logs, and we always
 * respond 200 so the AskBox component never shows a dead-end state.
 */
export async function POST(req: Request) {
  let payload: { email?: string; query?: string; context?: string } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    // bad JSON — still respond friendly
  }

  if (payload.email) {
    logger.info("wishlist signup", {
      scope: "wishlist",
      email: payload.email,
      query: payload.query?.slice(0, 200),
      context: payload.context?.slice(0, 200),
    });
  }

  return NextResponse.json({ ok: true });
}
