import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  NOT_STARTED: "secondary",
  PENDING: "warning",
  VERIFIED: "success",
  FAILED: "danger",
} as const;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminKycPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const where =
    status && status in STATUS_VARIANT
      ? { status: status as keyof typeof STATUS_VARIANT }
      : {};
  const submissions = await prisma.kycSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
    },
    take: 100,
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold">KYC submissions</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {submissions.length} {status ? `with status ${status}` : "recent"}
      </p>

      {submissions.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
          No submissions.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.user.fullName}</div>
                    <div className="text-xs text-neutral-500">{s.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.failureReason ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
