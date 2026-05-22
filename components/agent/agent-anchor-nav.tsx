"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string };

type Props = { items: Item[] };

export function AgentAnchorNav({ items }: Props) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-0 z-20 -mx-6 border-y border-border bg-card/95 px-6 py-2 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[100rem] flex-wrap gap-1 text-sm">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition",
                  on
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-2",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
