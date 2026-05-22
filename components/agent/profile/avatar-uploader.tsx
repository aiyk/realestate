"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "avatar" | "cover";

type Props = {
  variant: Variant;
  initialUrl?: string | null;
  initials?: string;
  onUploaded: (url: string) => void | Promise<void>;
};

const PURPOSE: Record<Variant, "agent-avatar" | "agent-cover"> = {
  avatar: "agent-avatar",
  cover: "agent-cover",
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export function AvatarUploader({
  variant,
  initialUrl,
  initials,
  onUploaded,
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: PURPOSE[variant],
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!signRes.ok) {
        const d = (await signRes.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not start upload");
      }
      const { uploadUrl, publicUrl } = (await signRes.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");
      setUrl(publicUrl);
      await onUploaded(publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearImage() {
    setBusy(true);
    setErr(null);
    try {
      await onUploaded("");
      setUrl(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not clear");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "cover") {
    return (
      <div className="space-y-2">
        <div
          className={cn(
            "group relative h-40 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary-hover",
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-primary-foreground/80">
              Cover photo (1600×400 recommended)
            </div>
          )}
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-black/0 p-3 transition group-hover:bg-black/20">
            {url && (
              <button
                type="button"
                onClick={clearImage}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
              {url ? "Replace" : "Upload"}
            </button>
          </div>
        </div>
        {err && <p className="text-xs text-danger">{err}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-hover text-2xl font-semibold text-white ring-2 ring-white">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials ?? "AG"}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow ring-1 ring-border hover:bg-surface-2"
          aria-label="Upload avatar"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Profile photo</p>
        <p className="text-muted-foreground">JPG, PNG or WebP — up to 10 MB.</p>
        {url && (
          <button
            type="button"
            onClick={clearImage}
            disabled={busy}
            className="mt-1 text-danger hover:underline"
          >
            Remove
          </button>
        )}
        {err && <p className="mt-1 text-danger">{err}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
