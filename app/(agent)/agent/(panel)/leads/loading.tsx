import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <section>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
      <Skeleton className="mt-6 h-16 w-full rounded-2xl" />
      <div className="mt-8">
        <SkeletonGrid count={5} variant="row" />
      </div>
    </section>
  );
}
