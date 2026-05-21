import Link from "next/link";
import { X } from "lucide-react";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

function getList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function removeParamValue(
  sp: Record<string, string | string[] | undefined>,
  key: string,
  value?: string,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (k === key) {
      if (value === undefined) continue;
      const after = getList(v).filter((x) => x !== value);
      for (const x of after) next.append(k, x);
      continue;
    }
    if (Array.isArray(v)) for (const x of v) next.append(k, x);
    else if (v) next.set(k, v);
  }
  return next.toString();
}

export function AgentActiveFilters({ searchParams }: Props) {
  const items: { label: string; href: string }[] = [];
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  if (q) items.push({ label: `“${q}”`, href: `/agents?${removeParamValue(searchParams, "q")}` });
  for (const c of getList(searchParams.city)) {
    items.push({ label: c, href: `/agents?${removeParamValue(searchParams, "city", c)}` });
  }
  for (const s of getList(searchParams.state)) {
    items.push({ label: s, href: `/agents?${removeParamValue(searchParams, "state", s)}` });
  }
  for (const t of getList(searchParams.type)) {
    items.push({
      label: t,
      href: `/agents?${removeParamValue(searchParams, "type", t)}`,
    });
  }
  if (typeof searchParams.tier === "string") {
    items.push({
      label:
        searchParams.tier === "top"
          ? "Top performers"
          : searchParams.tier === "rising"
            ? "Rising stars"
            : "Verified",
      href: `/agents?${removeParamValue(searchParams, "tier")}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-stone-500">Filters:</span>
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-900 hover:bg-emerald-200"
        >
          {it.label}
          <X className="h-3 w-3" />
        </Link>
      ))}
      <Link
        href="/agents"
        className="font-semibold text-stone-700 underline-offset-2 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
