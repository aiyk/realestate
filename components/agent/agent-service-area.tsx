import { MapPin } from "lucide-react";

type Area = { city: string; state: string; isPrimary: boolean };

type Props = {
  areas: Area[];
};

export function AgentServiceArea({ areas }: Props) {
  if (areas.length === 0) return null;
  const byState = new Map<string, Area[]>();
  for (const a of areas) {
    const list = byState.get(a.state) ?? [];
    list.push(a);
    byState.set(a.state, list);
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        Service areas
      </p>
      <ul className="mt-3 space-y-3">
        {Array.from(byState.entries()).map(([state, cities]) => (
          <li key={state}>
            <p className="text-sm font-semibold text-stone-900">{state}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {cities.map((a) => (
                <span
                  key={`${a.state}-${a.city}`}
                  className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700"
                >
                  <MapPin className="h-3 w-3 text-emerald-700" />
                  {a.city}
                  {a.isPrimary && (
                    <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Primary
                    </span>
                  )}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
