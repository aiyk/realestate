"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentReviewCard } from "@/components/agent/agent-review-card";
import { AgentRatingSummary } from "@/components/agent/agent-rating-summary";

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  agentReplyBody: string | null;
  agentRepliedAt: string | null;
  createdAt: string;
  authorName: string;
};

type Summary = {
  avg: number | null;
  count: number;
  breakdown?: { rating: number; count: number }[];
};

type Props = {
  slug: string;
};

export function AgentReviewsList({ slug }: Props) {
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/agents/${slug}/reviews?take=6`);
        if (!res.ok) return;
        const d = (await res.json()) as {
          items: ReviewRow[];
          nextCursor: string | null;
          summary: Summary;
        };
        if (cancelled) return;
        setItems(d.items);
        setCursor(d.nextCursor);
        setSummary(d.summary);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/agents/${slug}/reviews?take=6&cursor=${cursor}`,
      );
      if (!res.ok) return;
      const d = (await res.json()) as {
        items: ReviewRow[];
        nextCursor: string | null;
      };
      setItems((cur) => [...cur, ...d.items]);
      setCursor(d.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
      </p>
    );
  }
  if (!summary || summary.count === 0) {
    return null;
  }
  return (
    <div className="space-y-4">
      <AgentRatingSummary
        avg={summary.avg}
        count={summary.count}
        breakdown={summary.breakdown}
      />
      <div className="space-y-3">
        {items.map((r) => (
          <AgentReviewCard
            key={r.id}
            rating={r.rating}
            body={r.body}
            authorName={r.authorName}
            createdAt={r.createdAt}
            agentReplyBody={r.agentReplyBody}
            agentRepliedAt={r.agentRepliedAt}
          />
        ))}
      </div>
      {cursor && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
