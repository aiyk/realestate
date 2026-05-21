import Link from "next/link";
import { ArrowLeft, MessageCircle, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ThreadInbox } from "@/components/messaging/thread-inbox";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button";
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
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to account
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Conversations
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-stone-600 text-pretty">
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

      <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <ThreadInbox basePath="/account/messages" />
      </div>
    </main>
  );
}
