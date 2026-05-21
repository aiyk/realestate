import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AuthError, errorResponse, requireAuth } from "@/lib/rbac";
import { agentReviewSchema } from "@/lib/schemas/agent";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const sp = req.nextUrl.searchParams;
    const cursor = sp.get("cursor") ?? undefined;
    const take = Math.min(20, Number(sp.get("take") ?? 6));

    const agent = await prisma.agentProfile.findUnique({
      where: { slug },
      select: { id: true, ratingAvg: true, ratingCount: true },
    });
    if (!agent) {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }
    const items = await prisma.agentReview.findMany({
      where: { agentId: agent.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: { author: { select: { fullName: true } } },
    });
    const hasMore = items.length > take;
    const rows = hasMore ? items.slice(0, take) : items;
    const breakdown = await prisma.agentReview.groupBy({
      by: ["rating"],
      where: { agentId: agent.id, status: "PUBLISHED" },
      _count: { _all: true },
    });
    return Response.json({
      items: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        agentReplyBody: r.agentReplyBody,
        agentRepliedAt: r.agentRepliedAt,
        createdAt: r.createdAt,
        authorName: r.author.fullName,
      })),
      nextCursor: hasMore ? rows[rows.length - 1].id : null,
      summary: {
        avg: agent.ratingAvg ? Number(agent.ratingAvg) : null,
        count: agent.ratingCount,
        breakdown: [1, 2, 3, 4, 5].map((n) => ({
          rating: n,
          count: breakdown.find((b) => b.rating === n)?._count._all ?? 0,
        })),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const author = await requireAuth();
    const { slug } = await params;
    const body = await req.json();
    const parsed = agentReviewSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }

    const agent = await prisma.agentProfile.findUnique({
      where: { slug },
      select: { id: true, userId: true, ratingAvg: true, ratingCount: true },
    });
    if (!agent) {
      throw new AuthError("not_found", "Agent not found", 404);
    }
    if (agent.userId === author.id) {
      throw new AuthError("forbidden", "Agents can't review themselves", 403);
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parsed.data.reservationId },
      select: {
        id: true,
        buyerId: true,
        status: true,
        listing: { select: { agentId: true } },
      },
    });
    if (!reservation || reservation.buyerId !== author.id) {
      throw new AuthError("not_found", "Reservation not found", 404);
    }
    if (reservation.listing.agentId !== agent.userId) {
      throw new AuthError(
        "forbidden",
        "Reservation is not on this agent's listing",
        403,
      );
    }
    if (
      reservation.status !== "PAID" &&
      reservation.status !== "CONVERTED"
    ) {
      throw new AuthError(
        "invalid_state",
        "Only completed reservations can leave reviews.",
        409,
      );
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.agentReview.create({
        data: {
          agentId: agent.id,
          authorId: author.id,
          reservationId: reservation.id,
          rating: parsed.data.rating,
          body: parsed.data.body ?? null,
        },
      });
      const nextCount = agent.ratingCount + 1;
      const oldAvg = agent.ratingAvg ? Number(agent.ratingAvg) : 0;
      const nextAvg = (oldAvg * agent.ratingCount + parsed.data.rating) / nextCount;
      await tx.agentProfile.update({
        where: { id: agent.id },
        data: {
          ratingAvg: new Prisma.Decimal(nextAvg.toFixed(2)),
          ratingCount: nextCount,
        },
      });
      return created;
    });

    await audit({
      actorId: author.id,
      action: "agent.review.create",
      entityType: "AgentReview",
      entityId: review.id,
      meta: { agentId: agent.id, rating: parsed.data.rating },
    });

    await notify({
      userId: agent.userId,
      type: "SYSTEM",
      title: `New ${parsed.data.rating}★ review`,
      body: parsed.data.body?.slice(0, 140) ?? "A buyer left you a rating.",
      entityType: "AgentReview",
      entityId: review.id,
      actionUrl: `/agents/${slug}#reviews`,
    });

    return Response.json({ review }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
