import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Wallet,
  Hash,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Callout } from "@/components/ui/callout";
import { NoReservations } from "@/components/illustrations/empty-states";
import { ReviewSubmitDialog } from "@/components/agent/review-submit-dialog";
import { cn, formatNgn } from "@/lib/utils";
import { emptyState, statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

function badgeVariant(status: string) {
  if (status === "PAID" || status === "CONVERTED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  return "danger" as const;
}

export default async function BuyerReservationsPage() {
  const u = await getSessionUser();
  if (!u) return null;

  const reservations = await prisma.reservation.findMany({
    where: { buyerId: u.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          state: true,
          priceNgn: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          agent: {
            select: {
              agentProfile: {
                select: { slug: true, businessName: true },
              },
            },
          },
        },
      },
      agentReview: { select: { id: true } },
    },
  });

  const empty = emptyState("reservations");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Reservations" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            What you&apos;ve put down on
          </p>
          <h1 className="t-h1 mt-1">
            My reservations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receipts, status, references — your full deposit history lives
            here.
          </p>
        </div>
        <Link
          href="/listings"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Reserve another <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card">
          <EmptyState
            illustration={<NoReservations className="h-28 w-auto" />}
            title={empty.headline}
            description={empty.body}
            action={
              empty.cta && (
                <Link
                  href={empty.cta.href}
                  className={cn(buttonVariants())}
                >
                  {empty.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reservations.map((r) => (
            <article
              key={r.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                {/* Thumbnail */}
                <Link
                  href={`/listings/${r.listing.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2"
                >
                  {r.listing.images[0]?.url ? (
                    <Image
                      src={r.listing.images[0].url}
                      alt={r.listing.title}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-subtle">
                      No photo
                    </div>
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/listings/${r.listing.slug}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {r.listing.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {r.listing.city}, {r.listing.state}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      <strong className="text-foreground">
                        {formatNgn(r.depositNgn.toString())}
                      </strong>
                      &nbsp;deposit
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-text-subtle" />
                      <code className="text-[11px] text-muted-foreground">
                        {r.reference}
                      </code>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-text-subtle" />
                      {r.createdAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <Badge variant={badgeVariant(r.status)} className="shrink-0">
                  {r.status}
                </Badge>
              </div>

              {statusBlurb(r.status) && (
                <div className="border-t border-border bg-surface-2/60 px-5 py-3 text-xs text-muted-foreground">
                  {statusBlurb(r.status)}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
                <Link
                  href={`/listings/${r.listing.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Open listing
                </Link>
                <Link
                  href={`/account/messages?listing=${r.listing.id}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message agent
                </Link>
                {(r.status === "PAID" || r.status === "CONVERTED") &&
                  r.listing.agent?.agentProfile &&
                  !r.agentReview && (
                    <ReviewSubmitDialog
                      agentSlug={r.listing.agent.agentProfile.slug}
                      agentBusinessName={r.listing.agent.agentProfile.businessName}
                      reservationId={r.id}
                    />
                  )}
                {r.agentReview && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-soft-foreground">
                    ✓ Review submitted
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {reservations.length > 0 && (
        <Callout tone="concierge" title="Need to cancel?" className="mt-10">
          Hit reply on the email receipt or message the agent directly. If
          it&apos;s within 48 hours of paying and the agent hasn&apos;t
          responded, the deposit refunds automatically.
        </Callout>
      )}
    </main>
  );
}
