import Link from "next/link";
import Image from "next/image";
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover-lift-sm hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative h-24 bg-gradient-to-br from-primary via-primary-hover to-foreground">
        {coverPhotoUrl ? (
          <Image
            src={coverPhotoUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-noise opacity-50" />
        )}
        <div className="absolute right-3 top-3">
          <AgentTierBadge tier={performanceTier} />
        </div>
      </div>
      <div className="-mt-10 px-6">
        <div className="inline-block rounded-full ring-4 ring-card">
          <Avatar src={avatarUrl} name={businessName} size="lg" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-3">
        <p className="font-semibold text-foreground group-hover:text-primary">
          {businessName}
        </p>
        <p className="text-xs text-muted-foreground">
          {fullName} · since {yearJoined}
        </p>
        {tagline && (
          <p className="mt-2 line-clamp-2 text-sm text-foreground text-pretty">
            {tagline}
          </p>
        )}
        {!tagline && bio && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground text-pretty">
            {bio}
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">Live</p>
            <p className="text-sm font-semibold text-foreground">{liveCount}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">Sold</p>
            <p className="text-sm font-semibold text-foreground">{soldCount}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-muted-foreground">Rating</p>
            {ratingAvg && ratingCount > 0 ? (
              <p className="inline-flex items-center gap-0.5 text-sm font-semibold text-foreground">
                {ratingAvg.toFixed(1)}
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="text-[10px] font-normal text-muted-foreground">
                  ({ratingCount})
                </span>
              </p>
            ) : (
              <p className="text-sm text-text-subtle">—</p>
            )}
          </div>
        </div>
        {cities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 text-xs">
            {cities.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-foreground"
              >
                <MapPin className="h-3 w-3" />
                {c}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          See their listings <ArrowRight className="h-3.5 w-3.5" />
        </p>
      </div>
    </Link>
  );
}
