import Link from "next/link";
import { Plus, ArrowRight, Pencil } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { NoListings } from "@/components/illustrations/empty-states";
import { Callout } from "@/components/ui/callout";
import { cn, formatNgn } from "@/lib/utils";
import { statusBlurb } from "@/lib/voice";
import { ListingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  ListingStatus,
  "default" | "secondary" | "success" | "warning" | "danger" | "outline"
> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  RESERVED: "warning",
  SOLD: "outline",
  ARCHIVED: "outline",
};

export default async function AgentListingsPage() {
  const u = await getSessionUser();
  if (!u) return null;

  const listings = await prisma.listing.findMany({
    where: { agentId: u.id },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    take: 100,
  });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Your inventory
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            My listings
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Draft, submit for review, publish. Edits to live listings are
            live; price changes need a re-review.
          </p>
        </div>
        <Link href="/agent/listings/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" />
          New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <NoListings className="mx-auto h-32" />
          <p className="mt-4 text-lg font-semibold text-stone-700">
            No listings yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 text-pretty">
            The first listing is the hardest. After that, the dashboard
            comes alive — reservations, conversations, payouts.
          </p>
          <Link
            href="/agent/listings/new"
            className={cn(buttonVariants(), "mt-6")}
          >
            Create your first listing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Card grid on mobile */}
          <div className="mt-8 grid gap-4 sm:hidden">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/agent/listings/${l.id}/edit`}
                className="rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-300"
              >
                <div className="flex items-start gap-3">
                  {l.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.images[0].url}
                      alt={l.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-lg bg-stone-100 text-xs text-stone-400">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-stone-900">
                      {l.title}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatNgn(l.priceNgn.toString())}
                    </p>
                    <Badge variant={STATUS_VARIANT[l.status]} className="mt-2">
                      {l.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Table on desktop */}
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-stone-200 bg-white sm:block">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {l.images[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.images[0].url}
                            alt={l.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-lg bg-stone-100 text-[10px] text-stone-400">
                            —
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-stone-900">
                            {l.title}
                          </p>
                          {statusBlurb(l.status) && (
                            <p className="line-clamp-1 text-xs text-stone-500">
                              {statusBlurb(l.status)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[l.status]}>
                        {l.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatNgn(l.priceNgn.toString())}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{l.city}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/agent/listings/${l.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Callout tone="tip" title="Tip from the review team" className="mt-8">
        Listings with a clear price, three photos, and a paragraph that says
        what&apos;s great about the area get approved in under an hour. The
        rest sit in the queue a while.
      </Callout>
    </section>
  );
}
