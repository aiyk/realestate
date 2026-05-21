import Link from "next/link";
import { BarChart3, CalendarDays } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { ListingForm, type ListingLockLevel } from "@/components/listings/listing-form";
import { AgentListingActions } from "./agent-listing-actions";

type Props = { params: Promise<{ id: string }> };

function lockLevelFor(status: string): ListingLockLevel {
  if (status === "DRAFT" || status === "REJECTED") return "OPEN";
  if (status === "PUBLISHED") return "LIMITED";
  return "LOCKED";
}

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

  const lockLevel = lockLevelFor(listing.status);

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
      {(listing.status === "PUBLISHED" ||
        listing.status === "RESERVED" ||
        listing.status === "SOLD") && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/agent/listings/${listing.id}/analytics`}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-emerald-300 hover:text-emerald-700"
          >
            <BarChart3 className="h-3 w-3" /> Analytics
          </Link>
          <Link
            href={`/agent/listings/${listing.id}/open-houses`}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-emerald-300 hover:text-emerald-700"
          >
            <CalendarDays className="h-3 w-3" /> Open houses
          </Link>
        </div>
      )}
      <div className="mt-6">
        <ListingForm
          mode="edit"
          redirectTo="/agent/listings/{id}/edit"
          lockLevel={lockLevel}
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
            latitude: listing.latitude ? Number(listing.latitude) : undefined,
            longitude: listing.longitude ? Number(listing.longitude) : undefined,
            videoUrl: listing.videoUrl ?? undefined,
            virtualTourUrl: listing.virtualTourUrl ?? undefined,
            youtubeEmbedId: listing.youtubeEmbedId ?? undefined,
            amenities: listing.amenities,
            images: listing.images.map((img) => ({
              storageKey: img.storageKey,
              url: img.url,
              altText: img.altText ?? undefined,
              caption: img.caption ?? undefined,
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
