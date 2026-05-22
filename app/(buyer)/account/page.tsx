import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  ReceiptText,
  Sparkles,
  Mail,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StatBadge } from "@/components/ui/stat-badge";
import { LagosSkyline } from "@/components/illustrations/skylines";
import { cn } from "@/lib/utils";
import { greet, statusBlurb } from "@/lib/voice";

export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const user = await getSessionUser();
  if (!user) return null;

  const [reservationsCount, paidReservations, threadCount] = await Promise.all([
    prisma.reservation.count({ where: { buyerId: user.id } }),
    prisma.reservation.count({
      where: { buyerId: user.id, status: "PAID" },
    }),
    prisma.messageThread.count({
      where: { participants: { some: { userId: user.id } } },
    }),
  ]);

  const firstName = user.fullName.split(" ")[0];

  // Choose the most helpful "next best action"
  const nextStep = !user.emailVerified
    ? { label: "Verify your email", href: "/verify-email" }
    : user.kycStatus !== "VERIFIED"
      ? { label: "Verify your identity", href: "/account/kyc" }
      : reservationsCount === 0
        ? { label: "Find a property", href: "/listings" }
        : { label: "Check your reservations", href: "/account/reservations" };

  return (
    <main className="flex-1">
      {/* Hero greeting */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent-soft/40 via-white to-white">
        <LagosSkyline className="absolute inset-x-0 bottom-0 h-20 text-primary/15" />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Your space
          </p>
          <h1 className="t-h1 mt-2 text-balance">
            {greet(firstName)}
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground text-pretty">
            Here&apos;s what&apos;s on your dashboard, and the one thing
            we&apos;d do next.
          </p>

          <div className="mt-6 max-w-xl">
            <SpeechBubble
              from="concierge"
              avatar="·"
              author="Concierge"
              role="Realestate"
            >
              The next best move: {" "}
              <Link
                href={nextStep.href}
                className="font-semibold text-primary hover:underline"
              >
                {nextStep.label} →
              </Link>
            </SpeechBubble>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        {/* Status stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatBadge
            icon={<ReceiptText className="h-4 w-4" />}
            label="Reservations"
            value={reservationsCount}
            sub={
              paidReservations > 0
                ? `${paidReservations} paid`
                : "place your first deposit"
            }
            tone="emerald"
          />
          <StatBadge
            icon={<MessageCircle className="h-4 w-4" />}
            label="Conversations"
            value={threadCount}
            sub={
              threadCount === 0
                ? "say hi to an agent"
                : "all in one place"
            }
            tone="amber"
          />
          <StatBadge
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Verification"
            value={user.kycStatus === "VERIFIED" ? "Done" : "Pending"}
            sub={
              user.kycStatus === "VERIFIED"
                ? "you can reserve anywhere"
                : "needed before reserving"
            }
            tone={user.kycStatus === "VERIFIED" ? "stone" : "rose"}
          />
        </div>

        {/* Verification cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Status
            icon={<Mail className="h-5 w-5" />}
            label="Email"
            ok={user.emailVerified}
            okMessage="Your inbox is verified — receipts will land there."
            pendingMessage="Tap the link we emailed you. Expires in 24 hours."
            actionHref="/verify-email"
            actionLabel="Resend link"
          />
          <Status
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Identity (BVN)"
            ok={user.kycStatus === "VERIFIED"}
            okMessage="All clear. Reserve anything you like."
            pendingMessage={statusBlurb(user.kycStatus) || "Required before you can reserve."}
            actionHref="/account/kyc"
            actionLabel="Verify now"
            failed={user.kycStatus === "FAILED"}
          />
        </div>

        {/* Shortcuts */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ShortcutCard
            icon={<Search className="h-5 w-5" />}
            title="Browse listings"
            desc="See what's live this week"
            href="/listings"
          />
          <ShortcutCard
            icon={<ReceiptText className="h-5 w-5" />}
            title="My reservations"
            desc={
              reservationsCount === 0
                ? "Nothing reserved yet"
                : `${reservationsCount} on file`
            }
            href="/account/reservations"
          />
          <ShortcutCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="Messages"
            desc={
              threadCount === 0
                ? "No conversations yet"
                : `${threadCount} threads`
            }
            href="/account/messages"
          />
        </div>

        {/* Agent CTA + saved searches */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft via-white to-primary-soft p-6">
            <Sparkles className="absolute right-4 top-4 h-6 w-6 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Side hustle
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              List as an agent
            </p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              If you sell property, we&apos;d love to verify you. Same-week
              Paystack payouts, a real ledger, no chasing.
            </p>
            <Link
              href="/agent/apply"
              className={cn(
                buttonVariants({ variant: "accent", size: "sm" }),
                "mt-4",
              )}
            >
              Apply to list
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Callout
            tone="info"
            title="Your favourites"
            icon={<Heart className="h-5 w-5 text-danger" />}
          >
            Tap the heart on any listing to save it here. We watch every save
            for price-drops, new photos, or status changes.
            <Link
              href="/account/favorites"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              View favourites
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Callout>
        </div>
      </div>
    </main>
  );
}

function Status({
  icon,
  label,
  ok,
  okMessage,
  pendingMessage,
  failed,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  label: string;
  ok: boolean;
  okMessage: string;
  pendingMessage: string;
  failed?: boolean;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-xl",
              ok
                ? "bg-primary-soft text-primary"
                : failed
                  ? "bg-danger-soft text-danger-soft-foreground"
                  : "bg-accent-soft text-accent",
            )}
          >
            {ok ? <CheckCircle2 className="h-5 w-5" /> : icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {ok
                ? "All set"
                : failed
                  ? "Needs another try"
                  : "Awaiting you"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {ok ? okMessage : pendingMessage}
            </p>
          </div>
        </div>
        <Badge
          variant={ok ? "success" : failed ? "danger" : "warning"}
          className="shrink-0"
        >
          {ok ? "Done" : failed ? "Retry" : "Pending"}
        </Badge>
      </div>
      {!ok && (
        <Link
          href={actionHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4 w-full",
          )}
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function ShortcutCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-border bg-card p-6 transition-all hover-lift"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-foreground group-hover:text-primary">
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{desc}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
        Open <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}
