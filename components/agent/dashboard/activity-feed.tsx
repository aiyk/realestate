import Link from "next/link";
import {
  Activity,
  Eye,
  MessageCircle,
  UserPlus,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/db";

type Props = { agentUserId: string };

type FeedItem = {
  id: string;
  icon: React.ReactNode;
  body: React.ReactNode;
  at: Date;
};

function timeAgo(now: number, date: Date) {
  const ms = now - date.getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export async function ActivityFeed({ agentUserId }: Props) {
  // Server components inherently hit DB / system clock — this is a safe boundary.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const sinceMs = 14 * 24 * 60 * 60 * 1000;
  const since = new Date(nowMs - sinceMs);

  const [leads, reservations, recentViewsByListing] = await Promise.all([
    prisma.lead.findMany({
      where: { agentId: agentUserId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        buyerName: true,
        kind: true,
        createdAt: true,
        listing: { select: { title: true } },
      },
    }),
    prisma.reservation.findMany({
      where: {
        listing: { agentId: agentUserId },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        buyer: { select: { fullName: true } },
        listing: { select: { title: true } },
      },
    }),
    prisma.listingAnalyticsEvent.groupBy({
      by: ["listingId"],
      where: {
        listing: { agentId: agentUserId },
        kind: "LISTING_VIEW",
        createdAt: { gte: since },
      },
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 4,
    }),
  ]);

  const viewListings = recentViewsByListing.length
    ? await prisma.listing.findMany({
        where: { id: { in: recentViewsByListing.map((r) => r.listingId) } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const titleById = new Map(viewListings.map((l) => [l.id, l.title]));

  const items: FeedItem[] = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      icon: <UserPlus className="h-4 w-4 text-primary" />,
      at: l.createdAt,
      body: (
        <>
          <Link
            href={`/agent/leads/${l.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {l.buyerName}
          </Link>{" "}
          {l.kind === "VISIT_REQUEST"
            ? "requested a viewing"
            : l.kind === "RESERVATION"
              ? "reserved a listing"
              : "sent an inquiry"}
          {l.listing ? (
            <>
              {" "}
              · <span className="text-muted-foreground">{l.listing.title}</span>
            </>
          ) : null}
        </>
      ),
    })),
    ...reservations.map((r) => ({
      id: `res-${r.id}`,
      icon: <Wallet className="h-4 w-4 text-accent" />,
      at: r.createdAt,
      body: (
        <>
          <span className="font-medium text-foreground">{r.buyer.fullName}</span>{" "}
          {r.status === "PAID" || r.status === "CONVERTED"
            ? "paid a deposit on"
            : "started a reservation on"}{" "}
          <span className="text-muted-foreground">{r.listing.title}</span>
        </>
      ),
    })),
    ...recentViewsByListing.flatMap((g) => {
      const title = titleById.get(g.listingId);
      if (!title || !g._max.createdAt) return [];
      return [
        {
          id: `views-${g.listingId}`,
          icon: <Eye className="h-4 w-4 text-muted-foreground" />,
          at: g._max.createdAt,
          body: (
            <>
              <span className="text-muted-foreground">{title}</span>{" "}
              picked up {g._count._all} view{g._count._all === 1 ? "" : "s"}
            </>
          ),
        } satisfies FeedItem,
      ];
    }),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);

  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Activity className="h-3 w-3" />
        Recent activity
      </p>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-center text-sm text-muted-foreground">
          <MessageCircle className="mx-auto mb-2 h-6 w-6 text-text-subtle" />
          Nothing happened in the last two weeks. Quiet stretch.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2">
                {it.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{it.body}</p>
                <p className="mt-0.5 text-[11px] text-text-subtle">{timeAgo(nowMs, it.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
