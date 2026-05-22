"use client";
import { useState } from "react";
import { Film, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseYouTubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be") return url.pathname.slice(1, 12);
    if (url.hostname.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2]?.slice(0, 11) ?? "";
      }
    }
  } catch {
    // not a URL
  }
  return "";
}

type Props = {
  initialVideoUrl?: string;
  initialVirtualTourUrl?: string;
  initialYoutubeEmbedId?: string;
};

export function VideoFields({
  initialVideoUrl,
  initialVirtualTourUrl,
  initialYoutubeEmbedId,
}: Props) {
  const [yt, setYt] = useState(initialYoutubeEmbedId ?? "");
  const ytId = parseYouTubeId(yt);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="videoUrl">
          <span className="inline-flex items-center gap-1">
            <Film className="h-4 w-4" /> Video URL (MP4 / link)
          </span>
        </Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          defaultValue={initialVideoUrl ?? ""}
          placeholder="https://..."
          type="url"
        />
      </div>
      <div>
        <Label htmlFor="virtualTourUrl">
          <span className="inline-flex items-center gap-1">
            <Globe className="h-4 w-4" /> Virtual tour (Matterport / 3D)
          </span>
        </Label>
        <Input
          id="virtualTourUrl"
          name="virtualTourUrl"
          defaultValue={initialVirtualTourUrl ?? ""}
          placeholder="https://my.matterport.com/show/?m=..."
          type="url"
        />
      </div>
      <div>
        <Label htmlFor="youtubeEmbedId">YouTube tour</Label>
        <Input
          id="youtubeEmbedId"
          name="youtubeEmbedId"
          value={yt}
          onChange={(e) => setYt(e.target.value)}
          placeholder="Paste a YouTube link or 11-char id"
        />
        {ytId ? (
          <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : yt.trim() ? (
          <p className="mt-1 text-xs text-accent">
            Couldn&apos;t detect a YouTube video id from that input.
          </p>
        ) : null}
      </div>
    </div>
  );
}
