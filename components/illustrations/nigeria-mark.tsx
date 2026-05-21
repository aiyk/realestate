import { cn } from "@/lib/utils";

/**
 * Compact brand mark — a stylised house with the curve of the naira symbol
 * folded into the roof. Used in the site header and OG image.
 */
export function NigeriaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id="nm-bg" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#nm-bg)" />
      {/* Roof */}
      <path
        d="M9 21 L20 11 L31 21 L31 30 L9 30 Z"
        fill="#ecfdf5"
        opacity="0.95"
      />
      {/* Door */}
      <rect x="18" y="22" width="4" height="8" rx="0.5" fill="#064e3b" />
      {/* Naira slash */}
      <path
        d="M13 16 L27 26"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 19 L27 29"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
