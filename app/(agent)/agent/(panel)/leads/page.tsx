import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  NEW: "warning",
  CONTACTED: "secondary",
  QUALIFIED: "default",
  BOOKED: "success",
  LOST: "danger",
} as const;

export default async function AgentLeadsPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent/leads");
  if (u.role !== "AGENT") redirect("/agent");

  const leads = await prisma.lead.findMany({
    where: { agentId: u.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      listing: { select: { title: true, slug: true } },
    },
  });

  const openCount = leads.filter(
    (l) => l.status === "NEW" || l.status === "CONTACTED",
  ).length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Inbound interest
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-stone-600">
            Everyone who contacted you, requested a viewing, or reserved one of
            your listings.
          </p>
        </div>
      </div>

      {openCount > 0 && (
        <Callout tone="tip" title="Reply within the hour" className="mt-6">
          You have {openCount} open lead{openCount === 1 ? "" : "s"}. Buyers
          who hear back quickly are 3× more likely to book.
        </Callout>
      )}

      {leads.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-16 w-16 text-stone-400" />
          <p className="mt-4 text-lg font-semibold text-stone-700">
            No leads yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">
            When a buyer contacts you through your public profile or a listing
            page, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {leads.map((l) => (
            <li key={l.id}>
              <Link
                href={`/agent/leads/${l.id}`}
                className="block overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">{l.buyerName}</p>
                    <p className="text-xs text-stone-500">
                      {l.buyerEmail}
                      {l.buyerPhone ? ` · ${l.buyerPhone}` : ""}
                    </p>
                    {l.listing && (
                      <p className="mt-1 text-xs text-stone-500">
                        About:{" "}
                        <span className="text-stone-700">{l.listing.title}</span>
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
