"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  leadId: string;
  canConvert: boolean;
};

export function LeadConvertButton({ leadId, canConvert }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function convert() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/agent/leads/${leadId}/convert`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not convert");
      }
      const { threadId } = (await res.json()) as { threadId: string };
      router.push(`/agent/messages/${threadId}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not convert");
    } finally {
      setBusy(false);
    }
  }

  if (!canConvert) {
    return (
      <p className="text-xs text-muted-foreground">
        Reply by email — this lead isn&apos;t linked to an account yet.
      </p>
    );
  }

  return (
    <div>
      <Button type="button" onClick={convert} disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquarePlus className="h-4 w-4" />
        )}
        Open message thread
      </Button>
      {err && <p className="mt-1 text-xs text-danger">{err}</p>}
    </div>
  );
}
