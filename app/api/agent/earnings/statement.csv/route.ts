import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, requireAgent } from "@/lib/rbac";

function csvCell(s: unknown): string {
  const v = String(s ?? "");
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(req: NextRequest) {
  try {
    const u = await requireAgent();
    const sp = req.nextUrl.searchParams;
    const from = sp.get("from");
    const to = sp.get("to");
    const status = sp.get("status") ?? undefined;
    const listingId = sp.get("listingId") ?? undefined;

    const profile = await prisma.agentProfile.findUnique({
      where: { userId: u.id },
      select: { id: true },
    });
    if (!profile) {
      return new Response("Forbidden", { status: 403 });
    }

    const rows = await prisma.commissionLedger.findMany({
      where: {
        agentId: profile.id,
        ...(status && { status: status as never }),
        ...(listingId && { listingId }),
        ...(from && { createdAt: { gte: new Date(from) } }),
        ...(to && { createdAt: { lte: new Date(to) } }),
      },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { title: true, slug: true } } },
    });

    const header = [
      "Date",
      "Listing",
      "Sale price (NGN)",
      "Commission %",
      "Commission (NGN)",
      "Platform fee (NGN)",
      "Net payout (NGN)",
      "Status",
      "Paid at",
    ];
    const lines = [
      header.map(csvCell).join(","),
      ...rows.map((r) =>
        [
          r.createdAt.toISOString(),
          r.listing.title,
          r.salePriceNgn.toString(),
          r.agentCommissionPct.toString(),
          r.agentCommissionNgn.toString(),
          r.platformFeeNgn.toString(),
          r.netPayoutNgn.toString(),
          r.status,
          r.paidAt ? r.paidAt.toISOString() : "",
        ]
          .map(csvCell)
          .join(","),
      ),
    ];

    const filename = `earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
