import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/rbac";
import { contactInquirySchema } from "@/lib/schemas/agent";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { sendMail } from "@/lib/mailer";

const SALT = process.env.CONTACT_INQUIRY_SALT ?? "dev-inquiry-salt";

function ipHash(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return createHash("sha256").update(`${ip}|${SALT}`).digest("hex");
}

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = contactInquirySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const data = parsed.data;
    // Honeypot — silently succeed without persisting
    if (data._hp && data._hp.trim() !== "") {
      return Response.json({ ok: true });
    }

    const agent = await prisma.agentProfile.findUnique({
      where: { slug },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
    if (!agent || agent.status !== "APPROVED") {
      return Response.json({ error: { code: "not_found" } }, { status: 404 });
    }

    // Validate optional listingId belongs to this agent
    let listingId: string | null = null;
    let listingTitle: string | null = null;
    if (data.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: data.listingId },
        select: { id: true, title: true, agentId: true },
      });
      if (listing && listing.agentId === agent.userId) {
        listingId = listing.id;
        listingTitle = listing.title;
      }
    }

    const ipH = ipHash(req);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [perIp, perEmail] = await Promise.all([
      prisma.contactInquiry.count({
        where: { ipHash: ipH, createdAt: { gte: oneHourAgo } },
      }),
      prisma.contactInquiry.count({
        where: {
          email: { equals: data.email, mode: "insensitive" },
          createdAt: { gte: oneDayAgo },
        },
      }),
    ]);
    if (perIp >= 3) {
      return Response.json(
        {
          error: {
            code: "too_many_requests",
            message: "Slow down — you've sent a few already. Try again later.",
          },
        },
        { status: 429 },
      );
    }
    if (perEmail >= 5) {
      return Response.json(
        {
          error: {
            code: "too_many_requests",
            message: "You've sent a lot today. The agent will reach out soon.",
          },
        },
        { status: 429 },
      );
    }

    const viewingAt =
      data.kind === "VIEWING_REQUEST" && data.viewingAt
        ? new Date(data.viewingAt)
        : null;

    const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

    const inquiry = await prisma.$transaction(async (tx) => {
      const row = await tx.contactInquiry.create({
        data: {
          agentId: agent.id,
          listingId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          kind: data.kind,
          viewingAt,
          ipHash: ipH,
          userAgent,
        },
      });

      let visitRequestId: string | null = null;
      if (data.kind === "VIEWING_REQUEST" && listingId) {
        const vr = await tx.visitRequest.create({
          data: {
            listingId,
            contactInquiryId: row.id,
            slotStartsAt: viewingAt,
            notes: data.message,
          },
        });
        visitRequestId = vr.id;
      }

      await tx.lead.create({
        data: {
          agentId: agent.user.id,
          listingId,
          kind:
            data.kind === "VIEWING_REQUEST" ? "VISIT_REQUEST" : "CONTACT_INQUIRY",
          sourceContactInquiryId: row.id,
          sourceVisitRequestId: visitRequestId,
          source: listingId ? "LISTING" : "PROFILE",
          status: "NEW",
          buyerName: data.name,
          buyerEmail: data.email,
          buyerPhone: data.phone ?? null,
        },
      });

      if (listingId) {
        await tx.listing.update({
          where: { id: listingId },
          data: { inquiryCount: { increment: 1 } },
        });
      }

      return row;
    });

    await audit({
      actorId: null,
      action: "agent.contact_inquiry.create",
      entityType: "ContactInquiry",
      entityId: inquiry.id,
      meta: { agentId: agent.id, listingId, kind: data.kind },
    });

    // Email the agent directly so they don't miss it
    if (agent.user.email) {
      const subject =
        data.kind === "VIEWING_REQUEST"
          ? `New viewing request${listingTitle ? ` — ${listingTitle}` : ""}`
          : `New inquiry from ${data.name}`;
      const html = `<p><strong>${data.name}</strong> ${data.kind === "VIEWING_REQUEST" ? "wants to view" : "has a question"}${listingTitle ? ` about <strong>${listingTitle}</strong>` : ""}.</p>
<p>Email: ${data.email}${data.phone ? ` · Phone: ${data.phone}` : ""}</p>
${viewingAt ? `<p>Preferred time: ${viewingAt.toLocaleString("en-NG")}</p>` : ""}
<blockquote style="border-left:3px solid #047857;padding-left:12px;color:#374151;">${data.message.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c))}</blockquote>
<p><a href="${process.env.NEXTAUTH_URL ?? ""}/agent/leads">Open in your dashboard</a></p>`;
      await sendMail({ to: agent.user.email, subject, html });
    }

    await notify({
      userId: agent.user.id,
      type: "LEAD_NEW",
      title:
        data.kind === "VIEWING_REQUEST"
          ? `Viewing request from ${data.name}`
          : `New inquiry from ${data.name}`,
      body: data.message.slice(0, 160),
      entityType: "Lead",
      entityId: inquiry.id,
      actionUrl: "/agent/leads",
    });

    return Response.json({ ok: true, id: inquiry.id });
  } catch (err) {
    return errorResponse(err);
  }
}
