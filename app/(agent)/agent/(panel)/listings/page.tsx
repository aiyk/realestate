import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { NoListings } from "@/components/illustrations/empty-states";
import { Callout } from "@/components/ui/callout";
import { ListingTableRows } from "@/components/listings/listing-table-rows";
import { cn } from "@/lib/utils";
import { statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

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
            Draft, submit for review, publish. Bulk-archive old listings, or
            duplicate a winner to relist faster.
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
        <ListingTableRows
          rows={listings.map((l) => ({
            id: l.id,
            slug: l.slug,
            title: l.title,
            status: l.status,
            priceNgn: l.priceNgn.toString(),
            city: l.city,
            imageUrl: l.images[0]?.url ?? null,
            blurb: statusBlurb(l.status) ?? null,
          }))}
        />
      )}

      <Callout tone="tip" title="Tip from the review team" className="mt-8">
        Listings with a clear price, three photos, and a paragraph that says
        what&apos;s great about the area get approved in under an hour. The
        rest sit in the queue a while.
      </Callout>
    </section>
  );
}
