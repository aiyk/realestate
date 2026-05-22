import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingActions } from "./listing-actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!listing) notFound();

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge>{listing.status.replace("_", " ")}</Badge>
            <span>·</span>
            <span>{listing.city}, {listing.state}</span>
          </p>
        </div>
        <ListingActions id={listing.id} status={listing.status} />
      </div>
      {listing.rejectionReason && (
        <p className="mt-4 rounded-md bg-accent-soft p-3 text-sm text-accent-soft-foreground">
          <strong>Rejection reason:</strong> {listing.rejectionReason}
        </p>
      )}
      <div className="mt-6">
        <ListingForm
          mode="edit"
          redirectTo="/admin/listings/{id}/edit"
          initial={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            propertyType: listing.propertyType,
            priceNgn: Number(listing.priceNgn),
            depositNgn: Number(listing.depositNgn),
            bedrooms: listing.bedrooms ?? undefined,
            bathrooms: listing.bathrooms ?? undefined,
            areaSqm: listing.areaSqm ? Number(listing.areaSqm) : undefined,
            addressLine: listing.addressLine,
            city: listing.city,
            state: listing.state,
            country: listing.country,
            amenities: listing.amenities,
            images: listing.images.map((img) => ({
              storageKey: img.storageKey,
              url: img.url,
              altText: img.altText ?? undefined,
              isCover: img.isCover,
            })),
            agentCommissionPct: listing.agentCommissionPct
              ? Number(listing.agentCommissionPct)
              : undefined,
            platformFeePct: Number(listing.platformFeePct),
          }}
        />
      </div>
    </section>
  );
}
