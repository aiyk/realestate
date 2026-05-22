"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/(buyer)/account/favorites/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
  /** When false (anonymous), clicking redirects to /login with a return URL. */
  authenticated?: boolean;
  size?: "sm" | "md";
  /** Visual style when used as a floating overlay vs. inline. */
  variant?: "overlay" | "inline";
  className?: string;
};

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  authenticated = false,
  size = "md",
  variant = "overlay",
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, startTransition] = React.useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!authenticated) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/login?next=${next}`);
      return;
    }
    const prev = favorited;
    setFavorited(!prev);
    startTransition(async () => {
      try {
        const res = await toggleFavorite({ listingId });
        setFavorited(res.favorited);
        if (res.favorited) toast.success("Saved to favorites");
        else toast.info("Removed from favorites");
      } catch {
        setFavorited(prev);
        toast.error("Couldn't update favorite");
      }
    });
  }

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      disabled={pending}
      className={cn(
        "grid place-items-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClass,
        variant === "overlay"
          ? "bg-card/95 text-muted-foreground shadow-sm hover:text-danger backdrop-blur"
          : "border border-border bg-card text-muted-foreground hover:text-danger",
        favorited && "text-danger",
        pending && "opacity-70",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, "transition-transform", favorited && "fill-danger")}
      />
    </button>
  );
}
