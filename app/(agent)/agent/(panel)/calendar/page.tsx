import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Callout } from "@/components/ui/callout";

export const dynamic = "force-dynamic";

function formatDay(d: Date) {
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default async function AgentCalendarPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/calendar");
  if (u.role !== "AGENT") redirect("/agent");

  const now = new Date();
  const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  const [openHouses, visits, leadFollowUps] = await Promise.all([
    prisma.openHouse.findMany({
      where: {
        listing: { agentId: u.id },
        startsAt: { gte: now, lte: horizon },
        cancelledAt: null,
      },
      orderBy: { startsAt: "asc" },
      include: { listing: { select: { title: true, slug: true } } },
    }),
    prisma.visitRequest.findMany({
      where: {
        listing: { agentId: u.id },
        status: { in: ["CONFIRMED", "REQUESTED"] },
        slotStartsAt: { gte: now, lte: horizon },
      },
      orderBy: { slotStartsAt: "asc" },
      include: { listing: { select: { title: true, slug: true } } },
    }),
    prisma.lead.findMany({
      where: {
        agentId: u.id,
        followUpAt: { gte: now, lte: horizon },
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
      },
      orderBy: { followUpAt: "asc" },
      select: {
        id: true,
        buyerName: true,
        followUpAt: true,
        listing: { select: { title: true } },
      },
    }),
  ]);

  type Event = {
    id: string;
    kind: "OPEN_HOUSE" | "VISIT" | "FOLLOWUP";
    title: string;
    subtitle: string;
    startsAt: Date;
    endsAt?: Date;
  };
  const events: Event[] = [
    ...openHouses.map((o) => ({
      id: `oh:${o.id}`,
      kind: "OPEN_HOUSE" as const,
      title: `Open house — ${o.listing.title}`,
      subtitle: o.notes ?? "Open house slot",
      startsAt: o.startsAt,
      endsAt: o.endsAt,
    })),
    ...visits.flatMap((v) =>
      v.slotStartsAt
        ? [
            {
              id: `vr:${v.id}`,
              kind: "VISIT" as const,
              title: `Viewing — ${v.listing.title}`,
              subtitle: v.notes ?? "Buyer viewing",
              startsAt: v.slotStartsAt,
              endsAt: v.slotEndsAt ?? undefined,
            },
          ]
        : [],
    ),
    ...leadFollowUps.map((l) => ({
      id: `lf:${l.id}`,
      kind: "FOLLOWUP" as const,
      title: `Follow up with ${l.buyerName}`,
      subtitle: l.listing?.title ?? "General follow-up",
      startsAt: l.followUpAt!,
    })),
  ].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            What&apos;s coming up
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open houses, viewings, and follow-ups across all your listings —
            next 30 days.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card p-12 text-center">
          <CalendarDays className="mx-auto h-16 w-16 text-text-subtle" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            Nothing scheduled
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Open houses, confirmed viewings, and lead follow-ups will appear
            here.
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[140px_1fr]"
            >
              <div className="text-xs">
                <p className="font-semibold text-foreground">
                  {formatDay(e.startsAt)}
                </p>
                <p className="text-muted-foreground">
                  {formatTime(e.startsAt)}
                  {e.endsAt ? `–${formatTime(e.endsAt)}` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.subtitle}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Callout tone="info" title="Sync with Google Calendar" className="mt-8">
        Add the ICS feed to your calendar app to see these events alongside the
        rest of your week. (Coming soon.)
      </Callout>
    </section>
  );
}
