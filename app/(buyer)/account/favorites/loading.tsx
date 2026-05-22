import { SkeletonGrid } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[100rem] flex-1 px-6 pb-20 pt-6">
      <div className="h-4 w-40 animate-skeleton-pulse rounded bg-surface-2" />
      <div className="mt-4 h-10 w-72 animate-skeleton-pulse rounded bg-surface-2" />
      <div className="mt-10">
        <SkeletonGrid variant="card" />
      </div>
    </main>
  );
}
