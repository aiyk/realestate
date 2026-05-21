"use client";
import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type Props = {
  slug: string;
  businessName: string;
};

export function AgentShareRow({ slug, businessName }: Props) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/agents/${slug}` : `/agents/${slug}`;
  const text = `Check out ${businessName} on Realestate`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: businessName, text, url });
      } catch {
        // user cancelled
      }
    } else {
      void copy();
    }
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const xHref = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy profile link"
        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-700" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy link
          </>
        )}
      </button>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
      >
        WhatsApp
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
      >
        Share on X
      </a>
      <button
        type="button"
        onClick={nativeShare}
        aria-label="Share"
        className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 sm:hidden"
      >
        <Share2 className="h-3 w-3" />
      </button>
    </div>
  );
}
