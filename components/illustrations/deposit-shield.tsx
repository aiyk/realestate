import { cn } from "@/lib/utils";

/**
 * Escrow metaphor — a shield cradling a naira note.
 * Used in the hero, checkout, and KYC pages.
 */
export function DepositShield({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      role="img"
      aria-label="Deposit held in escrow"
      className={cn("h-auto w-full text-emerald-700", className)}
    >
      <defs>
        <linearGradient id="ds-shield" x1="0" y1="0" x2="240" y2="240">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id="ds-note" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id="ds-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#ds-glow)" />

      {/* Shield body */}
      <path
        d="M120 30 L196 56 L196 120 Q196 178 120 210 Q44 178 44 120 L44 56 Z"
        fill="url(#ds-shield)"
      />
      {/* Inner panel */}
      <path
        d="M120 50 L180 70 L180 120 Q180 168 120 192 Q60 168 60 120 L60 70 Z"
        fill="#ecfdf5"
        opacity="0.18"
      />

      {/* Naira note */}
      <g transform="translate(60 96) rotate(-6 60 28)">
        <rect width="120" height="56" rx="6" fill="url(#ds-note)" />
        <rect
          x="6"
          y="6"
          width="108"
          height="44"
          rx="3"
          fill="none"
          stroke="#92400e"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
        <circle cx="60" cy="28" r="14" fill="#fff" opacity="0.65" />
        <text
          x="60"
          y="34"
          fontSize="20"
          fontWeight="900"
          textAnchor="middle"
          fill="#92400e"
        >
          ₦
        </text>
        <text x="14" y="16" fontSize="6" fontWeight="700" fill="#92400e" opacity="0.8">
          ESCROW
        </text>
        <text x="92" y="50" fontSize="6" fontWeight="700" fill="#92400e" opacity="0.8">
          HELD
        </text>
      </g>

      {/* Check mark */}
      <g transform="translate(150 36)">
        <circle cx="22" cy="22" r="22" fill="#fbbf24" />
        <path
          d="M12 22 L20 30 L34 14"
          stroke="#0c0a09"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Sparkles */}
      <g fill="#fbbf24" opacity="0.85">
        <circle cx="46" cy="80" r="2" />
        <circle cx="200" cy="160" r="2.5" />
        <circle cx="60" cy="190" r="1.5" />
        <circle cx="186" cy="92" r="1.5" />
      </g>
    </svg>
  );
}
