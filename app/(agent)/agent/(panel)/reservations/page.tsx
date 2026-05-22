import Link from "next/link";
import { ArrowRight, Wallet, Clock } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { NoReservations } from "@/components/illustrations/empty-states";
import { ReservationActions } from "@/components/reservations/reservation-actions";
import { cn, formatNgn } from "@/lib/utils";
import { statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING: "warning",
  PAID: "success",
  EXPIRED: "secondary",
  CANCELLED: "danger",
  CONVERTED: "outline",
} as const;

function timeAgo(date: Date) {
  const ms = Date.now() - date.getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default async function AgentReservationsPage() {
  const u = await getSessionUser();
  if (!u) return null;

  const reservations = await prisma.reservation.findMany({
    where: { listing: { agentId: u.id } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, slug: true } },
      buyer: { select: { fullName: true, email: true } },
    },
  });

  const paidCount = reservations.filter((r) => r.status === "PAID").length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Buyers in motion
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Reservations on your listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            When a buyer pays a deposit, they show up here. Move them through
            to <strong>Converted</strong> once you&apos;ve closed offline.
          </p>
        </div>
      </div>

      {paidCount > 0 && (
        <Callout tone="success" title="Move these forward" className="mt-6">
          {paidCount} deposit{paidCount === 1 ? "" : "s"} have been paid and
          are waiting on you. Send the location pin and book a viewing.
        </Callout>
      )}

      {reservations.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card p-12 text-center">
          <NoReservations className="mx-auto h-32" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            No reservations yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground text-pretty">
            Reservations show up the moment a buyer pays a deposit on one of
            your listings.
          </p>
          <Link
            href="/agent/listings"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
          >
            View my listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {reservations.map((r) => {
            const initials = r.buyer.fullName
              .split(/\s+/)
              .filter(Boolean)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-semibold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/listings/${r.listing.slug}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {r.listing.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.buyer.fullName} · {r.buyer.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3 text-primary" />
                          <strong>{formatNgn(r.depositNgn.toString())}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-text-subtle" />
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>
                    {r.status}
                  </Badge>
                </div>
                {statusBlurb(r.status) && (
                  <div className="border-t border-border bg-surface-2/60 px-5 py-2.5 text-xs text-muted-foreground">
                    {statusBlurb(r.status)}
                  </div>
                )}
                {r.status === "PAID" && (
                  <div className="border-t border-border px-5 py-3">
                    <ReservationActions
                      id={r.id}
                      status={r.status}
                      allowConvert
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
