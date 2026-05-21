"use client";
import { useState } from "react";
import Link from "next/link";
import type { ListingStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { ListingBulkActions } from "@/components/listings/listing-bulk-actions";
import { ListingRowMenu } from "@/components/listings/listing-row-menu";
import { cn, formatNgn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  ListingStatus,
  "default" | "secondary" | "success" | "warning" | "danger" | "outline"
> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  RESERVED: "warning",
  SOLD: "outline",
  ARCHIVED: "outline",
};

type Row = {
  id: string;
  slug: string;
  title: string;
  status: ListingStatus;
  priceNgn: string;
  city: string;
  imageUrl: string | null;
  blurb: string | null;
};

type Props = {
  rows: Row[];
};

export function ListingTableRows({ rows }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }
  function toggleAll() {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  }

  return (
    <>
      <ListingBulkActions
        selected={selected}
        onClearSelection={() => setSelected([])}
      />
      {/* Card grid on mobile */}
      <div className="mt-6 grid gap-4 sm:hidden">
        {rows.map((l) => (
          <div
            key={l.id}
            className={cn(
              "rounded-2xl border bg-white p-4 transition-colors",
              selected.includes(l.id)
                ? "border-emerald-400 ring-2 ring-emerald-200"
                : "border-stone-200 hover:border-emerald-300",
            )}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.includes(l.id)}
                onChange={() => toggle(l.id)}
                aria-label={`Select ${l.title}`}
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
              <Link href={`/agent/listings/${l.id}/edit`} className="flex-1">
                <div className="flex items-start gap-3">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.imageUrl}
                      alt={l.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-lg bg-stone-100 text-xs text-stone-400">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-stone-900">
                      {l.title}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatNgn(l.priceNgn)}
                    </p>
                    <Badge variant={STATUS_VARIANT[l.status]} className="mt-2">
                      {l.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Link>
              <ListingRowMenu id={l.id} slug={l.slug} status={l.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Table on desktop */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-stone-200 bg-white sm:block">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={
                    rows.length > 0 && selected.length === rows.length
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 accent-emerald-700"
                />
              </th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">City</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((l) => (
              <tr
                key={l.id}
                className={
                  selected.includes(l.id) ? "bg-emerald-50/40" : "hover:bg-stone-50/60"
                }
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${l.title}`}
                    checked={selected.includes(l.id)}
                    onChange={() => toggle(l.id)}
                    className="h-4 w-4 accent-emerald-700"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/agent/listings/${l.id}/edit`}
                    className="flex items-center gap-3"
                  >
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-stone-100 text-[10px] text-stone-400">
                        —
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium text-stone-900">
                        {l.title}
                      </p>
                      {l.blurb && (
                        <p className="line-clamp-1 text-xs text-stone-500">
                          {l.blurb}
                        </p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[l.status]}>
                    {l.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {formatNgn(l.priceNgn)}
                </td>
                <td className="px-4 py-3 text-stone-600">{l.city}</td>
                <td className="px-4 py-3 text-right">
                  <ListingRowMenu id={l.id} slug={l.slug} status={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
