import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildPageHref,
  windowedPages,
  type SearchParamRecord,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

type Props = {
  basePath: string;
  page: number;
  pages: number;
  searchParams: SearchParamRecord;
  total?: number;
  perPage?: number;
  className?: string;
};

/**
 * Windowed pagination control. Renders nothing when there's at most one page.
 *
 * Renders a "Showing X–Y of Z" line above the controls when `total` and
 * `perPage` are passed so the user knows how much data exists.
 */
export function Pagination({
  basePath,
  page,
  pages,
  searchParams,
  total,
  perPage,
  className,
}: Props) {
  if (pages <= 1 && (!total || (perPage && total <= perPage))) return null;
  const list = windowedPages(page, pages);

  const showingFrom =
    total !== undefined && perPage !== undefined
      ? Math.min(total, (page - 1) * perPage + 1)
      : null;
  const showingTo =
    total !== undefined && perPage !== undefined
      ? Math.min(total, page * perPage)
      : null;

  return (
    <div className={cn("mt-8 flex flex-col items-center gap-3", className)}>
      {showingFrom !== null && showingTo !== null && total !== undefined && (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{showingFrom}–{showingTo}</span>{" "}
          of <span className="font-medium text-foreground">{total}</span>
        </p>
      )}
      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-1"
        >
          <Link
            href={buildPageHref(basePath, searchParams, Math.max(1, page - 1))}
            aria-label="Previous page"
            aria-disabled={page <= 1}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm text-foreground transition-colors",
              page <= 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-surface-2",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          {list.map((n, idx) =>
            n === "…" ? (
              <span
                key={`gap-${idx}`}
                aria-hidden="true"
                className="px-2 text-text-subtle"
              >
                …
              </span>
            ) : (
              <Link
                key={n}
                href={buildPageHref(basePath, searchParams, n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition-colors",
                  n === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-surface-2",
                )}
              >
                {n}
              </Link>
            ),
          )}
          <Link
            href={buildPageHref(
              basePath,
              searchParams,
              Math.min(pages, page + 1),
            )}
            aria-label="Next page"
            aria-disabled={page >= pages}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm text-foreground transition-colors",
              page >= pages
                ? "pointer-events-none opacity-50"
                : "hover:bg-surface-2",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </div>
  );
}
