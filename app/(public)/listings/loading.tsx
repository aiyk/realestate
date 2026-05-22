import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function ListingsLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[100rem] px-6 py-10">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-1/2 max-w-sm" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <SkeletonGrid count={6} variant="card" />
        </div>
      </div>
    </main>
  );
}
