import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pages: number;
  searchParams: Record<string, string | string[] | undefined>;
};

function pageHref(sp: Record<string, string | string[] | undefined>, n: number): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (Array.isArray(v)) for (const x of v) next.append(k, x);
    else if (v) next.set(k, v);
  }
  if (n > 1) next.set("page", String(n));
  return `/agents?${next.toString()}`;
}

function windowedPages(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set<number>([1, pages, page, page - 1, page + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

export function DirectoryPagination({ page, pages, searchParams }: Props) {
  if (pages <= 1) return null;
  const list = windowedPages(page, pages);
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1"
    >
      <Link
        href={pageHref(searchParams, Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 px-3 text-sm",
          page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-stone-50",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {list.map((n, idx) =>
        n === "…" ? (
          <span key={`gap-${idx}`} className="px-2 text-stone-400">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={pageHref(searchParams, n)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm",
              n === page
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-stone-200 hover:bg-stone-50",
            )}
          >
            {n}
          </Link>
        ),
      )}
      <Link
        href={pageHref(searchParams, Math.min(pages, page + 1))}
        aria-disabled={page >= pages}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 px-3 text-sm",
          page >= pages ? "pointer-events-none opacity-50" : "hover:bg-stone-50",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
