import { cn } from "@/lib/utils";

/**
 * 4-step illustrated infographic — Browse, Verify, Reserve, Close.
 * Replaces the four flat cards in "How it works".
 */
export function FlowDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 880 220"
      fill="none"
      role="img"
      aria-label="Buyer flow: browse, verify, reserve, close"
      className={cn("h-auto w-full text-primary", className)}
    >
      <defs>
        <linearGradient id="fd-arrow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Connectors */}
      {[210, 420, 630].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1="84"
            x2={x + 50}
            y2="84"
            stroke="url(#fd-arrow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 6"
          />
          <path
            d={`M${x + 50} 84 l-7 -4 v8 z`}
            fill="currentColor"
            opacity="0.45"
          />
        </g>
      ))}

      {/* Step 1 — Browse (open laptop with houses) */}
      <g transform="translate(20 12)">
        <circle cx="80" cy="72" r="56" fill="currentColor" opacity="0.08" />
        <rect
          x="40"
          y="48"
          width="80"
          height="52"
          rx="4"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="46" y="54" width="20" height="14" fill="currentColor" opacity="0.2" />
        <rect x="68" y="54" width="20" height="14" fill="currentColor" opacity="0.35" />
        <rect x="90" y="54" width="24" height="14" fill="#fbbf24" opacity="0.6" />
        <rect x="46" y="70" width="68" height="3" fill="currentColor" opacity="0.18" />
        <rect x="46" y="76" width="50" height="3" fill="currentColor" opacity="0.18" />
        <rect x="46" y="82" width="40" height="3" fill="currentColor" opacity="0.18" />
        <rect x="32" y="100" width="96" height="6" rx="2" fill="currentColor" opacity="0.3" />
        <text
          x="80"
          y="156"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
        >
          01 · Browse
        </text>
        <text
          x="80"
          y="174"
          fontSize="10.5"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.7"
        >
          No sign-up to look around
        </text>
      </g>

      {/* Step 2 — Verify (BVN shield) */}
      <g transform="translate(230 12)">
        <circle cx="80" cy="72" r="56" fill="currentColor" opacity="0.08" />
        <path
          d="M80 36 L116 50 L116 80 Q116 104 80 116 Q44 104 44 80 L44 50 Z"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M64 76 L76 88 L98 64"
          stroke="#059669"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="58" y="92" width="44" height="14" rx="2" fill="#fef3c7" />
        <text
          x="80"
          y="103"
          fontSize="8"
          fontWeight="700"
          textAnchor="middle"
          fill="#92400e"
        >
          BVN OK
        </text>
        <text
          x="80"
          y="156"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
        >
          02 · Verify
        </text>
        <text
          x="80"
          y="174"
          fontSize="10.5"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.7"
        >
          One-time, hashed, gone
        </text>
      </g>

      {/* Step 3 — Reserve (naira note + lock) */}
      <g transform="translate(440 12)">
        <circle cx="80" cy="72" r="56" fill="currentColor" opacity="0.08" />
        <rect
          x="40"
          y="56"
          width="80"
          height="40"
          rx="4"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="80" cy="76" r="13" fill="#fbbf24" opacity="0.55" />
        <text
          x="80"
          y="81"
          fontSize="16"
          fontWeight="800"
          textAnchor="middle"
          fill="#92400e"
        >
          ₦
        </text>
        <rect x="48" y="62" width="12" height="8" fill="currentColor" opacity="0.18" />
        <rect x="100" y="84" width="12" height="8" fill="currentColor" opacity="0.18" />
        <rect
          x="72"
          y="100"
          width="16"
          height="14"
          rx="2"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M75 100 V96 a5 5 0 0 1 10 0 V100"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <text
          x="80"
          y="156"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
        >
          03 · Reserve
        </text>
        <text
          x="80"
          y="174"
          fontSize="10.5"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.7"
        >
          Deposit, listing held
        </text>
      </g>

      {/* Step 4 — Close (handover keys) */}
      <g transform="translate(650 12)">
        <circle cx="80" cy="72" r="56" fill="currentColor" opacity="0.08" />
        <path
          d="M50 96 L70 96 L70 60 L84 60 L84 96 L110 96"
          stroke="currentColor"
          strokeWidth="2"
          fill="#fff"
          strokeLinejoin="round"
        />
        <polygon
          points="55,60 77,42 99,60"
          fill="#fbbf24"
          fillOpacity="0.6"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="105" cy="86" r="6" fill="#fff" stroke="currentColor" strokeWidth="2" />
        <line x1="105" y1="92" x2="105" y2="102" stroke="currentColor" strokeWidth="2" />
        <line
          x1="103"
          y1="100"
          x2="107"
          y2="100"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="80"
          y="156"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
        >
          04 · Close
        </text>
        <text
          x="80"
          y="174"
          fontSize="10.5"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.7"
        >
          Paperwork, keys, done
        </text>
      </g>
    </svg>
  );
}
