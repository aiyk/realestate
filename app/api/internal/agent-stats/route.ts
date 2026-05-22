import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

function authorized(req: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const fromHeader = req.headers.get("x-cron-secret");
  if (fromHeader === CRON_SECRET) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${CRON_SECRET}`) return true;
  return false;
}

type Tier = "TOP_PERFORMER" | "RISING_STAR" | null;

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  return runRecompute();
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  return runRecompute();
}

async function runRecompute(): Promise<Response> {
  const startedAt = Date.now();
  try {
    const approved = await prisma.agentProfile.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        userId: true,
        approvedAt: true,
      },
    });

    if (approved.length === 0) {
      return Response.json({ ok: true, updated: 0, ms: Date.now() - startedAt });
    }

    const userIds = approved.map((a) => a.userId);

    const [listingCounts, soldCounts] = await Promise.all([
      prisma.listing.groupBy({
        by: ["agentId"],
        where: { agentId: { in: userIds }, status: "PUBLISHED" },
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["agentId"],
        where: { agentId: { in: userIds }, status: "SOLD" },
        _count: { _all: true },
      }),
    ]);
    const listingMap = new Map<string, number>();
    for (const r of listingCounts) {
      if (r.agentId) listingMap.set(r.agentId, r._count._all);
    }
    const soldMap = new Map<string, number>();
    for (const r of soldCounts) {
      if (r.agentId) soldMap.set(r.agentId, r._count._all);
    }

    // Response time: median minutes from thread creation to agent's first reply.
    const responseMap = new Map<string, number>();
    for (const a of approved) {
      const threads = await prisma.messageThread.findMany({
        where: { listing: { agentId: a.userId } },
        select: {
          createdAt: true,
          messages: {
            where: { senderId: a.userId },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { createdAt: true },
          },
        },
        take: 200,
      });
      const samples = threads
        .map((t) =>
          t.messages[0]
            ? Math.round(
                (t.messages[0].createdAt.getTime() - t.createdAt.getTime()) /
                  60000,
              )
            : null,
        )
        .filter((v): v is number => typeof v === "number" && v >= 0);
      if (samples.length === 0) continue;
      samples.sort((a, b) => a - b);
      const median = samples[Math.floor(samples.length / 2)];
      responseMap.set(a.id, median);
    }

    // Performance tiers: TOP_PERFORMER = top decile by soldCount (min 1), RISING_STAR = approved in last 90 days with ≥3 listings or ≥1 sold.
    const soldValues = Array.from(soldMap.values()).filter((v) => v > 0);
    soldValues.sort((a, b) => b - a);
    const topThreshold =
      soldValues.length > 0
        ? soldValues[Math.max(0, Math.floor(soldValues.length * 0.1) - 1)]
        : Infinity;

    const now = Date.now();
    const NINETY_DAYS = 1000 * 60 * 60 * 24 * 90;

    let updated = 0;
    for (const a of approved) {
      const live = listingMap.get(a.userId) ?? 0;
      const sold = soldMap.get(a.userId) ?? 0;
      let tier: Tier = null;
      if (sold > 0 && sold >= topThreshold) tier = "TOP_PERFORMER";
      else if (
        a.approvedAt &&
        now - a.approvedAt.getTime() < NINETY_DAYS &&
        (live >= 3 || sold >= 1)
      ) {
        tier = "RISING_STAR";
      }
      await prisma.agentProfile.update({
        where: { id: a.id },
        data: {
          listingCountCache: live,
          soldCountCache: sold,
          responseTimeMinutes: responseMap.get(a.id) ?? null,
          performanceTier: tier,
        },
      });
      updated += 1;
    }

    return Response.json({
      ok: true,
      updated,
      ms: Date.now() - startedAt,
    });
  } catch (err) {
    logger.error("agent-stats recompute failed", { err: String(err) });
    return Response.json(
      { error: { code: "internal", message: String(err) } },
      { status: 500 },
    );
  }
}
