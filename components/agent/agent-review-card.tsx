import { RatingStars } from "@/components/ui/rating-stars";

type Props = {
  rating: number;
  body: string | null;
  authorName: string;
  createdAt: string;
  agentReplyBody?: string | null;
  agentRepliedAt?: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AgentReviewCard({
  rating,
  body,
  authorName,
  createdAt,
  agentReplyBody,
  agentRepliedAt,
}: Props) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RatingStars value={rating} readOnly size="sm" />
          <p className="text-sm font-semibold text-foreground">{authorName}</p>
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
      </div>
      {body && (
        <p className="mt-3 whitespace-pre-line text-sm text-foreground">{body}</p>
      )}
      {agentReplyBody && (
        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Agent reply
            {agentRepliedAt && ` · ${formatDate(agentRepliedAt)}`}
          </p>
          <p className="mt-1 whitespace-pre-line text-foreground">
            {agentReplyBody}
          </p>
        </div>
      )}
    </article>
  );
}
