"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CreateOnArrival({ listingId }: { listingId: string }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (res.ok && data?.thread?.id) {
        router.replace(`/account/messages/${data.thread.id}`);
      }
    })();
  }, [listingId, router]);

  return null;
}
