import { describe, it, expect } from "vitest";
import { emitThreadEvent, onThreadEvent } from "@/lib/events";

describe("events bus", () => {
  it("only delivers to subscribers of the same thread", () => {
    const received: string[] = [];
    const unsubA = onThreadEvent("A", (e) => received.push(`A:${e.message.id}`));
    const unsubB = onThreadEvent("B", (e) => received.push(`B:${e.message.id}`));

    emitThreadEvent("A", {
      type: "message",
      threadId: "A",
      message: { id: "1", senderId: "u", body: "hi", createdAt: "now" },
    });
    emitThreadEvent("B", {
      type: "message",
      threadId: "B",
      message: { id: "2", senderId: "u", body: "yo", createdAt: "now" },
    });

    expect(received.sort()).toEqual(["A:1", "B:2"]);
    unsubA();
    unsubB();
  });

  it("unsubscribe stops delivery", () => {
    let count = 0;
    const unsub = onThreadEvent("X", () => count++);
    emitThreadEvent("X", {
      type: "message",
      threadId: "X",
      message: { id: "1", senderId: "u", body: "a", createdAt: "now" },
    });
    unsub();
    emitThreadEvent("X", {
      type: "message",
      threadId: "X",
      message: { id: "2", senderId: "u", body: "b", createdAt: "now" },
    });
    expect(count).toBe(1);
  });
});
