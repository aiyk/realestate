import Link from "next/link";
import {
  Building2,
  FileEdit,
  Wallet,
  HandCoins,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatBadge } from "@/components/ui/stat-badge";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button";
import { LagosSkyline } from "@/components/illustrations/skylines";
import { PerformanceWidgets } from "@/components/agent/dashboard/performance-widgets";
import { QuickActions } from "@/components/agent/dashboard/quick-actions";
import { ActivityFeed } from "@/components/agent/dashboard/activity-feed";
import { cn, formatNgn } from "@/lib/utils";
import { greet } from "@/lib/voice";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, businessName: true },
  });

  const [
    activeListings,
    drafts,
    paidReservations,
    pendingPayouts,
    totalEarned,
    unreadThreads,
  ] = await Promise.all([
    prisma.listing.count({
      where: { agentId: user.id, status: "PUBLISHED" },
    }),
    prisma.listing.count({
      where: {
        agentId: user.id,
        status: { in: ["DRAFT", "PENDING_REVIEW", "REJECTED"] },
      },
    }),
    prisma.reservation.count({
      where: { listing: { agentId: user.id }, status: "PAID" },
    }),
    prisma.commissionLedger.count({
      where: { agent: { userId: user.id }, status: "PENDING_PAYOUT" },
    }),
    profile
      ? prisma.commissionLedger
          .findMany({
            where: { agentId: profile.id, status: "PAID" },
            select: { netPayoutNgn: true },
          })
          .then((r) => r.reduce((acc, l) => acc + Number(l.netPayoutNgn), 0))
      : 0,
    prisma.messageThread.count({
      where: { participants: { some: { userId: user.id } } },
    }),
  ]);

  const firstName = user.fullName.split(" ")[0];

  const todayLine = (() => {
    const bits: string[] = [];
    if (unreadThreads > 0) bits.push(`${unreadThreads} active conversations`);
    if (paidReservations > 0)
      bits.push(`${paidReservations} paid reservation${paidReservations === 1 ? "" : "s"}`);
    if (pendingPayouts > 0) bits.push(`${pendingPayouts} payout${pendingPayouts === 1 ? "" : "s"} queued`);
    if (drafts > 0) bits.push(`${drafts} draft${drafts === 1 ? "" : "s"} to finish`);
    if (bits.length === 0) return "Quiet day. Good time to publish a fresh listing.";
    return bits.join(" · ");
  })();

  return (
    <section>
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 p-6 sm:p-8">
        <LagosSkyline className="absolute inset-x-0 bottom-0 h-16 text-emerald-700/15" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Agent dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">
            {greet(firstName)}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {profile?.businessName ?? user.fullName}
          </p>
          <div className="mt-4 max-w-2xl">
            <SpeechBubble
              from="concierge"
              avatar="·"
              author="Concierge"
              role="Realestate"
            >
              {todayLine}
            </SpeechBubble>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
          This week
        </p>
        <PerformanceWidgets
          agentUserId={user.id}
          agentProfileId={profile?.id ?? null}
        />
      </div>

      <div className="mt-8">
        <QuickActions agentUserId={user.id} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/agent/listings?status=PUBLISHED">
          <StatBadge
            icon={<Building2 className="h-4 w-4" />}
            label="Active listings"
            value={activeListings}
            sub="visible to buyers"
            tone="emerald"
          />
        </Link>
        <Link href="/agent/listings">
          <StatBadge
            icon={<FileEdit className="h-4 w-4" />}
            label="Drafts / review"
            value={drafts}
            sub="finish + submit"
            tone="amber"
          />
        </Link>
        <Link href="/agent/reservations">
          <StatBadge
            icon={<Wallet className="h-4 w-4" />}
            label="Paid reservations"
            value={paidReservations}
            sub="follow up today"
            tone="stone"
          />
        </Link>
        <Link href="/agent/earnings">
          <StatBadge
            icon={<HandCoins className="h-4 w-4" />}
            label="Pending payouts"
            value={pendingPayouts}
            sub={totalEarned > 0 ? `${formatNgn(totalEarned)} paid lifetime` : "queued for transfer"}
            tone="ink"
          />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Callout
          tone="tip"
          title="Listings that win"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Photos shot in daylight, three-paragraph description with the
          neighbourhood vibe, and a price that explains itself. Listings
          ticking those boxes convert 2× faster.
          <Link
            href="/agent/listings/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-4",
            )}
          >
            Create a new listing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Callout>

        <Callout
          tone="concierge"
          title="Buyers are waiting"
          icon={<MessageCircle className="h-5 w-5" />}
        >
          You have {unreadThreads} active conversation
          {unreadThreads === 1 ? "" : "s"}. Replying within an hour doubles
          the chance of a viewing.
          <Link
            href="/agent/messages"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-4",
            )}
          >
            Open inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Callout>
      </div>

      <div className="mt-10">
        <ActivityFeed agentUserId={user.id} />
      </div>
    </section>
  );
}
