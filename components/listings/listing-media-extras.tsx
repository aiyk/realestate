"use client";
import { CalendarDays, Film, Globe, Users } from "lucide-react";

type OpenHouse = {
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  notes: string | null;
};

type Props = {
  listingId: string;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  youtubeEmbedId?: string | null;
  openHouses: OpenHouse[];
};

function track(listingId: string, kind: string) {
  void fetch(`/api/listings/${listingId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
    keepalive: true,
  }).catch(() => undefined);
}

function formatRange(startsAt: string, endsAt: string) {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const sameDay = s.toDateString() === e.toDateString();
  const day = s.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const start = s.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = e.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return sameDay
    ? `${day} · ${start}–${end}`
    : `${day} ${start} → ${e.toLocaleString("en-NG")}`;
}

export function ListingMediaExtras({
  listingId,
  videoUrl,
  virtualTourUrl,
  youtubeEmbedId,
  openHouses,
}: Props) {
  const hasMedia = Boolean(videoUrl || virtualTourUrl || youtubeEmbedId);
  if (!hasMedia && openHouses.length === 0) return null;
  return (
    <div className="space-y-8">
      {youtubeEmbedId && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Walkthrough video
          </p>
          <div className="mt-3 aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
              title="Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
      {(videoUrl || virtualTourUrl) && (
        <div className="flex flex-wrap gap-2">
          {virtualTourUrl && (
            <a
              href={virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(listingId, "LISTING_VIRTUAL_TOUR_OPEN")}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              <Globe className="h-4 w-4 text-emerald-700" />
              Open virtual tour
            </a>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              <Film className="h-4 w-4 text-emerald-700" />
              Watch full video
            </a>
          )}
        </div>
      )}
      {openHouses.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Open houses
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Show up during these windows — no appointment needed.
          </p>
          <ul className="mt-3 space-y-2">
            {openHouses.map((o, i) => (
              <li
                key={`${o.startsAt}-${i}`}
                className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3"
              >
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {formatRange(o.startsAt, o.endsAt)}
                  </p>
                  {o.notes && (
                    <p className="mt-0.5 text-xs text-stone-600">{o.notes}</p>
                  )}
                  {o.capacity && (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-stone-500">
                      <Users className="h-3 w-3" /> Up to {o.capacity} guests
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
