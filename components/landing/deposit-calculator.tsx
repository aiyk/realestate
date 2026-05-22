"use client";

import * as React from "react";
import { Wallet, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNgn } from "@/lib/utils";

const PRESETS = [
  { label: "₦30m", value: 30_000_000 },
  { label: "₦50m", value: 50_000_000 },
  { label: "₦80m", value: 80_000_000 },
  { label: "₦120m", value: 120_000_000 },
  { label: "₦200m", value: 200_000_000 },
];

/**
 * Marketing widget — shows a buyer what their deposit would look like.
 * Pure UI, no backend. Designed for the homepage.
 */
export function DepositCalculator({ className }: { className?: string }) {
  const [price, setPrice] = React.useState<number>(50_000_000);
  const deposit = Math.round(price * 0.05);
  const balance = price - deposit;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-soft/60 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-soft/60 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-foreground">
          <Sparkles className="h-3 w-3" /> Try it
        </div>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          How much would you put down?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          A typical deposit is <strong>5% of the listing price</strong>. Move
          the chip below — we&apos;ll do the maths.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPrice(p.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors",
                price === p.value
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-border hover:bg-surface-2",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            …or pick anything in between
          </label>
          <input
            type="range"
            min={5_000_000}
            max={500_000_000}
            step={1_000_000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-2 w-full [accent-color:var(--primary)]"
            aria-label="Listing price"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>₦5m</span>
            <span>₦500m</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Tile label="Listing price" value={formatNgn(price)} />
          <Tile
            label="Your deposit (5%)"
            value={formatNgn(deposit)}
            highlight
          />
          <Tile label="Balance at close" value={formatNgn(balance)} />
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
          <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Your deposit lives with Paystack until both you and the agent agree
          the deal is done. Refundable inside 48 hours if the agent goes
          silent.
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 ring-1",
        highlight
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-card text-foreground ring-border",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          highlight ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
