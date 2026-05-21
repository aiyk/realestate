import { Award, Sparkles, ShieldCheck } from "lucide-react";

type Props = {
  tier: "TOP_PERFORMER" | "RISING_STAR" | null | undefined;
};

export function AgentTierBadge({ tier }: Props) {
  if (tier === "TOP_PERFORMER") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300/60">
        <Award className="h-3 w-3" /> Top performer
      </span>
    );
  }
  if (tier === "RISING_STAR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-300/60">
        <Sparkles className="h-3 w-3" /> Rising star
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-700 ring-1 ring-stone-200">
      <ShieldCheck className="h-3 w-3" /> Verified
    </span>
  );
}
