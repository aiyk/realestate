"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Mobile-only filter trigger. Wraps the existing filter form (passed as children)
 * inside a slide-up Sheet. The form is rendered on the server and just nested here.
 */
export function ListingsFilterMobile({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn("lg:hidden")}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filter listings"
        description="Narrow the search and tap Apply."
        side="bottom"
      >
        {children}
      </Sheet>
    </>
  );
}
