import { Home } from "lucide-react";

type Props = {
  specialties: string[];
};

export function AgentSpecialties({ specialties }: Props) {
  if (specialties.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        Specialises in
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {specialties.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
          >
            <Home className="h-3 w-3" />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
