import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/rbac";

const SALT = process.env.ANALYTICS_VISITOR_SALT ?? "dev-analytics-salt";

const schema = z.object({
  kind: z.enum([
    "LISTING_VIEW",
    "LISTING_FAVORITED",
    "LISTING_SHARED",
    "LISTING_CONTACT_CLICK",
    "LISTING_PHONE_REVEAL",
    "LISTING_VIRTUAL_TOUR_OPEN",
  ]),
});

type Params = { params: Promise<{ id: string }> };

function visitorHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ua = req.headers.get("user-agent")?.slice(0, 200) ?? "";
  return createHash("sha256").update(`${ip}|${ua}|${SALT}`).digest("hex");
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input" } },
        { status: 400 },
      );
    }
    const exists = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!exists) {
      return Response.json({ ok: true }); // 200 anyway to discourage probing
    }
    if (!["PUBLISHED", "RESERVED", "SOLD"].includes(exists.status)) {
      return Response.json({ ok: true });
    }
    const hash = visitorHash(req);
    await prisma.listingAnalyticsEvent.create({
      data: {
        listingId: id,
        kind: parsed.data.kind,
        visitorHash: hash,
        referrer: req.headers.get("referer")?.slice(0, 300) ?? null,
      },
    });
    if (parsed.data.kind === "LISTING_VIEW") {
      await prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
