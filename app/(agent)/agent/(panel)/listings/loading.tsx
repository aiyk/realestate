import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function AgentListingsLoading() {
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
      <div className="mt-8">
        <SkeletonGrid count={6} variant="row" />
      </div>
    </section>
  );
}
