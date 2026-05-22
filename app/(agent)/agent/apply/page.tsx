import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplyWizard } from "./apply-wizard";

export const dynamic = "force-dynamic";

export default async function AgentApplyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/agent/apply");
  if (user.role === "AGENT") redirect("/agent/dashboard");

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: user.id },
  });

  if (profile?.status === "APPROVED") redirect("/agent/dashboard");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold">Become an agent</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Three steps: business details, identity verification, and bank account
        for commission payouts.
      </p>
      {profile?.status === "REJECTED" && profile.rejectionReason && (
        <p className="mt-4 rounded-md bg-danger-soft p-3 text-sm text-danger-soft-foreground">
          Previous application rejected: {profile.rejectionReason}. Update your
          details and resubmit.
        </p>
      )}
      {profile?.status === "PENDING" && profile.bankAccountNo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Application status</span>
              <Badge variant="warning">Pending review</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Your application is under review. We will email you when there is
              an update.
            </p>
            <ul className="mt-3 space-y-1 text-xs">
              <li>✓ Business: {profile.businessName}</li>
              <li>✓ Identity verified</li>
              <li>
                ✓ Bank account: {profile.bankAccountName} ({profile.bankAccountNo.slice(-4)})
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
      <div className="mt-6">
        <ApplyWizard
          kycStatus={user.kycStatus}
          initial={profile ?? null}
          fullName={user.fullName}
        />
      </div>
    </main>
  );
}
