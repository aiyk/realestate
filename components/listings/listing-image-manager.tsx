"use client";
import { useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export type ListingImageDraft = {
  storageKey: string;
  url: string;
  altText?: string;
  caption?: string;
  isCover?: boolean;
};

type Props = {
  listingId?: string;
  initial?: ListingImageDraft[];
  onChange: (images: ListingImageDraft[]) => void;
  max?: number;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const CONCURRENCY = 4;

async function uploadFile(file: File, listingId?: string): Promise<ListingImageDraft | null> {
  try {
    const signRes = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: listingId ? "listing" : "agent-cover",
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        listingId,
      }),
    });
    if (!signRes.ok) return null;
    const { uploadUrl, publicUrl, storageKey } = (await signRes.json()) as {
      uploadUrl: string;
      publicUrl: string;
      storageKey: string;
    };
    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) return null;
    return { storageKey, url: publicUrl, isCover: false };
  } catch {
    return null;
  }
}

export function ListingImageManager({
  listingId,
  initial = [],
  onChange,
  max = 20,
}: Props) {
  const [images, setImages] = useState<ListingImageDraft[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pushUpdate(next: ListingImageDraft[]) {
    setImages(next);
    onChange(next);
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    const room = max - images.length;
    const accepted = list.slice(0, Math.max(0, room));
    if (accepted.length < list.length) {
      setErr(`Cap is ${max} images. Extras were skipped.`);
    } else {
      setErr(null);
    }
    setUploading(accepted.length);
    const results: (ListingImageDraft | null)[] = new Array(accepted.length).fill(
      null,
    );
    let cursor = 0;
    async function worker() {
      while (cursor < accepted.length) {
        const my = cursor++;
        const r = await uploadFile(accepted[my], listingId);
        results[my] = r;
        setUploading((n) => n - 1);
      }
    }
    await Promise.all(
      new Array(Math.min(CONCURRENCY, accepted.length)).fill(0).map(() => worker()),
    );
    const fresh = results.filter((r): r is ListingImageDraft => Boolean(r));
    const merged = [...images, ...fresh];
    if (merged.length > 0 && !merged.some((m) => m.isCover)) {
      merged[0].isCover = true;
    }
    pushUpdate(merged);
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...images];
    const t = i + dir;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t], next[i]];
    pushUpdate(next);
  }
  function remove(i: number) {
    const next = images.filter((_, idx) => idx !== i);
    if (next.length > 0 && !next.some((m) => m.isCover)) next[0].isCover = true;
    pushUpdate(next);
  }
  function setCover(i: number) {
    pushUpdate(images.map((m, idx) => ({ ...m, isCover: idx === i })));
  }
  function updateField(i: number, patch: Partial<ListingImageDraft>) {
    pushUpdate(images.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...images];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setDragIdx(null);
    pushUpdate(next);
  }
  function onDropOnZone(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropOnZone}
        className="rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-8 text-center"
      >
        <Upload className="mx-auto h-8 w-8 text-stone-400" />
        <p className="mt-2 text-sm font-medium text-stone-700">
          Drop images here or click to browse
        </p>
        <p className="mt-1 text-xs text-stone-500">
          JPG, PNG, WebP — up to 10 MB each, max {max} total
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0 || images.length >= max}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {uploading > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading {uploading}…
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Choose images
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="text-xs text-amber-700">{err}</p>}

      {images.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li
              key={img.storageKey}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragEnd={() => setDragIdx(null)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, i)}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.altText ?? ""}
                  className="aspect-[4/3] w-full object-cover"
                />
                {img.isCover && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="h-3 w-3 fill-current" /> COVER
                  </span>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(i, -1)}
                    className="rounded-full bg-white/90 p-1 text-stone-700 hover:bg-white"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(i, 1)}
                    className="rounded-full bg-white/90 p-1 text-stone-700 hover:bg-white"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => remove(i)}
                    className="rounded-full bg-white/90 p-1 text-red-600 hover:bg-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 p-3 text-xs">
                <Input
                  value={img.altText ?? ""}
                  onChange={(e) => updateField(i, { altText: e.target.value })}
                  placeholder="Alt text (for accessibility)"
                  maxLength={200}
                  className="h-9 text-xs"
                />
                <Input
                  value={img.caption ?? ""}
                  onChange={(e) => updateField(i, { caption: e.target.value })}
                  placeholder="Caption (shown under the photo)"
                  maxLength={200}
                  className="h-9 text-xs"
                />
                <div className="flex justify-between text-[11px]">
                  {!img.isCover ? (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Set as cover
                    </button>
                  ) : (
                    <span className="text-stone-500">Currently cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    <X className="inline h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
