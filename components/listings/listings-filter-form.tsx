import Link from "next/link";
import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterValues = {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
};

const PRICE_PRESETS = [
  { min: 0, max: 30_000_000, label: "Under ₦30m" },
  { min: 30_000_000, max: 80_000_000, label: "₦30m – ₦80m" },
  { min: 80_000_000, max: 150_000_000, label: "₦80m – ₦150m" },
  { min: 150_000_000, max: undefined, label: "Over ₦150m" },
];

/**
 * Shared listings filter form. Used inline in the desktop sidebar and inside
 * a mobile Sheet. Pure server component — submits as a normal GET.
 */
export function ListingsFilterForm({
  values,
  propertyTypes,
  showHeader = true,
  hasActiveFilters = false,
}: {
  values: FilterValues;
  propertyTypes: { value: string; label: string }[];
  showHeader?: boolean;
  hasActiveFilters?: boolean;
}) {
  return (
    <form
      method="GET"
      action="/listings"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      {showHeader && (
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-primary" />
            Filter
          </p>
          {hasActiveFilters && (
            <Link
              href="/listings"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear all
            </Link>
          )}
        </div>
      )}

      <div className={cn(showHeader ? "mt-5" : "", "space-y-5")}>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={values.city}
            placeholder="Lagos, Abuja…"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="propertyType">Property type</Label>
          <Select
            id="propertyType"
            name="propertyType"
            defaultValue={values.propertyType ?? ""}
            className="mt-1.5"
          >
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Price range</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map((p) => {
              const isActive =
                Number(values.minPrice ?? 0) === p.min &&
                (p.max === undefined
                  ? values.maxPrice === undefined
                  : Number(values.maxPrice ?? 0) === p.max);
              const params = new URLSearchParams();
              if (values.city) params.set("city", values.city);
              if (values.propertyType)
                params.set("propertyType", values.propertyType);
              if (values.bedrooms !== undefined)
                params.set("bedrooms", String(values.bedrooms));
              params.set("minPrice", String(p.min));
              if (p.max !== undefined) params.set("maxPrice", String(p.max));
              return (
                <Link
                  key={p.label}
                  href={`/listings?${params.toString()}`}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center text-[11px] font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/30",
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
                defaultValue={values.minPrice}
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
                defaultValue={values.maxPrice}
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
                  values.bedrooms === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30",
                )}
              >
                <input
                  type="radio"
                  name="bedrooms"
                  value={n}
                  defaultChecked={values.bedrooms === n}
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
  );
}
