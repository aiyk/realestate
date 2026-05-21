import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AgentTierBadge } from "@/components/agent/agent-tier-badge";

type Props = {
  slug: string;
  businessName: string;
  fullName: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  liveCount: number;
  soldCount: number;
  ratingAvg: number | null;
  ratingCount: number;
  cities: string[];
  performanceTier: "TOP_PERFORMER" | "RISING_STAR" | null;
  yearJoined: number;
};

export function AgentDirectoryCard({
  slug,
  businessName,
  fullName,
  tagline,
  bio,
  avatarUrl,
  coverPhotoUrl,
  liveCount,
  soldCount,
  ratingAvg,
  ratingCount,
  cities,
  performanceTier,
  yearJoined,
}: Props) {
  return (
    <Link
      href={`/agents/${slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-24 bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900">
        {coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPhotoUrl}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-noise opacity-50" />
        )}
        <div className="absolute right-3 top-3">
          <AgentTierBadge tier={performanceTier} />
        </div>
      </div>
      <div className="-mt-10 px-6">
        <div className="ring-4 ring-white rounded-full inline-block">
          <Avatar src={avatarUrl} name={businessName} size="lg" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-3">
        <p className="font-semibold text-stone-900 group-hover:text-emerald-700">
          {businessName}
        </p>
        <p className="text-xs text-stone-500">
          {fullName} · since {yearJoined}
        </p>
        {tagline && (
          <p className="mt-2 line-clamp-2 text-sm text-stone-700 text-pretty">
            {tagline}
          </p>
        )}
        {!tagline && bio && (
          <p className="mt-2 line-clamp-3 text-sm text-stone-600 text-pretty">
            {bio}
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-xs">
          <div>
            <p className="uppercase tracking-wider text-stone-500">Live</p>
            <p className="text-sm font-semibold text-stone-900">{liveCount}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-stone-500">Sold</p>
            <p className="text-sm font-semibold text-stone-900">{soldCount}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-stone-500">Rating</p>
            {ratingAvg && ratingCount > 0 ? (
              <p className="inline-flex items-center gap-0.5 text-sm font-semibold text-stone-900">
                {ratingAvg.toFixed(1)}
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-normal text-stone-500">
                  ({ratingCount})
                </span>
              </p>
            ) : (
              <p className="text-sm text-stone-400">—</p>
            )}
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
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
          See their listings <ArrowRight className="h-3.5 w-3.5" />
        </p>
      </div>
    </Link>
  );
}
