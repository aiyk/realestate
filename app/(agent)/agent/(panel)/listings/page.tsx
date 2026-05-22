import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import type { Prisma, ListingStatus } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { NoListings } from "@/components/illustrations/empty-states";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingTableRows } from "@/components/listings/listing-table-rows";
import { Pagination } from "@/components/ui/pagination";
import { pageBounds } from "@/lib/pagination";
import { paginationSchema } from "@/lib/schemas/pagination";
import { cn } from "@/lib/utils";
import { statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

const LISTING_STATUSES: ListingStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "RESERVED",
  "SOLD",
  "ARCHIVED",
];

const STATUS_LABEL: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  RESERVED: "Reserved",
  SOLD: "Sold",
  ARCHIVED: "Archived",
};

type SearchParams = Promise<{
  page?: string;
  perPage?: string;
  status?: string;
}>;

export default async function AgentListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const u = await getSessionUser();
  if (!u) return null;

  const sp = await searchParams;
  const { page, perPage } = paginationSchema
    .extend({})
    .parse({ page: sp.page, perPage: sp.perPage ?? "24" });
  const { skip, take } = pageBounds(page, perPage);
  const status =
    sp.status && LISTING_STATUSES.includes(sp.status as ListingStatus)
      ? (sp.status as ListingStatus)
      : undefined;

  const where: Prisma.ListingWhereInput = {
    agentId: u.id,
    ...(status && { status }),
  };

  const [listings, total, statusCounts] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      skip,
      take,
    }),
    prisma.listing.count({ where }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { agentId: u.id },
      _count: { _all: true },
    }),
  ]);

  const countsByStatus: Record<ListingStatus, number> = {
    DRAFT: 0,
    PENDING_REVIEW: 0,
    PUBLISHED: 0,
    REJECTED: 0,
    RESERVED: 0,
    SOLD: 0,
    ARCHIVED: 0,
  };
  let allCount = 0;
  for (const row of statusCounts) {
    countsByStatus[row.status] = row._count._all;
    allCount += row._count._all;
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your inventory
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            My listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft, submit for review, publish. Bulk-archive old listings, or
            duplicate a winner to relist faster.
          </p>
        </div>
        <Link href="/agent/listings/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" />
          New listing
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter by status"
        className="no-scrollbar mt-6 flex items-center gap-1 overflow-x-auto border-b border-border"
      >
        <StatusTab
          href="/agent/listings"
          label="All"
          count={allCount}
          active={!status}
        />
        {LISTING_STATUSES.map((s) => (
          <StatusTab
            key={s}
            href={`/agent/listings?status=${s}`}
            label={STATUS_LABEL[s]}
            count={countsByStatus[s]}
            active={status === s}
          />
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card">
          <EmptyState
            illustration={<NoListings className="h-28 w-auto" />}
            title={total === 0 ? "No listings yet" : "No listings match your filter"}
            description={
              total === 0
                ? "The first listing is the hardest. After that, the dashboard comes alive — reservations, conversations, payouts."
                : "Try clearing the status filter to see everything."
            }
            action={
              total === 0 ? (
                <Link
                  href="/agent/listings/new"
                  className={cn(buttonVariants())}
                >
                  Create your first listing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/agent/listings"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Clear filter
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
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
          <Pagination
            basePath="/agent/listings"
            page={page}
            pages={pages}
            total={total}
            perPage={perPage}
            searchParams={sp}
          />
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

function StatusTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        "relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-surface-2",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-surface-2 text-muted-foreground",
        )}
      >
        {count}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
