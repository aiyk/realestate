import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/rbac";
import { verifyTransaction } from "@/lib/paystack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNgn, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { logger } from "@/lib/logger";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reference?: string }>;
};

export default async function CheckoutReturnPage({ params, searchParams }: Props) {
  await params;
  const { reference } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!reference) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <p className="text-sm text-danger-soft-foreground">Missing reference.</p>
      </main>
    );
  }

  const reservation = await prisma.reservation.findUnique({
    where: { reference },
    include: { listing: { select: { title: true, slug: true } } },
  });

  // If real Paystack is configured and we still see PENDING, double-check via verify API.
  if (HAS_PAYSTACK && reservation?.status === "PENDING") {
    try {
      const v = await verifyTransaction(reference);
      if (v.status === "success") {
        // Touch via webhook idempotently: dispatch a server-side call that runs the same
        // pathway. Simpler: just mark PAID here directly with the same audit signature.
        await prisma.$transaction([
          prisma.reservation.update({
            where: { reference },
            data: { status: "PAID", paidAt: new Date() },
          }),
          prisma.listing.update({
            where: { id: reservation.listingId },
            data: { status: "RESERVED" },
          }),
        ]);
      }
    } catch (err) {
      logger.warn("verifyTransaction on return failed", { err: String(err) });
    }
  }

  const latest = await prisma.reservation.findUnique({
    where: { reference },
    include: { listing: { select: { title: true, slug: true } } },
  });

  const status = latest?.status ?? "PENDING";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reservation</span>
            <Badge
              variant={
                status === "PAID" ? "success" : status === "PENDING" ? "warning" : "danger"
              }
            >
              {status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {status === "PAID" ? (
            <>
              <p>
                Deposit received. The agent will contact you shortly to schedule
                inspection and complete the sale.
              </p>
              <p>
                <strong>Reference:</strong> <code>{reference}</code>
              </p>
              {latest?.depositNgn && (
                <p>
                  <strong>Deposit:</strong> {formatNgn(latest.depositNgn.toString())}
                </p>
              )}
            </>
          ) : status === "PENDING" ? (
            <p>
              Payment is still processing. This page will reflect the new
              status once Paystack confirms.
            </p>
          ) : (
            <p>Payment did not complete. You can try again.</p>
          )}
          <div className="flex gap-2 pt-2">
            <Link
              href={`/listings/${latest?.listing.slug ?? ""}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to listing
            </Link>
            <Link
              href="/account/reservations"
              className={cn(buttonVariants())}
            >
              My reservations
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
