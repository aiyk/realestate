"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Keyboard-navigable tabs with an animated underline indicator.
 *
 * Usage:
 *   <Tabs value={tab} onValueChange={setTab}>
 *     <TabsList>
 *       <TabsTrigger value="a">All</TabsTrigger>
 *       <TabsTrigger value="b" count={4}>Pending</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="a">…</TabsContent>
 *   </Tabs>
 *
 * For uncontrolled use, pass `defaultValue` instead of `value`.
 */

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  baseId: string;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs primitives must be rendered inside <Tabs>");
  return ctx;
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolled;
  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );
  const baseId = React.useId();
  const triggers = React.useRef(new Map<string, HTMLButtonElement>());
  const registerTrigger = React.useCallback(
    (v: string, el: HTMLButtonElement | null) => {
      if (el) triggers.current.set(v, el);
      else triggers.current.delete(v);
    },
    [],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, baseId, registerTrigger }}>
      <div className={cn("flex flex-col gap-4", className)} data-tabs-root>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  count,
  children,
  className,
  disabled,
}: {
  value: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { value: active, setValue, baseId, registerTrigger } = useTabsContext();
  const selected = active === value;
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    registerTrigger(value, ref.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const list = ref.current?.parentElement;
    if (!list) return;
    const triggers = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const i = triggers.indexOf(ref.current!);
    if (i === -1) return;
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % triggers.length;
    if (e.key === "ArrowLeft") next = (i - 1 + triggers.length) % triggers.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = triggers.length - 1;
    triggers[next].focus();
    triggers[next].click();
  }

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-surface-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        selected
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-surface-2 text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary transition-all",
          selected ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: "var(--duration-base)", transitionTimingFunction: "var(--ease-out-soft)" }}
      />
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active, baseId } = useTabsContext();
  const selected = active === value;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      className={cn(selected && "animate-fade-in", className)}
    >
      {selected ? children : null}
    </div>
  );
}
