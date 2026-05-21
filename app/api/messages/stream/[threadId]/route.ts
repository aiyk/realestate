import { NextRequest } from "next/server";
import { errorResponse, requireThreadParticipant } from "@/lib/rbac";
import { onThreadEvent } from "@/lib/events";

// Reuse the in-memory connection set from the message-send route
declare global {
  var __threadConnections: Map<string, Set<string>> | undefined;
}
const connections = (globalThis.__threadConnections ??= new Map());

type Params = { params: Promise<{ threadId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params;
    const user = await requireThreadParticipant(threadId);

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };
        // Initial hello
        send("hello", { threadId });

        const userSet = connections.get(threadId) ?? new Set<string>();
        userSet.add(user.id);
        connections.set(threadId, userSet);

        const unsubscribe = onThreadEvent(threadId, (event) => {
          send("message", event.message);
        });

        // Heartbeat
        const interval = setInterval(() => {
          try {
            send("ping", { t: Date.now() });
          } catch {
            // closed
          }
        }, 25000);

        // Cancel handling
        const close = () => {
          clearInterval(interval);
          unsubscribe();
          const set = connections.get(threadId);
          if (set) {
            set.delete(user.id);
            if (set.size === 0) connections.delete(threadId);
          }
          try {
            controller.close();
          } catch {
            // already closed
          }
        };

        // Tie to abort signal
        // @ts-expect-error AbortController not statically typed on ReadableStreamController in Node
        controller.signal?.addEventListener("abort", close);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
