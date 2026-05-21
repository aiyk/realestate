import { Star } from "lucide-react";

type Bucket = { rating: number; count: number };

type Props = {
  avg: number | null;
  count: number;
  breakdown?: Bucket[];
};

export function AgentRatingSummary({ avg, count, breakdown }: Props) {
  if (!avg || count === 0) return null;
  const buckets =
    breakdown ?? [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 }));
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-4xl font-bold text-stone-900">{avg.toFixed(1)}</p>
          <div className="mt-1 inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  n <= Math.round(avg)
                    ? "h-4 w-4 fill-amber-500 text-amber-500"
                    : "h-4 w-4 text-stone-300"
                }
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            From {count} verified review{count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const b = buckets.find((x) => x.rating === rating);
            const c = b?.count ?? 0;
            const pct = (c / max) * 100;
            return (
              <div key={rating} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-stone-500">{rating}</span>
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <div className="h-2 flex-1 rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-stone-500">{c}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
