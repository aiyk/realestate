import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export async function GET(_: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return new Response("Invalid token", { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { icsToken: token },
    select: { id: true, fullName: true },
  });
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90);

  const [openHouses, visits, followUps] = await Promise.all([
    prisma.openHouse.findMany({
      where: {
        listing: { agentId: user.id },
        startsAt: { gte: now, lte: horizon },
        cancelledAt: null,
      },
      include: { listing: { select: { title: true, addressLine: true } } },
    }),
    prisma.visitRequest.findMany({
      where: {
        listing: { agentId: user.id },
        status: "CONFIRMED",
        slotStartsAt: { gte: now, lte: horizon },
      },
      include: { listing: { select: { title: true, addressLine: true } } },
    }),
    prisma.lead.findMany({
      where: {
        agentId: user.id,
        followUpAt: { gte: now, lte: horizon },
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
      },
      select: {
        id: true,
        buyerName: true,
        followUpAt: true,
        listing: { select: { title: true } },
      },
    }),
  ]);

  type Event = {
    uid: string;
    summary: string;
    description: string;
    location?: string;
    startsAt: Date;
    endsAt: Date;
  };
  const events: Event[] = [
    ...openHouses.map((o) => ({
      uid: `oh-${o.id}@realestate.ng`,
      summary: `Open house — ${o.listing.title}`,
      description: o.notes ?? "Open house",
      location: o.listing.addressLine,
      startsAt: o.startsAt,
      endsAt: o.endsAt,
    })),
    ...visits.flatMap((v) =>
      v.slotStartsAt
        ? [
            {
              uid: `vr-${v.id}@realestate.ng`,
              summary: `Viewing — ${v.listing.title}`,
              description: v.notes ?? "Buyer viewing",
              location: v.listing.addressLine,
              startsAt: v.slotStartsAt,
              endsAt: v.slotEndsAt ?? new Date(v.slotStartsAt.getTime() + 60 * 60 * 1000),
            },
          ]
        : [],
    ),
    ...followUps
      .filter((f) => f.followUpAt)
      .map((f) => ({
        uid: `lf-${f.id}@realestate.ng`,
        summary: `Follow up with ${f.buyerName}`,
        description: f.listing?.title ?? "Lead follow-up",
        startsAt: f.followUpAt!,
        endsAt: new Date(f.followUpAt!.getTime() + 30 * 60 * 1000),
      })),
  ];

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Realestate//Agent Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Realestate · ${escapeIcs(user.fullName)}`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(e.startsAt)}`,
      `DTEND:${formatIcsDate(e.endsAt)}`,
      `SUMMARY:${escapeIcs(e.summary)}`,
      `DESCRIPTION:${escapeIcs(e.description)}`,
      e.location ? `LOCATION:${escapeIcs(e.location)}` : "",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
