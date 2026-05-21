import { cn } from "@/lib/utils";

type Props = { className?: string };

/**
 * One icon per PropertyType in the Prisma schema.
 * Themed via currentColor, sized via parent.
 */

export function HouseIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <path
        d="M6 26 L24 10 L42 26 L42 40 L6 40 Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M6 26 L24 10 L42 26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 26 L10 40 L38 40 L38 26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="20"
        y="28"
        width="8"
        height="12"
        stroke="currentColor"
        strokeWidth="2"
        fill="#fbbf24"
        fillOpacity="0.4"
      />
      <rect
        x="13"
        y="29"
        width="5"
        height="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="30"
        y="29"
        width="5"
        height="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ApartmentIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <rect
        x="10"
        y="8"
        width="28"
        height="34"
        rx="1"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="10"
        y="8"
        width="28"
        height="34"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
      />
      {[12, 20, 28].map((row) =>
        [14, 21, 28].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col}
            y={row}
            width="5"
            height="4"
            fill={row === 28 ? "#fbbf24" : "currentColor"}
            fillOpacity={row === 28 ? 0.6 : 0.25}
            stroke="currentColor"
            strokeWidth="1"
          />
        )),
      )}
      <rect
        x="21"
        y="36"
        width="6"
        height="6"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export function DuplexIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <path
        d="M4 22 L18 12 L18 22 L32 12 L32 22 L44 22 L44 40 L4 40 Z"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="9"
        y="28"
        width="6"
        height="6"
        fill="#fbbf24"
        fillOpacity="0.55"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="22"
        y="28"
        width="6"
        height="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="35"
        y="28"
        width="6"
        height="12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LandIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <path
        d="M6 36 Q24 22 42 36 L42 42 L6 42 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M6 36 Q24 22 42 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Survey peg */}
      <line x1="14" y1="32" x2="14" y2="14" stroke="currentColor" strokeWidth="2" />
      <polygon points="14,14 22,17 14,20" fill="#fbbf24" />
      {/* Trees */}
      <circle cx="32" cy="30" r="4" fill="currentColor" opacity="0.4" />
      <line x1="32" y1="30" x2="32" y2="36" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="38" cy="32" r="3" fill="currentColor" opacity="0.4" />
      {/* Dashed boundary */}
      <line
        x1="4"
        y1="42"
        x2="44"
        y2="42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

export function BungalowIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <path
        d="M4 26 L24 14 L44 26 L44 40 L4 40 Z"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="10" y="30" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="21"
        y="30"
        width="6"
        height="10"
        fill="#fbbf24"
        fillOpacity="0.55"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="32" y="30" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function TerraceIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      {[0, 11, 22, 33].map((x, i) => (
        <g key={i}>
          <path
            d={`M${x} 22 L${x + 5} 14 L${x + 10} 22 L${x + 10} 40 L${x} 40 Z`}
            fill="currentColor"
            opacity="0.12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect
            x={x + 3.5}
            y={28}
            width="3"
            height={i === 1 ? 8 : 5}
            fill={i === 1 ? "#fbbf24" : "currentColor"}
            fillOpacity={i === 1 ? 0.55 : 0.3}
          />
        </g>
      ))}
    </svg>
  );
}

export type PropertyTypeKey =
  | "HOUSE"
  | "APARTMENT"
  | "DUPLEX"
  | "LAND"
  | "BUNGALOW"
  | "TERRACE";

export const PROPERTY_TYPE_META: {
  key: PropertyTypeKey;
  label: string;
  blurb: string;
  Icon: (props: Props) => React.ReactElement;
}[] = [
  { key: "HOUSE", label: "House", blurb: "Detached, your own walls.", Icon: HouseIcon },
  {
    key: "APARTMENT",
    label: "Apartment",
    blurb: "Lift, neighbours, lock-up-and-go.",
    Icon: ApartmentIcon,
  },
  { key: "DUPLEX", label: "Duplex", blurb: "Two floors, one family.", Icon: DuplexIcon },
  {
    key: "LAND",
    label: "Land",
    blurb: "Build your own from scratch.",
    Icon: LandIcon,
  },
  {
    key: "BUNGALOW",
    label: "Bungalow",
    blurb: "All on one level, no stairs.",
    Icon: BungalowIcon,
  },
  {
    key: "TERRACE",
    label: "Terrace",
    blurb: "Shared walls, private vibe.",
    Icon: TerraceIcon,
  },
];
