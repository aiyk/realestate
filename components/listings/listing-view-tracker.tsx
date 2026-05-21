"use client";
import { useEffect } from "react";

export function ListingViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `realestate:viewed:${listingId}`;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // continue anyway
    }
    void fetch(`/api/listings/${listingId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "LISTING_VIEW" }),
      keepalive: true,
    }).catch(() => undefined);
  }, [listingId]);
  return null;
}
