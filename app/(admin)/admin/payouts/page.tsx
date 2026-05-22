import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatNgn } from "@/lib/utils";
import { PayoutActions } from "./payout-actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING_PAYOUT: "warning",
  PROCESSING: "secondary",
  PAID: "success",
  CANCELLED: "danger",
  ON_HOLD: "warning",
} as const;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminPayoutsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const where =
    status && status in STATUS_VARIANT
      ? { status: status as keyof typeof STATUS_VARIANT }
      : {};
  const rows = await prisma.commissionLedger.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true } },
      agent: {
        select: {
          businessName: true,
          bankAccountName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold">Commission payouts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {rows.length} {status ? `with status ${status}` : "ledger entries"}
      </p>
      {rows.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-input p-12 text-center text-sm text-muted-foreground">
          No payouts.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.listing.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.agent?.businessName ?? "Platform-listed (no agent)"}
                    {r.agent?.bankAccountName && (
                      <> · {r.agent.bankAccountName}</>
                    )}
                    {r.agent?.user?.email && <> · {r.agent.user.email}</>}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                    <span className="text-muted-foreground">Sale</span>
                    <span>{formatNgn(r.salePriceNgn.toString())}</span>
                    <span className="text-muted-foreground">
                      Agent ({Number(r.agentCommissionPct)}%)
                    </span>
                    <span>{formatNgn(r.agentCommissionNgn.toString())}</span>
                    <span className="text-muted-foreground">
                      Platform fee ({Number(r.platformFeePct)}%)
                    </span>
                    <span>{formatNgn(r.platformFeeNgn.toString())}</span>
                    <span className="text-muted-foreground">Net payout</span>
                    <span className="font-medium">
                      {formatNgn(r.netPayoutNgn.toString())}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Notes: {r.notes}
                    </p>
                  )}
                  {r.paystackTransferRef && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Transfer ref: <code>{r.paystackTransferRef}</code>
                    </p>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace("_", " ")}</Badge>
              </div>
              {(r.status === "PENDING_PAYOUT" || r.status === "ON_HOLD") && r.agent && (
                <PayoutActions id={r.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
