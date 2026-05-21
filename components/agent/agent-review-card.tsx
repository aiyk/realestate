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
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RatingStars value={rating} readOnly size="sm" />
          <p className="text-sm font-semibold text-stone-900">{authorName}</p>
        </div>
        <p className="text-xs text-stone-500">{formatDate(createdAt)}</p>
      </div>
      {body && (
        <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{body}</p>
      )}
      {agentReplyBody && (
        <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Agent reply
            {agentRepliedAt && ` · ${formatDate(agentRepliedAt)}`}
          </p>
          <p className="mt-1 whitespace-pre-line text-stone-700">
            {agentReplyBody}
          </p>
        </div>
      )}
    </article>
  );
}
