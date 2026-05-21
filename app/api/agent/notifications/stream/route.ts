import { errorResponse, requireAuth } from "@/lib/rbac";
import { onUserEvent } from "@/lib/events";

export async function GET() {
  try {
    const user = await requireAuth();

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
            );
          } catch {
            // closed
          }
        };
        send("hello", { userId: user.id });

        const unsubscribe = onUserEvent(user.id, (event) => {
          send("notification", event.notification);
        });

        const interval = setInterval(() => send("ping", { t: Date.now() }), 25000);

        const close = () => {
          clearInterval(interval);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // already closed
          }
        };
        // @ts-expect-error AbortController not statically typed on ReadableStreamController in Node
        controller.signal?.addEventListener("abort", close);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
