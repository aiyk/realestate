import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ThreadInbox } from "@/components/messaging/thread-inbox";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { CreateOnArrival } from "./create-on-arrival";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ listing?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  const { listing } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Messages" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Conversations
          </p>
          <h1 className="t-h1 mt-1">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Every conversation about every listing — searchable,
            time-stamped, in one place.
          </p>
        </div>
        <Link
          href="/listings"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Find a listing
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {listing && <CreateOnArrival listingId={listing} />}

      <Callout
        tone="concierge"
        title="How it works"
        icon={<MessageCircle className="h-5 w-5" />}
        className="mt-8"
      >
        Messages go to the listing&apos;s agent. If you&apos;re offline for
        more than a minute, we email the recipient too (debounced — we
        won&apos;t spam them).
      </Callout>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <ThreadInbox basePath="/account/messages" />
      </div>
    </main>
  );
}
