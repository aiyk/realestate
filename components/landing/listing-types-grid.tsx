import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROPERTY_TYPE_META } from "@/components/illustrations/house-types";

/**
 * Six clickable property-type tiles. Each links to the filtered listings
 * index. Used on the homepage and on /listings as a quick-pivot row.
 */
export function ListingTypesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {PROPERTY_TYPE_META.map((t, i) => {
        const Icon = t.Icon;
        return (
          <Link
            key={t.key}
            href={`/listings?propertyType=${t.key}`}
            className={`group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md animate-fade-up stagger-${(i % 6) + 1}`}
          >
            <span className="absolute right-2 top-2 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowRight className="h-4 w-4" />
            </span>
            <Icon className="h-14 w-14 text-primary transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold text-foreground">
              {t.label}
            </span>
            <span className="text-xs text-muted-foreground text-pretty">{t.blurb}</span>
          </Link>
        );
      })}
    </div>
  );
}
