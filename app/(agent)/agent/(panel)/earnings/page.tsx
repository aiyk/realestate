import { CheckCircle2, Clock, Hourglass, ArrowRight, HandCoins, Download } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { StatBadge } from "@/components/ui/stat-badge";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button";
import { NoEarnings } from "@/components/illustrations/empty-states";
import { cn, formatNgn } from "@/lib/utils";
import { statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING_PAYOUT: "warning",
  PROCESSING: "secondary",
  PAID: "success",
  CANCELLED: "danger",
  ON_HOLD: "warning",
} as const;

export default async function AgentEarningsPage() {
  const u = await getSessionUser();
  if (!u) return null;

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: u.id },
    select: { id: true },
  });
  if (!profile) return null;

  const ledgers = await prisma.commissionLedger.findMany({
    where: { agentId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true, slug: true } } },
  });

  const totals = ledgers.reduce(
    (acc, l) => {
      const net = Number(l.netPayoutNgn);
      if (l.status === "PAID") acc.paid += net;
      else if (l.status === "PROCESSING") acc.processing += net;
      else if (l.status === "PENDING_PAYOUT" || l.status === "ON_HOLD")
        acc.pending += net;
      return acc;
    },
    { paid: 0, pending: 0, processing: 0 },
  );

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Money in motion
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Earnings &amp; payouts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Every commission entry, every transfer, with the breakdown spelled
            out — sale, commission %, platform fee, your net.
          </p>
        </div>
        {ledgers.length > 0 && (
          <a
            href="/api/agent/earnings/statement.csv"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="h-3 w-3" />
            Download CSV
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatBadge
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Paid out"
          value={formatNgn(totals.paid)}
          sub="lifetime total"
          tone="emerald"
        />
        <StatBadge
          icon={<Clock className="h-4 w-4" />}
          label="Processing"
          value={formatNgn(totals.processing)}
          sub="Paystack is moving it"
          tone="amber"
        />
        <StatBadge
          icon={<Hourglass className="h-4 w-4" />}
          label="Pending"
          value={formatNgn(totals.pending)}
          sub="queued for next batch"
          tone="stone"
        />
      </div>

      {ledgers.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card p-12 text-center">
          <NoEarnings className="mx-auto h-32" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            First sale is on the way
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground text-pretty">
            Commission entries land here the moment a reservation converts.
            You&apos;ll see the breakdown — sale, commission, platform fee,
            your net — and the day it lands in your account.
          </p>
          <Link
            href="/agent/listings"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
          >
            See my listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Sale</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Platform fee</th>
                  <th className="px-4 py-3">Net payout</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-2/60">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/listings/${l.listing.slug}`}
                        className="hover:text-primary"
                      >
                        {l.listing.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatNgn(l.salePriceNgn.toString())}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatNgn(l.agentCommissionNgn.toString())}{" "}
                      <span className="text-xs text-text-subtle">
                        ({Number(l.agentCommissionPct)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatNgn(l.platformFeeNgn.toString())}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatNgn(l.netPayoutNgn.toString())}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[l.status]}>
                        {l.status.replace("_", " ")}
                      </Badge>
                      {statusBlurb(l.status) && (
                        <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
                          {statusBlurb(l.status)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.paidAt
                        ? l.paidAt.toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout
            tone="tip"
            title="When do payouts run?"
            icon={<HandCoins className="h-5 w-5" />}
            className="mt-6"
          >
            Admin batches payouts most weekday afternoons. Paystack typically
            settles overnight. You&apos;ll see entries flip from PENDING →
            PROCESSING → PAID right here, with a date stamp on each step.
          </Callout>
        </>
      )}
    </section>
  );
}
