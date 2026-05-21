import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ChipOption = { value: string; label: string; count?: number };

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
  cities: ChipOption[];
  states: ChipOption[];
  propertyTypes: ChipOption[];
};

function getList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function toggleParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
  value: string,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (Array.isArray(v)) for (const x of v) next.append(k, x);
    else if (v) next.set(k, v);
  }
  const present = getList(sp[key]).includes(value);
  next.delete(key);
  const current = getList(sp[key]);
  const after = present
    ? current.filter((x) => x !== value)
    : [...current, value];
  for (const x of after) next.append(key, x);
  return next.toString();
}

function setParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
  value: string | null,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || k === key) continue;
    if (Array.isArray(v)) for (const x of v) next.append(k, x);
    else if (v) next.set(k, v);
  }
  if (value) next.set(key, value);
  return next.toString();
}

function Section({
  label,
  options,
  paramKey,
  selected,
  sp,
}: {
  label: string;
  options: ChipOption[];
  paramKey: string;
  selected: string[];
  sp: Record<string, string | string[] | undefined>;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <Link
              key={o.value}
              href={`/agents?${toggleParam(sp, paramKey, o.value)}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                on
                  ? "bg-emerald-700 text-white ring-emerald-700"
                  : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
              )}
            >
              {o.label}
              {o.count !== undefined && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px]",
                    on ? "bg-emerald-600 text-emerald-50" : "bg-stone-100 text-stone-500",
                  )}
                >
                  {o.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AgentFilterRail({
  searchParams,
  cities,
  states,
  propertyTypes,
}: Props) {
  const selCities = getList(searchParams.city);
  const selStates = getList(searchParams.state);
  const selTypes = getList(searchParams.type);
  const tier = typeof searchParams.tier === "string" ? searchParams.tier : null;

  return (
    <aside className="space-y-6">
      <Section
        label="State"
        paramKey="state"
        options={states}
        selected={selStates}
        sp={searchParams}
      />
      <Section
        label="City"
        paramKey="city"
        options={cities}
        selected={selCities}
        sp={searchParams}
      />
      <Section
        label="Property type"
        paramKey="type"
        options={propertyTypes}
        selected={selTypes}
        sp={searchParams}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Badge
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { value: "top", label: "Top performers" },
            { value: "rising", label: "Rising stars" },
          ].map((o) => {
            const on = tier === o.value;
            return (
              <Link
                key={o.value}
                href={`/agents?${setParam(searchParams, "tier", on ? null : o.value)}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                  on
                    ? "bg-amber-500 text-white ring-amber-500"
                    : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
                )}
              >
                {o.label}
                <ChevronRight className="h-3 w-3" />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
