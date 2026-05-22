import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-6 py-16">
        <div className="w-full space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
