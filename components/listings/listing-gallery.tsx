"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Image = { id: string; url: string; altText?: string | null };

export function ListingGallery({ images }: { images: Image[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  if (images.length === 0) {
    return (
      <div className="mt-6 flex aspect-[16/9] items-center justify-center rounded-3xl bg-surface-2 text-text-subtle">
        No images
      </div>
    );
  }
  const main = images[active];
  const rest = images.slice(1, 5);
  function prev() {
    setActive((a) => (a - 1 + images.length) % images.length);
  }
  function next() {
    setActive((a) => (a + 1) % images.length);
  }

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`Open photo gallery (${images.length} photos)`}
          className="group relative aspect-[5/4] overflow-hidden rounded-3xl bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main.url}
            alt={main.altText ?? "Listing"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            View {images.length} photos
          </span>
        </button>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          {rest.length > 0
            ? rest.map((img, i) => (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => {
                    setActive(i + 1);
                    setLightbox(true);
                  }}
                  className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? `Image ${i + 2}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              ))
            : Array.from({ length: 2 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-[5/4] rounded-2xl bg-surface-2"
                />
              ))}
        </div>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="relative max-h-full max-w-5xl animate-scale-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main.url}
              alt={main.altText ?? "Listing"}
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
            <p className="mt-3 text-center text-sm text-white/80">
              {active + 1} / {images.length}
            </p>
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? `Thumb ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
