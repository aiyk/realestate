"use client";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  initialLat?: number;
  initialLng?: number;
  lat?: string;
  lng?: string;
  onChange?: (lat: number | null, lng: number | null) => void;
};

function osmStaticUrl(lat: number, lng: number) {
  // Static map via OSM "static-maps" — no API key. Falls back to a marker if dimensions don't render.
  const zoom = 14;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=mapnik&markers=${lat},${lng},red`;
}

export function MapPicker({ initialLat, initialLng, onChange }: Props) {
  const [lat, setLat] = useState<string>(
    initialLat !== undefined ? initialLat.toString() : "",
  );
  const [lng, setLng] = useState<string>(
    initialLng !== undefined ? initialLng.toString() : "",
  );
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const latN = Number.parseFloat(lat);
  const lngN = Number.parseFloat(lng);
  const hasCoords =
    Number.isFinite(latN) &&
    Number.isFinite(lngN) &&
    Math.abs(latN) <= 90 &&
    Math.abs(lngN) <= 180;

  function commit(nextLat: string, nextLng: string) {
    setLat(nextLat);
    setLng(nextLng);
    const a = Number.parseFloat(nextLat);
    const b = Number.parseFloat(nextLng);
    onChange?.(Number.isFinite(a) ? a : null, Number.isFinite(b) ? b : null);
  }

  function useMyLocation() {
    setErr(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErr("Geolocation not available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        commit(
          pos.coords.latitude.toFixed(6),
          pos.coords.longitude.toFixed(6),
        );
        setLocating(false);
      },
      (e) => {
        setErr(e.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="0.000001"
            min={-90}
            max={90}
            value={lat}
            onChange={(e) => commit(e.target.value, lng)}
            placeholder="6.524379"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="0.000001"
            min={-180}
            max={180}
            value={lng}
            onChange={(e) => commit(lat, e.target.value)}
            placeholder="3.379206"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={useMyLocation}
            disabled={locating}
            className="w-full"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Use my location
          </Button>
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {hasCoords ? (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={osmStaticUrl(latN, lngN)}
            alt={`Map preview at ${latN}, ${lngN}`}
            className="h-48 w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <p className="text-xs text-stone-500">
          Adding coordinates lets buyers preview the location on a map.
        </p>
      )}
    </div>
  );
}
