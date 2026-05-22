"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function AgentError({
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
        homeHref="/agent"
        title="Couldn't load the agent panel"
        description="We hit an error rendering this section. Try again — your data is safe."
      />
    </main>
  );
}
