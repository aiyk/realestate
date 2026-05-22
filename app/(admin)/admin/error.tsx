"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1">
      <ErrorState
        reset={reset}
        homeHref="/admin"
        title="Couldn't load the admin panel"
        description="An unexpected error occurred while loading this section."
      />
    </main>
  );
}
