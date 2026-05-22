import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Eye,
  Sparkles,
} from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Callout } from "@/components/ui/callout";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { StepIndicator } from "@/components/ui/story-step";
import { DepositShield } from "@/components/illustrations/deposit-shield";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NUDGES, statusBlurb } from "@/lib/voice";
import { KycForm } from "./kyc-form";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/kyc");

  const latest = await prisma.kycSubmission.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stepIndex = !user.emailVerified
    ? 0
    : user.kycStatus === "VERIFIED"
      ? 2
      : 1;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Identity check" },
        ]}
      />

      <div className="mt-4 grid items-start gap-6 sm:grid-cols-[1fr_180px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            One quick identity check
          </p>
          <h1 className="t-h1 mt-2 text-balance">
            Prove you&apos;re you. Once.
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            We do a BVN lookup via Dojah, store only a hash, and never see the
            number itself again. Takes thirty seconds.
          </p>
        </div>
        <DepositShield className="mx-auto h-32 w-32 sm:h-40 sm:w-40" />
      </div>

      <div className="mt-6">
        <StepIndicator
          steps={["Verify email", "Verify identity", "Reserve any listing"]}
          current={stepIndex}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Current status</h2>
          <Badge
            variant={
              user.kycStatus === "VERIFIED"
                ? "success"
                : user.kycStatus === "FAILED"
                  ? "danger"
                  : user.kycStatus === "PENDING"
                    ? "warning"
                    : "secondary"
            }
          >
            {user.kycStatus.replace("_", " ")}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {statusBlurb(user.kycStatus) ||
            "We haven't seen a submission from you yet."}
        </p>

        <div className="mt-6">
          {user.kycStatus === "VERIFIED" ? (
            <Callout
              tone="success"
              title="All clear — go shop."
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              You can reserve any listing now.{" "}
              <Link
                href="/listings"
                className="font-medium text-primary underline"
              >
                Browse listings
              </Link>{" "}
              or{" "}
              <Link
                href="/account/reservations"
                className="font-medium text-primary underline"
              >
                check your reservations
              </Link>
              .
            </Callout>
          ) : (
            <>
              {latest?.failureReason && (
                <Callout
                  tone="warn"
                  className="mb-5"
                  title="Last attempt didn't go through"
                >
                  {latest.failureReason}
                </Callout>
              )}
              <KycForm fullName={user.fullName} />
              {!process.env.NEXT_PUBLIC_DOJAH_LIVE && (
                <Callout
                  tone="info"
                  className="mt-6"
                  title="Dev mode active"
                  icon={<Sparkles className="h-5 w-5" />}
                >
                  Dojah sandbox isn&apos;t configured locally. Use any BVN
                  that starts with <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">22222</code> (e.g.{" "}
                  <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">22222222222</code>) to simulate a successful verification.
                </Callout>
              )}
            </>
          )}
        </div>
      </div>

      {/* Privacy explainer */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PromiseCard
          icon={<Lock className="h-5 w-5" />}
          title="Never stored in plaintext"
          body={NUDGES.bvnPrivacy}
        />
        <PromiseCard
          icon={<Eye className="h-5 w-5" />}
          title="Redacted from logs"
          body="Our logger strips any 11-digit number it sees, so your BVN never lands in a log file."
        />
        <PromiseCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="One-time only"
          body="We verify once. After that, you reserve as many properties as you want without re-verifying."
        />
      </div>

      <SpeechBubble
        from="concierge"
        avatar="·"
        author="Concierge"
        className="mt-8"
      >
        Stuck? Email{" "}
        <a
          href="mailto:hello@realestate.ng"
          className="font-semibold text-primary-soft-foreground underline"
        >
          hello@realestate.ng
        </a>{" "}
        and we&apos;ll unblock you the same day.
      </SpeechBubble>

      <p className="mt-8 text-center">
        <Link
          href="/account"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to account
        </Link>
      </p>
    </main>
  );
}

function PromiseCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground text-pretty">{body}</p>
    </div>
  );
}
