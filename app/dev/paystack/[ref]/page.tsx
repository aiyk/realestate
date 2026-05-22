import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNgn } from "@/lib/utils";
import { PayButton } from "./pay-button";

const HAS_PAYSTACK =
  !!process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.endsWith("placeholder");

type Props = { params: Promise<{ ref: string }> };

export default async function DevPaystackPage({ params }: Props) {
  if (HAS_PAYSTACK) redirect("/");

  const { ref } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { reference: ref },
    include: { listing: { select: { title: true } }, buyer: { select: { email: true } } },
  });
  if (!reservation) notFound();

  const callback = `/checkout/${reservation.listingId}/return?reference=${reservation.reference}`;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Paystack (dev simulator)</CardTitle>
          <p className="text-xs text-accent">
            Real Paystack keys are not configured. This stand-in simulates the
            payment + webhook for local testing only.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Listing:</strong> {reservation.listing.title}
          </p>
          <p>
            <strong>Buyer:</strong> {reservation.buyer.email}
          </p>
          <p>
            <strong>Deposit:</strong>{" "}
            {formatNgn(reservation.depositNgn.toString())}
          </p>
          <p>
            <strong>Reference:</strong> <code>{reservation.reference}</code>
          </p>
          <p>
            <strong>Status:</strong> {reservation.status}
          </p>
          <PayButton reference={reservation.reference} callbackUrl={callback} />
        </CardContent>
      </Card>
    </main>
  );
}
