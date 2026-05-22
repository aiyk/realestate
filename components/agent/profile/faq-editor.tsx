"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Faq = { question: string; answer: string; isPublished: boolean };

type Props = {
  initial: Faq[];
};

export function FaqEditor({ initial }: Props) {
  const [items, setItems] = useState<Faq[]>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function add() {
    setItems((it) => [
      ...it,
      { question: "", answer: "", isPublished: true },
    ]);
  }
  function remove(i: number) {
    setItems((it) => it.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setItems((it) => {
      const next = [...it];
      const target = i + dir;
      if (target < 0 || target >= next.length) return next;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }
  function update(i: number, patch: Partial<Faq>) {
    setItems((it) => it.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/agent/profile/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: items }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(d?.error?.message ?? "Could not save FAQs");
      }
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Answer common buyer questions once — show them to everyone.
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((f, i) => (
          <li
            key={i}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                #{i + 1}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  onClick={() => move(i, -1)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-surface-2"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  onClick={() => move(i, 1)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-surface-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => remove(i)}
                  className="rounded-md p-1 text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <Label htmlFor={`q-${i}`}>Question</Label>
                <Input
                  id={`q-${i}`}
                  value={f.question}
                  onChange={(e) => update(i, { question: e.target.value })}
                  placeholder="e.g. Do you accept inspection on weekends?"
                />
              </div>
              <div>
                <Label htmlFor={`a-${i}`}>Answer</Label>
                <textarea
                  id={`a-${i}`}
                  value={f.answer}
                  onChange={(e) => update(i, { answer: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={f.isPublished}
                  onChange={(e) =>
                    update(i, { isPublished: e.target.checked })
                  }
                  className="h-4 w-4 [accent-color:var(--primary)]"
                />
                Show on public profile
              </label>
            </div>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" onClick={add}>
        <Plus className="h-4 w-4" /> Add another
      </Button>
      <div className="flex items-center gap-3 pt-2">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save FAQs
        </Button>
        {savedAt && !saving && (
          <span className="text-xs text-primary">Saved.</span>
        )}
        {err && <span className="text-xs text-danger">{err}</span>}
      </div>
    </div>
  );
}
