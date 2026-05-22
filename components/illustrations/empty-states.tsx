import { cn } from "@/lib/utils";

/**
 * Small contextual illustrations used in empty states across the app.
 * All themed via currentColor; the calling card supplies the colour.
 */

type Props = { className?: string };

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
      className={cn("h-32 w-auto text-primary", className)}
    >
      {children}
    </svg>
  );
}

export function NoListings({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      <path
        d="M62 90 L100 60 L138 90 L138 122 L62 122 Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="90" y="100" width="20" height="22" fill="#fef3c7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="70" y="98" width="12" height="10" fill="currentColor" opacity="0.18" />
      <rect x="118" y="98" width="12" height="10" fill="currentColor" opacity="0.18" />
      {/* Magnifier */}
      <g transform="translate(126 26)">
        <circle cx="14" cy="14" r="12" fill="#fff" stroke="currentColor" strokeWidth="2" />
        <line
          x1="22"
          y1="22"
          x2="32"
          y2="32"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text
          x="14"
          y="18"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.6"
        >
          ?
        </text>
      </g>
    </Frame>
  );
}

export function NoReservations({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      {/* Receipt */}
      <path
        d="M70 36 L130 36 L130 124 L122 118 L114 124 L106 118 L98 124 L90 118 L82 124 L70 118 Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="78" y="50" width="44" height="3" fill="currentColor" opacity="0.4" />
      <rect x="78" y="60" width="34" height="3" fill="currentColor" opacity="0.25" />
      <rect x="78" y="70" width="44" height="3" fill="currentColor" opacity="0.25" />
      <rect x="78" y="84" width="44" height="14" fill="#fef3c7" />
      <text
        x="100"
        y="94"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        fill="#92400e"
      >
        ₦ DEPOSIT
      </text>
    </Frame>
  );
}

export function NoMessages({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      <path
        d="M52 60 Q52 48 64 48 L128 48 Q140 48 140 60 L140 96 Q140 108 128 108 L84 108 L70 122 L70 108 Q52 108 52 96 Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="76" cy="80" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="96" cy="80" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="116" cy="80" r="3" fill="currentColor" opacity="0.5" />
    </Frame>
  );
}

export function NoEarnings({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      {/* Bar chart */}
      <line x1="50" y1="118" x2="150" y2="118" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="118" x2="50" y2="40" stroke="currentColor" strokeWidth="2" />
      <rect x="60" y="96" width="14" height="22" fill="currentColor" opacity="0.35" />
      <rect x="80" y="80" width="14" height="38" fill="currentColor" opacity="0.5" />
      <rect x="100" y="64" width="14" height="54" fill="currentColor" opacity="0.7" />
      <rect x="120" y="50" width="14" height="68" fill="#fbbf24" />
      <text
        x="127"
        y="46"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        fill="currentColor"
      >
        ₦
      </text>
    </Frame>
  );
}

export function KycPending({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      <path
        d="M100 40 L138 56 L138 96 Q138 122 100 132 Q62 122 62 96 L62 56 Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="84" r="20" fill="#fef3c7" />
      <text
        x="100"
        y="90"
        fontSize="18"
        fontWeight="900"
        textAnchor="middle"
        fill="#92400e"
      >
        ID
      </text>
    </Frame>
  );
}

export function Sold({ className }: Props) {
  return (
    <Frame className={className}>
      <circle cx="100" cy="80" r="58" fill="currentColor" opacity="0.07" />
      <path
        d="M68 92 L100 60 L132 92 L132 124 L68 124 Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="90" y="100" width="20" height="24" fill="currentColor" opacity="0.15" />
      {/* Sold sticker */}
      <g transform="translate(98 30) rotate(-10 26 18)">
        <rect width="60" height="28" rx="4" fill="#dc2626" />
        <text
          x="30"
          y="20"
          fontSize="16"
          fontWeight="900"
          textAnchor="middle"
          fill="#fff"
        >
          SOLD
        </text>
      </g>
    </Frame>
  );
}
