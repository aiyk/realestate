"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function AccountError({
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
        homeHref="/account"
        title="Couldn't load your account"
        description="An unexpected error occurred. Your data is safe — try refreshing."
      />
    </main>
  );
}
