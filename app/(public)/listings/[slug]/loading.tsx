import { Skeleton } from "@/components/ui/skeleton";

export default function ListingDetailLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[100rem] px-6 py-10">
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <Skeleton className="aspect-[5/4] w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <Skeleton className="aspect-[5/4] rounded-2xl" />
            <Skeleton className="aspect-[5/4] rounded-2xl" />
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
