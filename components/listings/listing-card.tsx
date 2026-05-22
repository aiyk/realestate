"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Bed, Bath, Square, MapPin, Heart, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNgn } from "@/lib/utils";

type ListingCardProps = {
  slug: string;
  title: string;
  city: string;
  state: string;
  priceNgn: string | number;
  depositNgn?: string | number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | string | null;
  propertyType?: string;
  status?: string;
  imageUrl?: string | null;
  agentName?: string | null;
  isNew?: boolean;
  className?: string;
};

const TYPE_LABEL: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  LAND: "Land",
  DUPLEX: "Duplex",
  BUNGALOW: "Bungalow",
  TERRACE: "Terrace",
};

function PlaceholderArt() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-text-subtle">
      <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
        <path
          d="M6 26 L24 10 L42 26 L42 40 L6 40 Z"
          fill="currentColor"
          opacity="0.2"
        />
      </svg>
      <span className="text-xs">No photo yet</span>
    </div>
  );
}

export function ListingCard({
  slug,
  title,
  city,
  state,
  priceNgn,
  depositNgn,
  bedrooms,
  bathrooms,
  areaSqm,
  propertyType,
  status,
  imageUrl,
  agentName,
  isNew,
}: ListingCardProps) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const deposit = depositNgn ? formatNgn(depositNgn.toString()) : null;
  const showImage = Boolean(imageUrl) && !imgFailed;

  return (
    <Link
      href={`/listings/${slug}`}
      className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-surface-2">
        {showImage ? (
          <Image
            src={imageUrl!}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <PlaceholderArt />
        )}

        {/* Gradient overlay for legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/10 to-transparent"
          aria-hidden="true"
        />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {propertyType && (
            <Badge variant="default" className="backdrop-blur">
              {TYPE_LABEL[propertyType] ?? propertyType.toLowerCase()}
            </Badge>
          )}
          {isNew && status === "PUBLISHED" && (
            <Badge variant="accent" className="backdrop-blur">
              ✨ New
            </Badge>
          )}
          {status === "RESERVED" && (
            <Badge variant="warning" className="backdrop-blur">
              Reserved
            </Badge>
          )}
          {status === "SOLD" && (
            <Badge variant="secondary" className="backdrop-blur">
              Sold
            </Badge>
          )}
        </div>

        {/* Top-right: verify ribbon */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[10px] font-semibold text-primary-soft-foreground shadow-sm">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        </div>

        {/* Bottom-left: price on photo */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div className="text-white drop-shadow-lg">
            <p className="text-[10px] uppercase tracking-wider text-white/90">
              From
            </p>
            <p className="text-xl font-bold leading-tight">
              {formatNgn(priceNgn.toString())}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-card/95 text-muted-foreground shadow-sm transition-colors hover:text-danger"
          >
            <Heart className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {city}, {state}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {bedrooms ? (
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-text-subtle" />
              {bedrooms}
            </span>
          ) : null}
          {bathrooms ? (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-text-subtle" />
              {bathrooms}
            </span>
          ) : null}
          {areaSqm ? (
            <span className="inline-flex items-center gap-1">
              <Square className="h-3.5 w-3.5 text-text-subtle" />
              {Number(areaSqm)} sqm
            </span>
          ) : null}
          {agentName && (
            <span className="ml-auto truncate text-text-subtle" title={agentName}>
              · {agentName}
            </span>
          )}
        </div>

        {deposit && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-primary-soft px-3 py-2 text-[11px] text-primary-soft-foreground">
            <span className="font-semibold">Reserve for {deposit}</span>
            <span className="opacity-80">refundable in 48h</span>
          </div>
        )}
      </div>
    </Link>
  );
}
