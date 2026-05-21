import { cn } from "@/lib/utils";

/**
 * City skyline silhouettes — used as decorative overlays on city cards,
 * empty states, and content-page hero blocks. Themed via currentColor.
 */

type Props = { className?: string };

export function LagosSkyline({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full text-emerald-700/30", className)}
    >
      {/* Sun */}
      <circle cx="320" cy="38" r="14" fill="#fbbf24" opacity="0.85" />
      {/* Water */}
      <rect y="100" width="400" height="20" fill="currentColor" opacity="0.18" />
      <path
        d="M0 102 Q40 99 80 102 T160 102 T240 102 T320 102 T400 102 V120 H0 Z"
        fill="currentColor"
        opacity="0.15"
      />
      {/* Buildings */}
      <g fill="currentColor">
        <rect x="10" y="80" width="22" height="20" />
        <rect x="34" y="60" width="14" height="40" />
        <rect x="50" y="70" width="24" height="30" />
        <polygon points="78,70 90,55 102,70 102,100 78,100" />
        <rect x="104" y="48" width="18" height="52" />
        <rect x="124" y="62" width="12" height="38" />
        <rect x="138" y="40" width="20" height="60" />
        <rect x="160" y="56" width="16" height="44" />
        <rect x="178" y="30" width="14" height="70" />
        <polygon points="194,40 208,22 222,40 222,100 194,100" />
        <rect x="224" y="48" width="22" height="52" />
        <rect x="248" y="64" width="14" height="36" />
        <rect x="264" y="44" width="18" height="56" />
        <rect x="284" y="60" width="14" height="40" />
        <rect x="300" y="34" width="20" height="66" />
        <rect x="322" y="52" width="16" height="48" />
        <rect x="340" y="68" width="22" height="32" />
        <rect x="364" y="50" width="14" height="50" />
        <rect x="380" y="76" width="14" height="24" />
      </g>
      {/* Window lights */}
      <g fill="#fbbf24" opacity="0.75">
        <rect x="40" y="68" width="2" height="3" />
        <rect x="44" y="72" width="2" height="3" />
        <rect x="110" y="58" width="2" height="3" />
        <rect x="114" y="64" width="2" height="3" />
        <rect x="142" y="50" width="2" height="3" />
        <rect x="146" y="58" width="2" height="3" />
        <rect x="184" y="42" width="2" height="3" />
        <rect x="186" y="50" width="2" height="3" />
        <rect x="230" y="58" width="2" height="3" />
        <rect x="270" y="56" width="2" height="3" />
        <rect x="306" y="44" width="2" height="3" />
      </g>
    </svg>
  );
}

export function AbujaSkyline({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full text-emerald-700/30", className)}
    >
      {/* Aso Rock-ish silhouette */}
      <path
        d="M0 100 L0 84 Q40 56 80 70 Q120 50 160 60 Q200 30 240 50 Q280 26 320 48 Q360 36 400 70 L400 100 Z"
        fill="currentColor"
        opacity="0.25"
      />
      <g fill="currentColor">
        <rect x="30" y="76" width="18" height="24" />
        <polygon points="50,76 60,64 70,76 70,100 50,100" />
        <rect x="74" y="70" width="14" height="30" />
        <rect x="92" y="60" width="22" height="40" />
        <rect x="116" y="50" width="18" height="50" />
        <polygon points="134,50 148,32 162,50 162,100 134,100" />
        <rect x="164" y="40" width="20" height="60" />
        <rect x="188" y="62" width="14" height="38" />
        <rect x="204" y="46" width="20" height="54" />
        <rect x="226" y="60" width="14" height="40" />
        <polygon points="240,52 256,30 272,52 272,100 240,100" />
        <rect x="276" y="48" width="22" height="52" />
        <rect x="300" y="64" width="14" height="36" />
        <rect x="316" y="42" width="22" height="58" />
        <rect x="340" y="58" width="16" height="42" />
        <rect x="360" y="46" width="18" height="54" />
        <rect x="380" y="68" width="14" height="32" />
      </g>
    </svg>
  );
}

export function PortHarcourtSkyline({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full text-emerald-700/30", className)}
    >
      {/* Refinery / oil silhouette */}
      <g fill="currentColor">
        <rect x="10" y="76" width="14" height="24" />
        <rect x="26" y="60" width="22" height="40" />
        <rect x="50" y="50" width="18" height="50" />
        <path d="M70 50 L74 30 L78 50 Z" />
        <rect x="80" y="62" width="20" height="38" />
        <rect x="102" y="56" width="16" height="44" />
        <rect x="120" y="40" width="22" height="60" />
        <path d="M144 40 L148 22 L152 40 Z" />
        <rect x="156" y="54" width="14" height="46" />
        <rect x="172" y="64" width="18" height="36" />
        <rect x="192" y="46" width="22" height="54" />
        <rect x="216" y="68" width="14" height="32" />
        <rect x="232" y="52" width="20" height="48" />
        <rect x="254" y="44" width="16" height="56" />
        <path d="M272 44 L276 28 L280 44 Z" />
        <rect x="282" y="58" width="22" height="42" />
        <rect x="306" y="50" width="18" height="50" />
        <rect x="326" y="64" width="14" height="36" />
        <rect x="342" y="56" width="22" height="44" />
        <rect x="366" y="70" width="14" height="30" />
        <rect x="382" y="50" width="14" height="50" />
      </g>
      {/* Water */}
      <rect y="100" width="400" height="20" fill="currentColor" opacity="0.18" />
      {/* Steam puffs */}
      <g fill="currentColor" opacity="0.2">
        <circle cx="76" cy="22" r="4" />
        <circle cx="82" cy="18" r="3" />
        <circle cx="150" cy="14" r="4" />
        <circle cx="276" cy="20" r="4" />
        <circle cx="282" cy="14" r="3" />
      </g>
    </svg>
  );
}

export function IbadanSkyline({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full text-emerald-700/30", className)}
    >
      {/* Rolling hills + low-rise */}
      <path
        d="M0 100 L0 76 Q60 60 120 70 Q180 56 240 68 Q300 54 360 72 L400 78 L400 100 Z"
        fill="currentColor"
        opacity="0.25"
      />
      <g fill="currentColor">
        {Array.from({ length: 28 }).map((_, i) => {
          const x = 10 + i * 14;
          const h = 18 + ((i * 13) % 28);
          return (
            <g key={i}>
              <rect x={x} y={100 - h} width={11} height={h} />
              <polygon
                points={`${x},${100 - h} ${x + 5.5},${100 - h - 6} ${x + 11},${100 - h}`}
              />
            </g>
          );
        })}
      </g>
      {/* Sun */}
      <circle cx="60" cy="36" r="11" fill="#fbbf24" opacity="0.75" />
    </svg>
  );
}
