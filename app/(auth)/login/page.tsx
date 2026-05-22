import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Callout } from "@/components/ui/callout";

export const metadata = { title: "Sign in — Realestate" };

type Props = {
  searchParams: Promise<{
    next?: string;
    signup?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <AuthShell variant="login">
      <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline"
        >
          Create an account
        </Link>
      </p>
      {params.signup === "1" && (
        <Callout tone="success" className="mt-5">
          Account created. Sign in to continue where you left off.
        </Callout>
      )}
      <div className="mt-6">
        <LoginForm next={params.next} initialError={params.error} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-primary underline hover:text-primary-soft-foreground"
        >
          Forgot your password?
        </Link>
      </p>
    </AuthShell>
  );
}
