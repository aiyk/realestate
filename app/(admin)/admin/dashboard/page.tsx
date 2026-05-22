import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Clock,
  Users,
  ShieldCheck,
  Wallet,
  HandCoins,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatBadge } from "@/components/ui/stat-badge";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { Callout } from "@/components/ui/callout";
import { greet } from "@/lib/voice";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const u = await getSessionUser();
  if (!u || u.role !== "ADMIN") redirect("/");

  const [
    totalListings,
    pendingReview,
    pendingAgents,
    pendingKyc,
    paidReservations,
    pendingPayouts,
    totalAgents,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.agentProfile.count({ where: { status: "PENDING" } }),
    prisma.kycSubmission.count({ where: { status: "PENDING" } }),
    prisma.reservation.count({ where: { status: "PAID" } }),
    prisma.commissionLedger.count({ where: { status: "PENDING_PAYOUT" } }),
    prisma.agentProfile.count({ where: { status: "APPROVED" } }),
  ]);

  const queueCount =
    pendingReview + pendingAgents + pendingKyc + pendingPayouts;

  const firstName = u.fullName.split(" ")[0];

  return (
    <section>
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface-2 via-white to-primary-soft/60 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Admin dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {greet(firstName)}
        </h1>
        <div className="mt-4 max-w-2xl">
          <SpeechBubble
            from="concierge"
            avatar="·"
            author="Concierge"
            role="Today"
          >
            {queueCount === 0 ? (
              "All clean — nothing waiting on you. Take five."
            ) : (
              <>
                <strong>{queueCount}</strong> thing
                {queueCount === 1 ? "" : "s"} waiting on you:{" "}
                {[
                  pendingReview && `${pendingReview} listing review${pendingReview === 1 ? "" : "s"}`,
                  pendingAgents && `${pendingAgents} agent application${pendingAgents === 1 ? "" : "s"}`,
                  pendingKyc && `${pendingKyc} KYC submission${pendingKyc === 1 ? "" : "s"}`,
                  pendingPayouts && `${pendingPayouts} payout${pendingPayouts === 1 ? "" : "s"} to release`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                .
              </>
            )}
          </SpeechBubble>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/listings">
          <StatBadge
            icon={<Building2 className="h-4 w-4" />}
            label="Total listings"
            value={totalListings}
            sub="across all statuses"
            tone="stone"
          />
        </Link>
        <Link href="/admin/listings?status=PENDING_REVIEW">
          <StatBadge
            icon={<Clock className="h-4 w-4" />}
            label="Awaiting review"
            value={pendingReview}
            sub={pendingReview > 0 ? "needs your eye" : "queue empty"}
            tone={pendingReview > 0 ? "amber" : "stone"}
          />
        </Link>
        <Link href="/admin/agents">
          <StatBadge
            icon={<Users className="h-4 w-4" />}
            label="Agent applications"
            value={pendingAgents}
            sub={`${totalAgents} approved · ${pendingAgents} pending`}
            tone={pendingAgents > 0 ? "amber" : "stone"}
          />
        </Link>
        <Link href="/admin/kyc">
          <StatBadge
            icon={<ShieldCheck className="h-4 w-4" />}
            label="KYC submissions"
            value={pendingKyc}
            sub={pendingKyc > 0 ? "review identities" : "clear"}
            tone={pendingKyc > 0 ? "amber" : "stone"}
          />
        </Link>
        <Link href="/admin/reservations">
          <StatBadge
            icon={<Wallet className="h-4 w-4" />}
            label="Paid reservations"
            value={paidReservations}
            sub="follow conversion"
            tone="emerald"
          />
        </Link>
        <Link href="/admin/payouts">
          <StatBadge
            icon={<HandCoins className="h-4 w-4" />}
            label="Pending payouts"
            value={pendingPayouts}
            sub={pendingPayouts > 0 ? "release the next batch" : "all clear"}
            tone={pendingPayouts > 0 ? "rose" : "stone"}
          />
        </Link>
      </div>

      {queueCount > 0 && (
        <Callout
          tone="warn"
          title="Reminder"
          icon={<AlertTriangle className="h-5 w-5" />}
          className="mt-8"
        >
          Agents and buyers see queue times as platform responsiveness. We
          aim to clear listing reviews under 24 hours and payouts within
          two business days.
          <div className="mt-3 flex flex-wrap gap-2">
            {pendingReview > 0 && (
              <Link
                href="/admin/listings?status=PENDING_REVIEW"
                className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-card px-3 py-1 text-xs font-medium text-accent-soft-foreground hover:bg-accent-soft"
              >
                Review listings <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            {pendingPayouts > 0 && (
              <Link
                href="/admin/payouts"
                className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-card px-3 py-1 text-xs font-medium text-accent-soft-foreground hover:bg-accent-soft"
              >
                Release payouts <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </Callout>
      )}
    </section>
  );
}
