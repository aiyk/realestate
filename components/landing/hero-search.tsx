"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";

const POPULAR_CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu"];

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 w-full rounded-2xl border border-stone-200 bg-white p-2 shadow-lg sm:p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
        <Field icon={<MapPin className="h-4 w-4" />} label="City">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Lagos, Abuja…"
            list="popular-cities"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
          <datalist id="popular-cities">
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field icon={<Search className="h-4 w-4" />} label="Type">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
          >
            <option value="">Any</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="DUPLEX">Duplex</option>
            <option value="BUNGALOW">Bungalow</option>
            <option value="TERRACE">Terrace</option>
            <option value="LAND">Land</option>
          </select>
        </Field>
        <Field icon={<BedDouble className="h-4 w-4" />} label="Bedrooms">
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </Field>
        <Button type="submit" size="lg" className="h-full min-h-12">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-2 text-xs text-stone-500">
        <span className="font-medium">Popular:</span>
        {POPULAR_CITIES.slice(0, 3).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            className="rounded-full bg-stone-100 px-2.5 py-0.5 text-stone-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            {c}
          </button>
        ))}
      </div>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 transition-colors focus-within:border-emerald-500 focus-within:bg-white">
      <span className="text-stone-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          {label}
        </p>
        {children}
      </div>
    </label>
  );
}
