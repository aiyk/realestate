import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[100rem] px-6 py-10">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-8 w-2/3 max-w-md" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="mt-8">
          <SkeletonGrid count={4} variant="row" />
        </div>
      </div>
    </main>
  );
}
