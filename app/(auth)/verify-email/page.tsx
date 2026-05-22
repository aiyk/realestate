import Link from "next/link";
import { CheckCircle2, Mail, AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/utils";

export const metadata = { title: "Verify email — Realestate" };

type Props = {
  searchParams: Promise<{ ok?: string; error?: string; token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const success = params.ok === "1";
  const error = params.error;

  return (
    <AuthShell variant="verify">
      <h2 className="text-2xl font-bold tracking-tight">Email verification</h2>

      {success ? (
        <div className="mt-6 rounded-2xl bg-primary-soft p-5 text-sm">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <p className="mt-2 font-semibold text-primary-soft-foreground">
            Your email is verified.
          </p>
          <p className="mt-1 text-primary-soft-foreground text-pretty">
            You can now sign in and use the full marketplace — reserving,
            messaging, the lot.
          </p>
        </div>
      ) : error === "invalid" ? (
        <Callout tone="warn" className="mt-6" title="This link expired">
          The verification link is invalid or older than 24 hours. Sign up
          again or ping us at{" "}
          <a
            href="mailto:hello@realestate.ng"
            className="font-medium underline"
          >
            hello@realestate.ng
          </a>{" "}
          and we&apos;ll issue a fresh one.
        </Callout>
      ) : error === "missing" ? (
        <Callout tone="warn" className="mt-6" title="No token provided">
          The verification link looks incomplete. Try opening it again from
          your email.
        </Callout>
      ) : (
        <div className="mt-6 space-y-4 text-sm text-foreground">
          <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Check your inbox</p>
              <p className="mt-1 text-muted-foreground text-pretty">
                We sent you a verification link. It expires in 24 hours — one
                tap, you&apos;re in.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-accent-soft-foreground ring-1 ring-accent/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <p className="font-semibold">Don&apos;t see it?</p>
              <p className="mt-1 text-pretty">
                Check spam, then promote us. If it&apos;s still missing in two
                minutes, drop a note via{" "}
                <Link href="/contact" className="font-medium underline">
                  the contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Go to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
