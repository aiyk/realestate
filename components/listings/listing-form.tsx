"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPicker } from "@/components/listings/map-picker";
import { VideoFields } from "@/components/listings/video-fields";
import { ListingImageManager } from "@/components/listings/listing-image-manager";

type ListingFormImage = {
  storageKey: string;
  url: string;
  altText?: string;
  caption?: string;
  isCover?: boolean;
};

type ListingFormValues = {
  id?: string;
  title: string;
  description: string;
  propertyType: string;
  priceNgn: number;
  depositNgn: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  videoUrl?: string;
  virtualTourUrl?: string;
  youtubeEmbedId?: string;
  amenities: string[];
  images: ListingFormImage[];
  agentCommissionPct?: number;
  platformFeePct?: number;
};

export type ListingLockLevel = "OPEN" | "LIMITED" | "LOCKED";

const PROPERTY_TYPES = [
  "HOUSE",
  "APARTMENT",
  "LAND",
  "DUPLEX",
  "BUNGALOW",
  "TERRACE",
] as const;

export function ListingForm({
  initial,
  mode,
  redirectTo,
  lockLevel = "OPEN",
}: {
  initial?: Partial<ListingFormValues>;
  mode: "create" | "edit";
  /**
   * Path to redirect to after save. Use `{id}` placeholder to inject the
   * created/updated listing id, e.g. `/admin/listings/{id}/edit`.
   */
  redirectTo: string;
  lockLevel?: ListingLockLevel;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ListingFormImage[]>(initial?.images ?? []);
  const [lat, setLat] = useState<number | null>(
    typeof initial?.latitude === "number" ? initial.latitude : null,
  );
  const [lng, setLng] = useState<number | null>(
    typeof initial?.longitude === "number" ? initial.longitude : null,
  );

  const hardLocked = lockLevel === "LIMITED" || lockLevel === "LOCKED";
  const fullyLocked = lockLevel === "LOCKED";


  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (images.length === 0) {
      setError("At least one image is required");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const amenities = String(fd.get("amenities") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: String(fd.get("title")),
      description: String(fd.get("description")),
      propertyType: String(fd.get("propertyType")),
      priceNgn: Number(fd.get("priceNgn")),
      depositNgn: Number(fd.get("depositNgn")),
      bedrooms: fd.get("bedrooms") ? Number(fd.get("bedrooms")) : undefined,
      bathrooms: fd.get("bathrooms") ? Number(fd.get("bathrooms")) : undefined,
      areaSqm: fd.get("areaSqm") ? Number(fd.get("areaSqm")) : undefined,
      addressLine: String(fd.get("addressLine")),
      city: String(fd.get("city")),
      state: String(fd.get("state")),
      country: String(fd.get("country") || "Nigeria"),
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
      videoUrl: String(fd.get("videoUrl") ?? "") || undefined,
      virtualTourUrl: String(fd.get("virtualTourUrl") ?? "") || undefined,
      youtubeEmbedId: String(fd.get("youtubeEmbedId") ?? "") || undefined,
      amenities,
      images: images.map((img, i) => ({
        storageKey: img.storageKey,
        url: img.url,
        altText: img.altText || undefined,
        sortOrder: i,
        isCover: img.isCover ?? i === 0,
      })),
      agentCommissionPct: fd.get("agentCommissionPct")
        ? Number(fd.get("agentCommissionPct"))
        : undefined,
      platformFeePct: fd.get("platformFeePct")
        ? Number(fd.get("platformFeePct"))
        : 1,
    };

    const url = mode === "create" ? "/api/listings" : `/api/listings/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error?.issues?.[0]?.message ?? data?.error?.message ?? "Save failed";
      setError(msg);
      return;
    }
    const data = await res.json();
    const id = (data.listing?.id as string) ?? initial?.id ?? "";
    router.push(redirectTo.replace("{id}", id));
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
      data-locked={fullyLocked ? "true" : undefined}
    >
      {lockLevel === "LIMITED" && (
        <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Limited edits</p>
          <p className="mt-1">
            Address, property type and map location are locked once a listing
            is live. Price changes over ±10% will pause your listing for
            re-review.
          </p>
        </div>
      )}
      {lockLevel === "LOCKED" && (
        <div className="md:col-span-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Editing is paused while this listing is under review (or already
          reserved/sold).
        </div>
      )}
      <div className="md:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title}
          required
          minLength={5}
          maxLength={160}
          className="mt-1"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          required
          minLength={20}
          maxLength={5000}
          rows={5}
          className="mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        />
      </div>

      <div>
        <Label htmlFor="propertyType">Property type</Label>
        <select
          id="propertyType"
          name="propertyType"
          defaultValue={initial?.propertyType ?? "HOUSE"}
          disabled={hardLocked}
          className="mt-1 block h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm disabled:bg-stone-100 disabled:opacity-60"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="priceNgn">Price (₦)</Label>
        <Input
          id="priceNgn"
          name="priceNgn"
          type="number"
          min="1"
          step="1"
          defaultValue={initial?.priceNgn}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="depositNgn">Deposit (₦)</Label>
        <Input
          id="depositNgn"
          name="depositNgn"
          type="number"
          min="1"
          step="1"
          defaultValue={initial?.depositNgn}
          required
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="bedrooms">Beds</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            defaultValue={initial?.bedrooms}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baths</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            defaultValue={initial?.bathrooms}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="areaSqm">sqm</Label>
          <Input
            id="areaSqm"
            name="areaSqm"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.areaSqm}
            className="mt-1"
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="addressLine">Address</Label>
        <Input
          id="addressLine"
          name="addressLine"
          defaultValue={initial?.addressLine}
          required
          disabled={hardLocked}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          defaultValue={initial?.city}
          required
          disabled={hardLocked}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          name="state"
          defaultValue={initial?.state}
          required
          disabled={hardLocked}
          className="mt-1"
        />
      </div>

      <div className="md:col-span-2">
        <Label>Map location</Label>
        <div className={hardLocked ? "pointer-events-none opacity-60" : ""}>
          <MapPicker
            initialLat={
              typeof initial?.latitude === "number" ? initial.latitude : undefined
            }
            initialLng={
              typeof initial?.longitude === "number" ? initial.longitude : undefined
            }
            onChange={(a, b) => {
              setLat(a);
              setLng(b);
            }}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <Label>Video &amp; virtual tour</Label>
        <div className="mt-2">
          <VideoFields
            initialVideoUrl={initial?.videoUrl}
            initialVirtualTourUrl={initial?.virtualTourUrl}
            initialYoutubeEmbedId={initial?.youtubeEmbedId}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
        <Input
          id="amenities"
          name="amenities"
          defaultValue={initial?.amenities?.join(", ")}
          placeholder="parking, swimming pool, generator"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="agentCommissionPct">Agent commission %</Label>
        <Input
          id="agentCommissionPct"
          name="agentCommissionPct"
          type="number"
          step="0.01"
          min="0"
          max="50"
          defaultValue={initial?.agentCommissionPct}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="platformFeePct">Platform fee %</Label>
        <Input
          id="platformFeePct"
          name="platformFeePct"
          type="number"
          step="0.01"
          min="0"
          max="50"
          defaultValue={initial?.platformFeePct ?? 1}
          className="mt-1"
        />
      </div>

      <div className="md:col-span-2">
        <Label>Images</Label>
        <div className="mt-2">
          <ListingImageManager
            listingId={initial?.id}
            initial={images}
            onChange={setImages}
            max={20}
          />
        </div>
      </div>

      {error && (
        <p className="md:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
