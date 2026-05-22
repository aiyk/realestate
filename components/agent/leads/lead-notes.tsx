"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Note = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
};

type Props = {
  leadId: string;
  initial: Note[];
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadNotes({ leadId, initial }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/agent/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Could not save note");
      const d = (await res.json()) as {
        note: {
          id: string;
          body: string;
          createdAt: string;
          author: { fullName: string };
        };
      };
      setNotes([
        {
          id: d.note.id,
          body: d.note.body,
          createdAt: d.note.createdAt,
          authorName: d.note.author.fullName,
        },
        ...notes,
      ]);
      setDraft("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Notes</p>
      <div className="mt-3 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Talked to them on the phone, prefers Lekki Phase 2, budget ₦80M…"
          className="flex w-full rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        />
        <div className="flex items-center justify-between">
          <Button type="button" onClick={() => void add()} disabled={busy || !draft.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add note
          </Button>
          {err && <span className="text-xs text-danger">{err}</span>}
        </div>
      </div>
      {notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl border border-border bg-card p-3 text-sm shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium text-foreground">{n.authorName}</span>
                <span>·</span>
                <span>{formatWhen(n.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-line text-foreground">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
