import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatNgn } from "@/lib/utils";
import { ReservationActions } from "@/components/reservations/reservation-actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING: "warning",
  PAID: "success",
  EXPIRED: "secondary",
  CANCELLED: "danger",
  CONVERTED: "outline",
} as const;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminReservationsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const where =
    status && status in STATUS_VARIANT
      ? { status: status as keyof typeof STATUS_VARIANT }
      : {};
  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, slug: true } },
      buyer: { select: { fullName: true, email: true } },
    },
    take: 100,
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold">Reservations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {reservations.length} {status ? `with status ${status}` : "recent"}
      </p>
      {reservations.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-input p-12 text-center text-sm text-muted-foreground">
          No reservations.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{r.listing.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.buyer.fullName} · {r.buyer.email}
                  </p>
                  <p className="mt-1 text-sm">
                    Deposit: <strong>{formatNgn(r.depositNgn.toString())}</strong>{" "}
                    · Ref <code>{r.reference}</code>
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </div>
              {(r.status === "PAID" || r.status === "PENDING") && (
                <ReservationActions
                  id={r.id}
                  status={r.status}
                  allowConvert
                  allowCancel
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
