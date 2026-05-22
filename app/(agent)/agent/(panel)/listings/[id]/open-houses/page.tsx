import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { OpenHouseEditor } from "@/components/listings/open-house-editor";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function OpenHousesPage({ params }: Params) {
  const { id } = await params;
  const u = await getSessionUser();
  if (!u) redirect("/login");

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, agentId: true },
  });
  if (!listing) notFound();
  if (listing.agentId !== u.id && u.role !== "ADMIN") {
    redirect("/agent/listings");
  }

  const openHouses = await prisma.openHouse.findMany({
    where: { listingId: id, cancelledAt: null },
    orderBy: { startsAt: "asc" },
  });

  return (
    <section>
      <Link
        href={`/agent/listings/${id}/edit`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to listing
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Open houses — {listing.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Schedule windows when buyers can show up. We&apos;ll send reminders to
        confirmed visit requests.
      </p>
      <div className="mt-6 max-w-2xl">
        <OpenHouseEditor
          listingId={id}
          initial={openHouses.map((o) => ({
            id: o.id,
            startsAt: o.startsAt.toISOString(),
            endsAt: o.endsAt.toISOString(),
            capacity: o.capacity,
            notes: o.notes,
          }))}
        />
      </div>
    </section>
  );
}
