import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STATUS_LABEL: Record<ListingStatus, string> = {
  DRAFT: "Drafts",
  PENDING_REVIEW: "Awaiting review",
  PUBLISHED: "Live",
  REJECTED: "Rejected",
  RESERVED: "Reserved",
  SOLD: "Sold",
  ARCHIVED: "Archived",
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminListingsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const where =
    status && status in STATUS_VARIANT
      ? { status: status as ListingStatus }
      : {};

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      agent: { select: { fullName: true } },
    },
  });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Moderation desk
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {listings.length}{" "}
            {status
              ? `with status "${STATUS_LABEL[status as ListingStatus] ?? status}"`
              : "total"}
            {" · "}
            sorted newest first
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Plus className="h-4 w-4" />
          New listing
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/listings"
          className={cn(
            "rounded-full border px-3 py-1 transition-colors",
            !status
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-foreground hover:border-primary/30",
          )}
        >
          All
        </Link>
        {(Object.keys(STATUS_VARIANT) as ListingStatus[]).map((s) => (
          <Link
            key={s}
            href={`/admin/listings?status=${s}`}
            className={cn(
              "rounded-full border px-3 py-1 transition-colors",
              status === s
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-primary/30",
            )}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {status === "PENDING_REVIEW" && listings.length > 0 && (
        <Callout tone="warn" title="Review checklist" className="mt-6">
          Photos clear? Price plausible? Address line plausible (we hide it
          from public but moderators see it)? Description reads like a human
          wrote it? If yes, ship it.
        </Callout>
      )}

      {listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-input bg-card p-12 text-center text-sm text-muted-foreground">
          Nothing in this queue.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-surface-2/60">
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
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-2 text-[10px] text-text-subtle">
                          —
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-foreground">
                          {l.title}
                        </p>
                        {statusBlurb(l.status) && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.agent?.fullName ?? "Platform"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatNgn(l.priceNgn.toString())}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.city}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/listings/${l.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
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
      )}
    </section>
  );
}
