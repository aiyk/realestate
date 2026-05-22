"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Status = "NEW" | "CONTACTED" | "QUALIFIED" | "BOOKED" | "LOST";

const OPTIONS: Status[] = ["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "LOST"];

const TONE: Record<Status, string> = {
  NEW: "bg-info-soft text-info-soft-foreground",
  CONTACTED: "bg-primary-soft text-primary-soft-foreground",
  QUALIFIED: "bg-accent-soft text-accent-soft-foreground",
  BOOKED: "bg-success-soft text-success-soft-foreground",
  LOST: "bg-muted text-muted-foreground",
};

type Props = { leadId: string; current: Status };

export function LeadStatusChanger({ leadId, current }: Props) {
  const router = useRouter();
  const toast = useToast();
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
      toast.success(`Marked ${next.toLowerCase()}`);
      router.refresh();
    } catch {
      setValue(current);
      toast.error("Couldn't update status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Status
      </span>
      <DropdownMenu align="end">
        <DropdownMenuTrigger
          disabled={busy}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            TONE[value],
          )}
        >
          {value}
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {OPTIONS.map((s) => (
            <DropdownMenuItem
              key={s}
              onSelect={() => void change(s)}
              icon={
                s === value ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="inline-block h-3.5 w-3.5" />
                )
              }
            >
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
