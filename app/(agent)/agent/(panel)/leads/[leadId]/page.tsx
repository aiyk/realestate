import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { LeadStatusChanger } from "@/components/agent/leads/lead-status-changer";
import { LeadConvertButton } from "@/components/agent/leads/lead-convert-button";
import { LeadNotes } from "@/components/agent/leads/lead-notes";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ leadId: string }> };

const STATUS_VARIANT = {
  NEW: "warning",
  CONTACTED: "secondary",
  QUALIFIED: "default",
  BOOKED: "success",
  LOST: "danger",
} as const;

export default async function LeadDetailPage({ params }: Params) {
  const { leadId } = await params;
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (u.role !== "AGENT") redirect("/agent");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      listing: { select: { title: true, slug: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { fullName: true } } },
      },
      thread: { select: { id: true } },
      sourceContactInquiry: { select: { message: true, viewingAt: true } },
    },
  });
  if (!lead) notFound();
  if (lead.agentId !== u.id) redirect("/agent/leads");

  return (
    <section>
      <Link
        href="/agent/leads"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-3 w-3" /> All leads
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lead.buyerName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {lead.buyerEmail}
            </span>
            {lead.buyerPhone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {lead.buyerPhone}
              </span>
            )}
            {lead.followUpAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />{" "}
                Follow up {lead.followUpAt.toLocaleDateString("en-NG")}
              </span>
            )}
          </div>
          {lead.listing && (
            <p className="mt-1 text-sm text-stone-500">
              About:{" "}
              <Link
                href={`/listings/${lead.listing.slug}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                {lead.listing.title}
              </Link>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <Badge variant={STATUS_VARIANT[lead.status]}>{lead.status}</Badge>
          <LeadStatusChanger leadId={lead.id} current={lead.status} />
        </div>
      </div>

      {lead.sourceContactInquiry?.message && (
        <Callout tone="info" title="What they sent" className="mt-6">
          <p className="whitespace-pre-line">{lead.sourceContactInquiry.message}</p>
          {lead.sourceContactInquiry.viewingAt && (
            <p className="mt-2 text-xs">
              Preferred viewing:{" "}
              {lead.sourceContactInquiry.viewingAt.toLocaleString("en-NG")}
            </p>
          )}
        </Callout>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <LeadNotes
            leadId={lead.id}
            initial={lead.notes.map((n) => ({
              id: n.id,
              body: n.body,
              createdAt: n.createdAt.toISOString(),
              authorName: n.author.fullName,
            }))}
          />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-stone-900">Quick actions</p>
            <div className="mt-3 space-y-3">
              {lead.thread ? (
                <Link
                  href={`/agent/messages/${lead.thread.id}`}
                  className="block text-sm font-medium text-emerald-700 hover:underline"
                >
                  Open existing conversation →
                </Link>
              ) : (
                <LeadConvertButton
                  leadId={lead.id}
                  canConvert={Boolean(lead.buyerUserId && lead.listingId)}
                />
              )}
              <a
                href={`mailto:${lead.buyerEmail}`}
                className="block text-sm font-medium text-stone-700 hover:underline"
              >
                Email {lead.buyerEmail}
              </a>
              {lead.buyerPhone && (
                <a
                  href={`tel:${lead.buyerPhone}`}
                  className="block text-sm font-medium text-stone-700 hover:underline"
                >
                  Call {lead.buyerPhone}
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
