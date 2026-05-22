"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export function ThreadView({
  threadId,
  currentUserId,
  initialMessages,
}: {
  threadId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/messages/stream/${threadId}`);
    es.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } catch {
        // ignore
      }
    });
    return () => es.close();
  }, [threadId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const body = draft;
    setDraft("");
    const res = await fetch(`/api/messages/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (!res.ok) {
      setDraft(body);
      return;
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border bg-card">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Send the first one below.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <Input
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
