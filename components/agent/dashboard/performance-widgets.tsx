import { Clock, Eye, Target, Users } from "lucide-react";
import { prisma } from "@/lib/db";

type Props = {
  agentUserId: string;
  agentProfileId: string | null;
};

export async function PerformanceWidgets({
  agentUserId,
  agentProfileId,
}: Props) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [leadsThisWeek, viewingsScheduled, viewsThisWeek, profile] =
    await Promise.all([
      prisma.lead.count({
        where: { agentId: agentUserId, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.visitRequest.count({
        where: {
          listing: { agentId: agentUserId },
          status: "CONFIRMED",
          slotStartsAt: { gte: now },
        },
      }),
      prisma.listingAnalyticsEvent.count({
        where: {
          listing: { agentId: agentUserId },
          kind: "LISTING_VIEW",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      agentProfileId
        ? prisma.agentProfile.findUnique({
            where: { id: agentProfileId },
            select: { responseTimeMinutes: true },
          })
        : null,
    ]);

  const responseTime = profile?.responseTimeMinutes;

  type Tile = {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  };
  const tiles: Tile[] = [
    {
      icon: <Users className="h-4 w-4 text-emerald-700" />,
      label: "New leads (7d)",
      value: leadsThisWeek,
    },
    {
      icon: <Target className="h-4 w-4 text-amber-700" />,
      label: "Viewings on the books",
      value: viewingsScheduled,
    },
    {
      icon: <Eye className="h-4 w-4 text-stone-700" />,
      label: "Listing views (7d)",
      value: viewsThisWeek,
    },
    {
      icon: <Clock className="h-4 w-4 text-stone-700" />,
      label: "Avg reply",
      value: responseTime
        ? responseTime < 60
          ? `${responseTime}m`
          : `${Math.round(responseTime / 60)}h`
        : "—",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            {t.icon}
            {t.label}
          </div>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{t.value}</p>
        </div>
      ))}
    </div>
  );
}
