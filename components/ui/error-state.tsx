"use client";

import * as React from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: React.ReactNode;
  reset?: () => void;
  homeHref?: string;
  className?: string;
};

/**
 * Reusable error fallback for `error.tsx` boundaries throughout the app.
 * Pairs `reset()` (refetch + re-render) with a home link as a safety net.
 */
export function ErrorState({
  title = "Something went sideways",
  description = "We hit an unexpected error while loading this page. Try again — if it keeps happening, head back home.",
  reset,
  homeHref = "/",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={[
        "mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center",
        className ?? "",
      ].join(" ")}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h1 className="t-h3 text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} variant="default" size="default">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
        <Link
          href={homeHref}
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          <Home className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </div>
  );
}
