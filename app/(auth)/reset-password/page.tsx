import { ResetPasswordForm } from "./reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Callout } from "@/components/ui/callout";

export const metadata = { title: "Reset password — Realestate" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <AuthShell variant="reset">
      <h2 className="text-2xl font-bold tracking-tight">
        Reset your password
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Pick something memorable. A short sentence beats a clever symbol every
        time.
      </p>
      <div className="mt-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <Callout tone="warn" title="Missing reset token">
            Use the link from the email we sent. It expires after an hour.
          </Callout>
        )}
      </div>
    </AuthShell>
  );
}
