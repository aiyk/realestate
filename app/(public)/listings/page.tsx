import Link from "next/link";
import { X, MapPin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { listingFilterSchema } from "@/lib/schemas/listing";
import { Pagination } from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatNgn } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingsFilterForm } from "@/components/listings/listings-filter-form";
import { ListingsFilterMobile } from "@/components/listings/listings-filter-mobile";
import { ListingTypesGrid } from "@/components/landing/listing-types-grid";
import { AskBox } from "@/components/ui/ask-box";
import { Callout } from "@/components/ui/callout";
import { NoListings } from "@/components/illustrations/empty-states";
import { NigeriaMap } from "@/components/illustrations/nigeria-map";
import { PROPERTY_TYPE_META } from "@/components/illustrations/house-types";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PROPERTY_TYPES = [
  { value: "", label: "All types" },
  ...PROPERTY_TYPE_META.map((t) => ({ value: t.key, label: t.label })),
];

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cleaned = Object.fromEntries(
    Object.entries(sp).filter(([, v]) => v !== undefined && v !== ""),
  );
  const parsed = listingFilterSchema.safeParse(cleaned);
  const f = parsed.success
    ? parsed.data
    : listingFilterSchema.parse({ page: 1, perPage: 12 });

  const where: Prisma.ListingWhereInput = {
    status: { in: ["PUBLISHED", "RESERVED", "SOLD"] },
    ...(f.city && { city: { contains: f.city, mode: "insensitive" } }),
    ...(f.propertyType && { propertyType: f.propertyType }),
    ...(f.minPrice !== undefined || f.maxPrice !== undefined
      ? {
          priceNgn: {
            ...(f.minPrice !== undefined && { gte: f.minPrice }),
            ...(f.maxPrice !== undefined && { lte: f.maxPrice }),
          },
        }
      : {}),
    ...(f.bedrooms !== undefined && { bedrooms: { gte: f.bedrooms } }),
  };

  const [items, total, totalAll, cities] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (f.page - 1) * f.perPage,
      take: f.perPage,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        agent: { select: { fullName: true } },
      },
    }),
    prisma.listing.count({ where }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      select: { city: true },
      distinct: ["city"],
      take: 10,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / f.perPage));
  const activeFilters = Object.entries({
    city: f.city,
    propertyType: f.propertyType,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    bedrooms: f.bedrooms,
  }).filter(([, v]) => v !== undefined && v !== "");

  const headingForFilters = (() => {
    const parts: string[] = [];
    if (f.bedrooms) parts.push(`${f.bedrooms}+ bedroom`);
    if (f.propertyType) {
      const t = PROPERTY_TYPES.find((p) => p.value === f.propertyType)?.label;
      parts.push((t ?? "homes").toLowerCase());
    }
    if (!f.propertyType && parts.length === 1) parts.push("homes");
    if (f.city) parts.push(`in ${f.city}`);
    if (parts.length === 0) return "Every listing on the marketplace";
    return parts.join(" ").replace(/^./, (c) => c.toUpperCase());
  })();

  return (
    <main className="flex-1">
      {/* Header strip */}
      <section className="border-b border-border bg-gradient-to-b from-surface-2 via-accent-soft/30 to-card py-12">
        <div className="mx-auto max-w-[100rem] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Listings" },
            ]}
            className="mb-4"
          />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Browse the marketplace
              </p>
              <h1 className="t-h1 mt-2 text-balance">
                {headingForFilters}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {total === 0
                  ? "Nothing matched that combo — relax a filter and we'll find you something."
                  : `Showing ${items.length} of ${total} matches · sorted by newest`}
                {totalAll > 0 && total !== totalAll && (
                  <>
                    {" · "}
                    <Link
                      href="/listings"
                      className="font-medium text-primary hover:underline"
                    >
                      see all {totalAll}
                    </Link>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 5).map((c) => (
                <Link
                  key={c.city}
                  href={`/listings?city=${encodeURIComponent(c.city)}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    f.city === c.city
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/30",
                  )}
                >
                  <MapPin className="h-3 w-3" />
                  {c.city}
                </Link>
              ))}
            </div>
          </div>

          {/* Property-type pivot */}
          <div className="mt-8">
            <ListingTypesGrid />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[100rem] px-6 py-10">
        {/* Mobile filter trigger */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <p className="text-sm text-muted-foreground">
            {total} match{total === 1 ? "" : "es"}
          </p>
          <ListingsFilterMobile activeCount={activeFilters.length}>
            <ListingsFilterForm
              values={{
                city: f.city,
                propertyType: f.propertyType,
                minPrice: f.minPrice,
                maxPrice: f.maxPrice,
                bedrooms: f.bedrooms,
              }}
              propertyTypes={PROPERTY_TYPES}
              showHeader={false}
              hasActiveFilters={activeFilters.length > 0}
            />
          </ListingsFilterMobile>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Filters — desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
            <ListingsFilterForm
              values={{
                city: f.city,
                propertyType: f.propertyType,
                minPrice: f.minPrice,
                maxPrice: f.maxPrice,
                bedrooms: f.bedrooms,
              }}
              propertyTypes={PROPERTY_TYPES}
              hasActiveFilters={activeFilters.length > 0}
            />

            {/* Concierge nudge */}
            <Callout
              tone="concierge"
              title="Can't find it?"
              className="mt-5"
            >
              Tell us your wishlist below — we&apos;ll text you the moment
              something matches.
            </Callout>

            {/* City map */}
            <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cities we&apos;re live in
              </p>
              <div className="mt-3">
                <NigeriaMap />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                More cities every quarter. Subscribe in the footer for new-city
                drops.
              </p>
            </div>
          </aside>

          <div>
            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Active:</span>
                {activeFilters.map(([k, v]) => {
                  const label =
                    k === "minPrice"
                      ? `Min ${formatNgn(String(v))}`
                      : k === "maxPrice"
                        ? `Max ${formatNgn(String(v))}`
                        : k === "propertyType"
                          ? PROPERTY_TYPES.find((p) => p.value === v)?.label
                          : k === "bedrooms"
                            ? `${v}+ beds`
                            : k === "city"
                              ? String(v)
                              : `${k}: ${String(v)}`;
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs text-primary-soft-foreground ring-1 ring-primary/20"
                    >
                      {label}
                    </span>
                  );
                })}
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" /> Clear
                </Link>
              </div>
            )}

            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-input bg-card p-6 sm:p-12">
                <EmptyState
                  illustration={<NoListings className="h-28 w-auto" />}
                  title="Nothing matched your filters"
                  description="Try relaxing one filter — or let us look for you. A real human reads every wishlist."
                  action={
                    <Link
                      href="/listings"
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Reset filters
                    </Link>
                  }
                  secondary={
                    <Link
                      href="/agents"
                      className={cn(buttonVariants({ variant: "ghost" }))}
                    >
                      Talk to an agent
                    </Link>
                  }
                />
                <div className="mx-auto mt-2 max-w-2xl">
                  <AskBox
                    context={JSON.stringify({
                      city: f.city,
                      propertyType: f.propertyType,
                      minPrice: f.minPrice,
                      maxPrice: f.maxPrice,
                      bedrooms: f.bedrooms,
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((l, i) => (
                  <div
                    key={l.id}
                    className={cn(
                      "animate-fade-up",
                      `stagger-${(i % 6) + 1}`,
                    )}
                  >
                    <ListingCard
                      slug={l.slug}
                      title={l.title}
                      city={l.city}
                      state={l.state}
                      priceNgn={l.priceNgn.toString()}
                      depositNgn={l.depositNgn?.toString()}
                      bedrooms={l.bedrooms}
                      bathrooms={l.bathrooms}
                      areaSqm={l.areaSqm ? Number(l.areaSqm) : null}
                      propertyType={l.propertyType}
                      status={l.status}
                      imageUrl={l.images[0]?.url ?? null}
                      agentName={l.agent?.fullName ?? null}
                    />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              basePath="/listings"
              page={f.page}
              pages={pages}
              total={total}
              perPage={f.perPage}
              searchParams={sp}
            />


            {/* Footer ask */}
            {items.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface-2 p-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Still looking?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">
                    Tell us what you&apos;re after — we&apos;ll watch for
                    matches and only email you when we find one.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Send a wishlist <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
