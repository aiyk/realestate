import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Forgot password — Realestate" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell variant="forgot">
      <h2 className="text-2xl font-bold tracking-tight">Forgot password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pop in the email you used. We&apos;ll send a reset link that lasts an
        hour.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Remembered it after all?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline"
        >
          Sign in instead
        </Link>
        .
      </p>
    </AuthShell>
  );
}
