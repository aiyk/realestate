import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNgn, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutAction } from "./checkout-action";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/checkout/${id}`);
  if (!user.emailVerified) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email first</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-600">
            <p>You must verify your email before reserving a property.</p>
            <Link
              href="/account"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to account
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }
  if (user.kycStatus !== "VERIFIED") {
    redirect("/account/kyc");
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      priceNgn: true,
      depositNgn: true,
      city: true,
      state: true,
    },
  });
  if (!listing) notFound();

  if (listing.status !== "PUBLISHED") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>No longer available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-600">
            <p>This listing has been reserved or sold.</p>
            <Link
              href={`/listings/${listing.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to listing
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold">Reserve {listing.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {listing.city}, {listing.state}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Deposit summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Property price</span>
            <span className="font-medium">
              {formatNgn(listing.priceNgn.toString())}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Reservation deposit</span>
            <span className="font-medium">
              {formatNgn(listing.depositNgn.toString())}
            </span>
          </div>
          <p className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
            By proceeding you agree that the deposit reserves this property
            pending offline completion. The deposit is held by the platform and
            applied to the final purchase, or refunded according to the
            agreement with the agent.
          </p>
          <CheckoutAction listingId={listing.id} />
        </CardContent>
      </Card>
    </main>
  );
}
