import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RootNotFound() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="t-h2 text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          We couldn&apos;t find what you were looking for. The link may be old,
          or the listing might have been removed.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={cn(buttonVariants())}>
            Back home
          </Link>
          <Link
            href="/listings"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Browse listings
          </Link>
        </div>
      </div>
    </main>
  );
}
