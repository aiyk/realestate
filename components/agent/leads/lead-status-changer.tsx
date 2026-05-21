"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Status = "NEW" | "CONTACTED" | "QUALIFIED" | "BOOKED" | "LOST";

const OPTIONS: Status[] = ["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "LOST"];

type Props = { leadId: string; current: Status };

export function LeadStatusChanger({ leadId, current }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<Status>(current);
  const [busy, setBusy] = useState(false);

  async function change(next: Status) {
    if (next === value) return;
    setBusy(true);
    setValue(next);
    try {
      const res = await fetch(`/api/agent/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setValue(current);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Status
      </label>
      <select
        value={value}
        disabled={busy}
        onChange={(e) => void change(e.target.value as Status)}
        className="h-9 rounded-full border border-stone-200 bg-white px-3 text-sm focus-visible:border-emerald-500 focus-visible:outline-none"
      >
        {OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {busy && <Loader2 className="h-3 w-3 animate-spin text-stone-500" />}
    </div>
  );
}
