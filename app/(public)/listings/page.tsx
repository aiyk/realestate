import Link from "next/link";
import { Filter, X, MapPin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { listingFilterSchema } from "@/lib/schemas/listing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatNgn } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
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

const PRICE_PRESETS = [
  { min: 0, max: 30_000_000, label: "Under ₦30m" },
  { min: 30_000_000, max: 80_000_000, label: "₦30m – ₦80m" },
  { min: 80_000_000, max: 150_000_000, label: "₦80m – ₦150m" },
  { min: 150_000_000, max: undefined, label: "Over ₦150m" },
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
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Browse the marketplace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                {headingForFilters}
              </h1>
              <p className="mt-2 text-sm text-stone-600 text-pretty">
                {total === 0
                  ? "Nothing matched that combo — relax a filter and we'll find you something."
                  : `Showing ${items.length} of ${total} matches · sorted by newest`}
                {totalAll > 0 && total !== totalAll && (
                  <>
                    {" · "}
                    <Link
                      href="/listings"
                      className="font-medium text-emerald-700 hover:underline"
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
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300",
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

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <form
              method="GET"
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Filter className="h-4 w-4 text-emerald-700" />
                  Filter
                </p>
                {activeFilters.length > 0 && (
                  <Link
                    href="/listings"
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </Link>
                )}
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={f.city}
                    placeholder="Lagos, Abuja…"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyType">Property type</Label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    defaultValue={f.propertyType ?? ""}
                    className="mt-1.5 h-11 w-full rounded-lg border border-stone-200 bg-white px-4 text-sm"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Price range</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {PRICE_PRESETS.map((p) => {
                      const isActive =
                        Number(f.minPrice ?? 0) === p.min &&
                        (p.max === undefined
                          ? f.maxPrice === undefined
                          : Number(f.maxPrice ?? 0) === p.max);
                      const params = new URLSearchParams();
                      if (f.city) params.set("city", f.city);
                      if (f.propertyType) params.set("propertyType", f.propertyType);
                      if (f.bedrooms !== undefined)
                        params.set("bedrooms", String(f.bedrooms));
                      params.set("minPrice", String(p.min));
                      if (p.max !== undefined)
                        params.set("maxPrice", String(p.max));
                      return (
                        <Link
                          key={p.label}
                          href={`/listings?${params.toString()}`}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center text-[11px] font-medium transition-colors",
                            isActive
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300",
                          )}
                        >
                          {p.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="minPrice" className="text-[10px]">
                        Min ₦
                      </Label>
                      <Input
                        id="minPrice"
                        name="minPrice"
                        type="number"
                        min="0"
                        defaultValue={f.minPrice}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice" className="text-[10px]">
                        Max ₦
                      </Label>
                      <Input
                        id="maxPrice"
                        name="maxPrice"
                        type="number"
                        min="0"
                        defaultValue={f.maxPrice}
                        placeholder="No limit"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms (min)</Label>
                  <div className="mt-1.5 grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label
                        key={n}
                        className={cn(
                          "cursor-pointer rounded-lg border px-1 py-2 text-center text-xs font-medium transition-colors",
                          f.bedrooms === n
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300",
                        )}
                      >
                        <input
                          type="radio"
                          name="bedrooms"
                          value={n}
                          defaultChecked={f.bedrooms === n}
                          className="hidden"
                        />
                        {n}+
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" className="mt-6 w-full">
                Apply filters
              </Button>
            </form>

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
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Cities we&apos;re live in
              </p>
              <div className="mt-3">
                <NigeriaMap />
              </div>
              <p className="mt-3 text-xs text-stone-500">
                More cities every quarter. Subscribe in the footer for new-city
                drops.
              </p>
            </div>
          </aside>

          <div>
            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-500">Active:</span>
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
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800 ring-1 ring-emerald-200"
                    >
                      {label}
                    </span>
                  );
                })}
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"
                >
                  <X className="h-3 w-3" /> Clear
                </Link>
              </div>
            )}

            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <NoListings className="mx-auto h-32" />
                <p className="mt-4 text-lg font-semibold text-stone-700">
                  Nothing matched your filters
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 text-pretty">
                  Try relaxing one filter — or let us look for you. A real
                  human reads every wishlist.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/listings"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Reset filters
                  </Link>
                  <Link
                    href="/agents"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                  >
                    Talk to an agent
                  </Link>
                </div>
                <div className="mx-auto mt-8 max-w-2xl">
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

            {pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  for (const [k, v] of Object.entries(sp)) {
                    if (typeof v === "string") params.set(k, v);
                  }
                  params.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/listings?${params.toString()}`}
                      className={cn(
                        "h-10 w-10 grid place-items-center rounded-lg border text-sm font-medium transition-colors",
                        p === f.page
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300",
                      )}
                    >
                      {p}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Footer ask */}
            {items.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Still looking?
                  </p>
                  <p className="mt-1 text-sm text-stone-600 text-pretty">
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
