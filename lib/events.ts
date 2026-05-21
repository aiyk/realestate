/**
 * In-process pub/sub for SSE message streams.
 *
 * Single Next.js instance only — if we ever scale horizontally, swap this
 * EventTarget for Redis pub/sub. The interface (emit/on) stays the same.
 */

type Bus = EventTarget;

const globalForEvents = globalThis as unknown as {
  __realestateBus: Bus | undefined;
};

const bus: Bus = globalForEvents.__realestateBus ?? new EventTarget();
if (!globalForEvents.__realestateBus) globalForEvents.__realestateBus = bus;

export type ThreadEvent = {
  type: "message";
  threadId: string;
  message: {
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
  };
};

export function threadChannel(threadId: string): string {
  return `thread:${threadId}`;
}

export function emitThreadEvent(threadId: string, payload: ThreadEvent): void {
  bus.dispatchEvent(
    new CustomEvent(threadChannel(threadId), { detail: payload }),
  );
}

export function onThreadEvent(
  threadId: string,
  handler: (event: ThreadEvent) => void,
): () => void {
  const ch = threadChannel(threadId);
  const listener = (e: Event) => {
    handler((e as CustomEvent<ThreadEvent>).detail);
  };
  bus.addEventListener(ch, listener);
  return () => bus.removeEventListener(ch, listener);
}

export type UserEvent = {
  type: "notification";
  notification: {
    id: string;
    type: string;
    title: string;
    body: string | null;
    actionUrl: string | null;
    createdAt: string;
  };
};

export function userChannel(userId: string): string {
  return `user:${userId}`;
}

export function emitUserEvent(userId: string, payload: UserEvent): void {
  bus.dispatchEvent(
    new CustomEvent(userChannel(userId), { detail: payload }),
  );
}

export function onUserEvent(
  userId: string,
  handler: (event: UserEvent) => void,
): () => void {
  const ch = userChannel(userId);
  const listener = (e: Event) => {
    handler((e as CustomEvent<UserEvent>).detail);
  };
  bus.addEventListener(ch, listener);
  return () => bus.removeEventListener(ch, listener);
}
