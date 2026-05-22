import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ListingNotFound() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <HomeIcon className="h-6 w-6" />
        </div>
        <h1 className="t-h2 text-foreground">Listing not found</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          This listing may have been removed, reserved, or moved off the
          marketplace. Browse what&apos;s live now.
        </p>
        <Link
          href="/listings"
          className={cn(buttonVariants(), "mt-2")}
        >
          Browse listings
        </Link>
      </div>
    </main>
  );
}
