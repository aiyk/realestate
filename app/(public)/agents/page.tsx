import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { StatBadge } from "@/components/ui/stat-badge";
import { cn } from "@/lib/utils";
import { emptyState } from "@/lib/voice";

export const metadata = {
  title: "Agents — Realestate",
  description:
    "Every agent on Realestate is KYC + bank-name verified. Browse the network and start a conversation.",
};
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agentProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { approvedAt: "desc" },
    include: {
      user: {
        select: {
          fullName: true,
          createdAt: true,
          ownedListings: {
            where: {
              status: { in: ["PUBLISHED", "RESERVED", "SOLD"] },
            },
            select: { id: true, status: true, city: true },
          },
        },
      },
    },
  });

  const empty = emptyState("agents");

  const totalLive = agents.reduce(
    (acc, a) =>
      acc + a.user.ownedListings.filter((l) => l.status === "PUBLISHED").length,
    0,
  );
  const totalSold = agents.reduce(
    (acc, a) =>
      acc + a.user.ownedListings.filter((l) => l.status === "SOLD").length,
    0,
  );
  const totalCities = new Set(
    agents.flatMap((a) => a.user.ownedListings.map((l) => l.city)),
  ).size;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-stone-100 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white py-16">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Verified network
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            Meet the agents
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-600 text-pretty">
            Every agent here passed KYC and bank-account verification before
            they could list. Click through to see what they&apos;ve got — or
            start a conversation from any listing.
          </p>
        </div>

        {agents.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 px-6 sm:grid-cols-4">
            <StatBadge
              icon={<Users className="h-4 w-4" />}
              label="Agents"
              value={agents.length}
              tone="emerald"
            />
            <StatBadge
              label="Live listings"
              value={totalLive}
              tone="amber"
            />
            <StatBadge label="Sold" value={totalSold} tone="stone" />
            <StatBadge
              icon={<MapPin className="h-4 w-4" />}
              label="Cities"
              value={totalCities}
              tone="stone"
            />
          </div>
        )}
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {agents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-emerald-700" />
              <p className="mt-4 text-lg font-semibold text-stone-700">
                {empty.headline}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 text-pretty">
                {empty.body}
              </p>
              <Link
                href="/agent/apply"
                className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              >
                Are you an agent? Apply
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((a, i) => {
                const liveCount = a.user.ownedListings.filter(
                  (l) => l.status === "PUBLISHED",
                ).length;
                const soldCount = a.user.ownedListings.filter(
                  (l) => l.status === "SOLD",
                ).length;
                const cities = [
                  ...new Set(a.user.ownedListings.map((l) => l.city)),
                ].slice(0, 3);
                const since = new Date(a.user.createdAt).getFullYear();
                return (
                  <Link
                    key={a.id}
                    href={`/agents/${a.slug}`}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white hover-lift animate-fade-up",
                      `stagger-${(i % 6) + 1}`,
                    )}
                  >
                    {/* Banner */}
                    <div className="relative h-20 bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900">
                      <div className="absolute inset-0 bg-noise opacity-50" />
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-stone-900">
                        <Star className="h-3 w-3 fill-current" /> Verified
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="-mt-10 px-6">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-600 to-emerald-800 text-base font-semibold text-white shadow-md">
                        {a.businessName
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    </div>

                    <div className="p-6 pt-3">
                      <p className="font-semibold text-stone-900 group-hover:text-emerald-700">
                        {a.businessName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {a.user.fullName} · since {since}
                      </p>
                      <Badge variant="success" className="mt-2">
                        <CheckCircle2 className="h-3 w-3" />
                        KYC + bank verified
                      </Badge>

                      {a.bio && (
                        <p className="mt-4 line-clamp-3 text-sm text-stone-600 text-pretty">
                          {a.bio}
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-500">
                            Live
                          </p>
                          <p className="font-semibold text-stone-900">
                            {liveCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-500">
                            Sold
                          </p>
                          <p className="font-semibold text-stone-900">
                            {soldCount}
                          </p>
                        </div>
                      </div>
                      {cities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1 text-xs">
                          {cities.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-stone-700"
                            >
                              <MapPin className="h-3 w-3" />
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
                        See their listings <ArrowRight className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Callout
            tone="concierge"
            title="Want to join?"
            className="mt-12"
          >
            We onboard a fresh batch every Friday. If you can pass KYC + match
            your bank-account name, you can start listing the same week.{" "}
            <Link
              href="/agent/apply"
              className="font-medium text-emerald-700 underline"
            >
              Apply to list
            </Link>
            .
          </Callout>
        </div>
      </section>
    </main>
  );
}
