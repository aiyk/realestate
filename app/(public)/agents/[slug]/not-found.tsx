import Link from "next/link";
import { Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AgentNotFound() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="t-h2 text-foreground">Agent not found</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          This profile may have been deactivated or is still being reviewed.
          Browse our verified agents.
        </p>
        <Link
          href="/agents"
          className={cn(buttonVariants(), "mt-2")}
        >
          Browse agents
        </Link>
      </div>
    </main>
  );
}
