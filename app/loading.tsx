import { SkeletonGrid } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[100rem] px-6 py-16">
        <SkeletonGrid count={6} variant="card" />
      </div>
    </main>
  );
}
