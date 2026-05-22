import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ListingCard } from "@/components/listings/listing-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const u = await getSessionUser();
  if (!u) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          agent: { select: { fullName: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-[100rem] flex-1 px-6 pb-20 pt-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Favorites" },
        ]}
      />
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="t-eyebrow text-primary">Saved</p>
          <h1 className="t-h1 mt-1">Your favorites</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground text-pretty">
            Properties you saved while browsing. We&apos;ll let you know if
            anything here changes price or status.
          </p>
        </div>
        <Link
          href="/listings"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Keep browsing <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10">
        {favorites.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-input bg-card">
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="No saves yet"
              description="Tap the heart on any listing and it'll land here. We'll keep an eye on it for you."
              action={
                <Link
                  href="/listings"
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  Browse listings
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((f, i) => (
              <div
                key={f.id}
                className={cn(
                  "animate-fade-up",
                  `stagger-${(i % 6) + 1}`,
                )}
              >
                <ListingCard
                  slug={f.listing.slug}
                  title={f.listing.title}
                  city={f.listing.city}
                  state={f.listing.state}
                  priceNgn={f.listing.priceNgn.toString()}
                  depositNgn={f.listing.depositNgn?.toString()}
                  bedrooms={f.listing.bedrooms}
                  bathrooms={f.listing.bathrooms}
                  areaSqm={f.listing.areaSqm ? Number(f.listing.areaSqm) : null}
                  propertyType={f.listing.propertyType}
                  status={f.listing.status}
                  imageUrl={f.listing.images[0]?.url ?? null}
                  agentName={f.listing.agent?.fullName ?? null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
