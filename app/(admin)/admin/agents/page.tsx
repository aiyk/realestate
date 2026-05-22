import { CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { emptyState } from "@/lib/voice";
import { AgentDecisionRow } from "./agent-decision-row";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "secondary",
} as const;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminAgentsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const where =
    status && status in STATUS_VARIANT
      ? { status: status as keyof typeof STATUS_VARIANT }
      : {};

  const profiles = await prisma.agentProfile.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          kycStatus: true,
          emailVerified: true,
        },
      },
    },
  });

  const pending = profiles.filter((p) => p.status === "PENDING").length;

  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Onboarding desk
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Agents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profiles.length}{" "}
          {status ? `with status "${status}"` : "applications on file"}
          {pending > 0 && ` · ${pending} pending your decision`}
        </p>
      </div>

      {pending > 0 && (
        <Callout
          tone="info"
          title="Approval rubric"
          icon={<ShieldCheck className="h-5 w-5" />}
          className="mt-6"
        >
          Every approval needs KYC ✓, bank account name match ✓, and email
          verified ✓. The CAC number is optional but nice to have.
        </Callout>
      )}

      {profiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-input bg-card p-12 text-center text-sm text-muted-foreground">
          {emptyState("applications").body}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {profiles.map((p) => {
            const readyForReview =
              p.user.kycStatus === "VERIFIED" &&
              !!p.bankAccountNo &&
              !!p.bankAccountName;
            const initials = p.businessName
              .split(/\s+/)
              .filter(Boolean)
              .map((x) => x[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-base font-semibold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">{p.businessName}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.user.fullName} · {p.user.email}
                    </p>

                    {/* Verification checklist */}
                    <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <Check
                        ok={!!p.user.emailVerified}
                        label="Email verified"
                      />
                      <Check
                        ok={p.user.kycStatus === "VERIFIED"}
                        label={`KYC: ${p.user.kycStatus.toLowerCase()}`}
                      />
                      <Check
                        ok={!!p.bankAccountName}
                        label={
                          p.bankAccountName
                            ? `Bank: ${p.bankAccountName}`
                            : "Bank: not set"
                        }
                      />
                      <Check
                        ok={!!p.cacNumber}
                        optional
                        label={p.cacNumber ? `CAC: ${p.cacNumber}` : "CAC: optional"}
                      />
                    </ul>

                    {p.bio && (
                      <p className="mt-4 text-sm text-foreground text-pretty">
                        {p.bio}
                      </p>
                    )}
                    {p.rejectionReason && (
                      <Callout tone="warn" className="mt-3">
                        Rejected previously: {p.rejectionReason}
                      </Callout>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]} className="self-start">
                    {p.status}
                  </Badge>
                </div>

                {p.status === "PENDING" && (
                  <div className="border-t border-border bg-surface-2/60 px-5 py-4">
                    <AgentDecisionRow
                      id={p.id}
                      canApprove={readyForReview}
                      defaultCommissionPct={Number(p.defaultCommissionPct)}
                    />
                    {!readyForReview && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Approve unlocks once KYC ✓ and bank account name ✓.
                        Right now this agent is still missing something.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Check({
  ok,
  label,
  optional,
}: {
  ok: boolean;
  label: string;
  optional?: boolean;
}) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ring-1 ${
        ok
          ? "bg-primary-soft text-primary-soft-foreground ring-primary/20"
          : optional
            ? "bg-surface-2 text-muted-foreground ring-border"
            : "bg-accent-soft text-accent-soft-foreground ring-accent/20"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <CircleDashed className="h-3 w-3" />
      )}
      {label}
    </li>
  );
}
