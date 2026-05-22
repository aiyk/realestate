"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

function Inner({ initial }: { initial: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => {
      const current = sp.get("q") ?? "";
      if (current === value.trim()) return;
      const next = new URLSearchParams(sp.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      router.replace(`/agents?${next.toString()}`);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, business, or area…"
        className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-10 text-sm shadow-sm placeholder:text-text-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-subtle hover:bg-surface-2 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function AgentSearchBar() {
  // Re-mount via `key` whenever the URL's q param changes externally so the
  // controlled input mirrors the URL without setState-in-effect.
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  return <Inner key={q} initial={q} />;
}
