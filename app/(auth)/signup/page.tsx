import Link from "next/link";
import { SignupForm } from "./signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Sign up — Realestate" };

export default function SignupPage() {
  return (
    <AuthShell variant="signup" showFeatures>
      <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Takes about 30 seconds.{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline"
        >
          Already have one?
        </Link>
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-5 text-xs text-muted-foreground text-pretty">
        By signing up you agree to our{" "}
        <Link href="/legal/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline">
          Privacy Policy
        </Link>
        . We never spam, and we never sell your data.
      </p>
    </AuthShell>
  );
}
