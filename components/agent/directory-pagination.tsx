import { Pagination } from "@/components/ui/pagination";
import type { SearchParamRecord } from "@/lib/pagination";

type Props = {
  page: number;
  pages: number;
  searchParams: SearchParamRecord;
};

/**
 * Agent directory pagination — preserved as a stable export so existing
 * callers keep working. Internals now live in `<Pagination />` so the
 * windowed-page logic is shared with leads + listings.
 */
export function DirectoryPagination({ page, pages, searchParams }: Props) {
  return (
    <Pagination
      basePath="/agents"
      page={page}
      pages={pages}
      searchParams={searchParams}
    />
  );
}
