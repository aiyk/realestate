import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { ListingForm } from "@/components/listings/listing-form";
import { AgentListingActions } from "./agent-listing-actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditAgentListingPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!listing) notFound();
  if (listing.agentId !== user.id) redirect("/agent/listings");

  const canEdit = ["DRAFT", "REJECTED"].includes(listing.status);

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
            <Badge>{listing.status.replace("_", " ")}</Badge>
            <span>·</span>
            <span>{listing.city}, {listing.state}</span>
          </p>
        </div>
        <AgentListingActions id={listing.id} status={listing.status} />
      </div>
      {listing.rejectionReason && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Reason for rejection:</strong> {listing.rejectionReason}
        </p>
      )}
      {!canEdit && (
        <p className="mt-4 rounded-md bg-neutral-100 p-3 text-sm text-neutral-700">
          Editing locked. Contact admin if changes are needed.
        </p>
      )}
      <div className={`mt-6 ${canEdit ? "" : "pointer-events-none opacity-60"}`}>
        <ListingForm
          mode="edit"
          redirectTo="/agent/listings/{id}/edit"
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
