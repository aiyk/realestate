import { Home } from "lucide-react";

type Props = {
  specialties: string[];
};

export function AgentSpecialties({ specialties }: Props) {
  if (specialties.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Specialises in
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {specialties.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary-soft-foreground"
          >
            <Home className="h-3 w-3" />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
