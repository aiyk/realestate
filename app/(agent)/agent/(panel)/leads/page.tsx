import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Search as SearchIcon } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import type { Prisma, LeadStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { pageBounds } from "@/lib/pagination";
import { paginationSchema } from "@/lib/schemas/pagination";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  NEW: "warning",
  CONTACTED: "secondary",
  QUALIFIED: "default",
  BOOKED: "success",
  LOST: "danger",
} as const;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "BOOKED", label: "Booked" },
  { value: "LOST", label: "Lost" },
];

type SearchParams = Promise<{
  page?: string;
  perPage?: string;
  status?: string;
  q?: string;
}>;

export default async function AgentLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/leads");
  if (u.role !== "AGENT") redirect("/agent");

  const sp = await searchParams;
  const { page, perPage } = paginationSchema.parse({
    page: sp.page,
    perPage: sp.perPage,
  });
  const { skip, take } = pageBounds(page, perPage);
  const status =
    sp.status && ["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "LOST"].includes(sp.status)
      ? (sp.status as LeadStatus)
      : undefined;
  const q = (sp.q ?? "").trim();

  const where: Prisma.LeadWhereInput = {
    agentId: u.id,
    ...(status && { status }),
    ...(q && {
      OR: [
        { buyerName: { contains: q, mode: "insensitive" } },
        { buyerEmail: { contains: q, mode: "insensitive" } },
        { buyerPhone: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [leads, total, openCount] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
      include: { listing: { select: { title: true, slug: true } } },
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({
      where: { agentId: u.id, status: { in: ["NEW", "CONTACTED"] } },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Inbound interest
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who contacted you, requested a viewing, or reserved one of
            your listings.
          </p>
        </div>
      </div>

      {openCount > 0 && (
        <Callout tone="tip" title="Reply within the hour" className="mt-6">
          You have {openCount} open lead{openCount === 1 ? "" : "s"}. Buyers
          who hear back quickly are 3× more likely to book.
        </Callout>
      )}

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="lead-q"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Search
          </label>
          <div className="relative mt-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="lead-q"
              name="q"
              defaultValue={q}
              placeholder="Name, email or phone"
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label
            htmlFor="lead-status"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Status
          </label>
          <Select
            id="lead-status"
            name="status"
            defaultValue={status ?? ""}
            className="mt-1"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="default">
          Apply
        </Button>
      </form>

      {leads.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-input bg-card p-12 text-center">
          <Inbox className="mx-auto h-16 w-16 text-text-subtle" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            {total === 0 ? "No leads yet" : "No leads match your filters"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {total === 0
              ? "When a buyer contacts you through your public profile or a listing page, they'll appear here."
              : "Try clearing the search or switching to a different status."}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3">
            {leads.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/agent/leads/${l.id}`}
                  className="block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {l.buyerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.buyerEmail}
                        {l.buyerPhone ? ` · ${l.buyerPhone}` : ""}
                      </p>
                      {l.listing && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          About:{" "}
                          <span className="text-foreground">
                            {l.listing.title}
                          </span>
                        </p>
                      )}
                    </div>
                    <Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            basePath="/agent/leads"
            page={page}
            pages={pages}
            total={total}
            perPage={perPage}
            searchParams={sp}
          />
        </>
      )}
    </section>
  );
}
