"use client";

import * as React from "react";

type ToastVariant = "default" | "success" | "error" | "info" | "loading";

type ToastInput = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. Set to 0 to make it sticky. */
  duration?: number;
  action?: { label: string; onClick: () => void };
};

export type Toast = Required<Pick<ToastInput, "id" | "variant" | "duration">> &
  Omit<ToastInput, "id" | "variant" | "duration">;

type ToastContextValue = {
  toasts: Toast[];
  push: (t: ToastInput) => string;
  update: (id: string, patch: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  default: 4500,
  success: 3500,
  error: 6000,
  info: 4500,
  loading: 0,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const scheduleDismiss = React.useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, t);
    },
    [dismiss],
  );

  const push = React.useCallback(
    (t: ToastInput) => {
      const id = t.id ?? randomId();
      const variant = t.variant ?? "default";
      const duration = t.duration ?? DEFAULT_DURATIONS[variant];
      const next: Toast = {
        id,
        variant,
        duration,
        title: t.title,
        description: t.description,
        action: t.action,
      };
      setToasts((prev) => {
        // Replace if same id (used by toast.promise → success/error swap).
        const without = prev.filter((p) => p.id !== id);
        return [...without, next];
      });
      scheduleDismiss(id, duration);
      return id;
    },
    [scheduleDismiss],
  );

  const update = React.useCallback(
    (id: string, patch: Partial<ToastInput>) => {
      setToasts((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        const variant = patch.variant ?? prev[idx].variant;
        const duration =
          patch.duration ?? (patch.variant ? DEFAULT_DURATIONS[variant] : prev[idx].duration);
        const merged: Toast = {
          ...prev[idx],
          ...patch,
          id,
          variant,
          duration,
        };
        const copy = [...prev];
        copy[idx] = merged;
        scheduleDismiss(id, duration);
        return copy;
      });
    },
    [scheduleDismiss],
  );

  const clear = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setToasts([]);
  }, []);

  React.useEffect(() => {
    const ref = timers.current;
    return () => {
      ref.forEach(clearTimeout);
      ref.clear();
    };
  }, []);

  const value = React.useMemo(
    () => ({ toasts, push, update, dismiss, clear }),
    [toasts, push, update, dismiss, clear],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <Toaster />");
  }
  return ctx;
}

export function useToasts() {
  return useToastContext();
}

type ToastApi = {
  (input: ToastInput): string;
  success: (msg: React.ReactNode, opts?: Omit<ToastInput, "title" | "variant">) => string;
  error: (msg: React.ReactNode, opts?: Omit<ToastInput, "title" | "variant">) => string;
  info: (msg: React.ReactNode, opts?: Omit<ToastInput, "title" | "variant">) => string;
  loading: (msg: React.ReactNode, opts?: Omit<ToastInput, "title" | "variant">) => string;
  dismiss: (id: string) => void;
  promise: <T>(
    p: Promise<T>,
    msgs: {
      loading: React.ReactNode;
      success: React.ReactNode | ((value: T) => React.ReactNode);
      error: React.ReactNode | ((err: unknown) => React.ReactNode);
    },
  ) => Promise<T>;
};

export function useToast(): ToastApi {
  const { push, update, dismiss } = useToastContext();

  const api = React.useMemo<ToastApi>(() => {
    const fn = ((input: ToastInput) => push(input)) as ToastApi;
    const methods: Omit<ToastApi, keyof ((input: ToastInput) => string)> = {
      success: (msg, opts) =>
        push({ ...opts, title: msg, variant: "success" }),
      error: (msg, opts) => push({ ...opts, title: msg, variant: "error" }),
      info: (msg, opts) => push({ ...opts, title: msg, variant: "info" }),
      loading: (msg, opts) =>
        push({ ...opts, title: msg, variant: "loading" }),
      dismiss,
      promise: async (p, msgs) => {
        const id = push({ title: msgs.loading, variant: "loading" });
        try {
          const value = await p;
          update(id, {
            variant: "success",
            title:
              typeof msgs.success === "function"
                ? (msgs.success as (v: typeof value) => React.ReactNode)(value)
                : msgs.success,
          });
          return value;
        } catch (err) {
          update(id, {
            variant: "error",
            title:
              typeof msgs.error === "function"
                ? (msgs.error as (e: unknown) => React.ReactNode)(err)
                : msgs.error,
          });
          throw err;
        }
      },
    };
    return Object.assign(fn, methods);
  }, [push, update, dismiss]);

  return api;
}
