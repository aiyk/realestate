import { Award, Sparkles, ShieldCheck } from "lucide-react";

type Props = {
  tier: "TOP_PERFORMER" | "RISING_STAR" | null | undefined;
};

export function AgentTierBadge({ tier }: Props) {
  if (tier === "TOP_PERFORMER") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-soft-foreground ring-1 ring-accent/30/60">
        <Award className="h-3 w-3" /> Top performer
      </span>
    );
  }
  if (tier === "RISING_STAR") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-soft-foreground ring-1 ring-primary/30/60">
        <Sparkles className="h-3 w-3" /> Rising star
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground ring-1 ring-border">
      <ShieldCheck className="h-3 w-3" /> Verified
    </span>
  );
}
