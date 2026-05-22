import { cn } from "@/lib/utils";

type City = {
  key: string;
  label: string;
  cx: number;
  cy: number;
};

const CITIES: City[] = [
  { key: "lagos", label: "Lagos", cx: 138, cy: 248 },
  { key: "ibadan", label: "Ibadan", cx: 160, cy: 226 },
  { key: "abuja", label: "Abuja", cx: 232, cy: 174 },
  { key: "ph", label: "Port Harcourt", cx: 222, cy: 274 },
  { key: "kano", label: "Kano", cx: 244, cy: 96 },
  { key: "enugu", label: "Enugu", cx: 246, cy: 232 },
];

/**
 * Stylised outline of Nigeria with dots for cities we serve.
 *
 * The path is a simplified silhouette — not geographic-grade — designed to
 * read at small sizes and theme with currentColor.
 */
export function NigeriaMap({
  className,
  active = ["lagos", "abuja", "ph", "ibadan"],
  pulse = true,
  showLabels = false,
}: {
  className?: string;
  active?: string[];
  pulse?: boolean;
  showLabels?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      role="img"
      aria-label="Map of Nigeria highlighting served cities"
      className={cn("h-auto w-full text-primary", className)}
    >
      <defs>
        <linearGradient id="ngmap-fill" x1="0" y1="0" x2="400" y2="360">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
        </linearGradient>
        <filter id="ngmap-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Simplified Nigeria outline */}
      <path
        d="M82 96 L106 70 L142 56 L184 48 L220 44 L256 50 L286 64 L312 82
           L330 104 L348 130 L356 156 L350 184 L342 206 L334 224 L322 240
           L308 252 L304 270 L296 286 L278 296 L256 302 L234 304 L210 300
           L188 296 L168 290 L150 282 L132 270 L116 256 L102 240 L92 222
           L86 200 L82 178 L82 156 L80 134 L78 116 Z"
        fill="url(#ngmap-fill)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Inner gridlines for a subtle "map" feel */}
      <g opacity="0.18" stroke="currentColor" strokeWidth="0.7">
        <line x1="100" y1="120" x2="340" y2="120" />
        <line x1="92" y1="180" x2="354" y2="180" />
        <line x1="100" y1="240" x2="330" y2="240" />
        <line x1="160" y1="60" x2="160" y2="300" />
        <line x1="230" y1="50" x2="230" y2="304" />
        <line x1="290" y1="70" x2="290" y2="290" />
      </g>

      {/* City dots */}
      {CITIES.map((c) => {
        const isActive = active.includes(c.key);
        return (
          <g key={c.key}>
            {isActive && pulse && (
              <circle
                cx={c.cx}
                cy={c.cy}
                r="6"
                fill="currentColor"
                opacity="0.25"
                className="animate-pulse-ring"
              />
            )}
            <circle
              cx={c.cx}
              cy={c.cy}
              r={isActive ? 5 : 3}
              fill={isActive ? "currentColor" : "#a8a29e"}
              className={isActive ? "animate-draw" : ""}
            />
            {isActive && (
              <circle
                cx={c.cx}
                cy={c.cy}
                r="2"
                fill="#fbbf24"
                opacity="0.9"
              />
            )}
            {showLabels && (
              <text
                x={c.cx + 10}
                y={c.cy + 4}
                fontSize="11"
                fontWeight="600"
                fill="currentColor"
                opacity={isActive ? 0.9 : 0.4}
              >
                {c.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
