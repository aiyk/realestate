import { Skeleton } from "@/components/ui/skeleton";

export default function AgentProfileLoading() {
  return (
    <main className="flex-1">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="mx-auto -mt-10 max-w-[100rem] px-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-2/3 max-w-md" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
