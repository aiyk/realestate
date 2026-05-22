/**
 * Shared pagination helpers.
 *
 * `windowedPages` computes the visible page-number list with truncation
 * (e.g. [1, "…", 4, 5, 6, "…", 20]) for a Pagination component.
 *
 * `buildPageHref` builds an href for page `n` against a base path,
 * preserving the other search params (filters, sort) but dropping any
 * existing `page` so the new value wins.
 *
 * Both are framework-agnostic and pure; safe in server or client code.
 */

export type SearchParamRecord = Record<string, string | string[] | undefined>;

/**
 * Build an href to page `n` while preserving every other searchParam.
 * When n is 1 the `page` param is omitted entirely to keep URLs clean.
 */
export function buildPageHref(
  basePath: string,
  sp: SearchParamRecord,
  n: number,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (Array.isArray(v)) {
      for (const x of v) next.append(k, x);
    } else if (v != null && v !== "") {
      next.set(k, v);
    }
  }
  if (n > 1) next.set("page", String(n));
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Returns the page numbers to render in a windowed pagination control,
 * inserting `"…"` markers where consecutive numbers are elided.
 */
export function windowedPages(page: number, pages: number): (number | "…")[] {
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

/**
 * Returns the canonical [skip, take] for a 1-based `page` and `perPage`.
 * Clamps `page` to >= 1 and `perPage` to [1, 100].
 */
export function pageBounds(
  page: number,
  perPage: number,
): { skip: number; take: number } {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safePer = Math.min(100, Math.max(1, Math.floor(perPage) || 20));
  return { skip: (safePage - 1) * safePer, take: safePer };
}
