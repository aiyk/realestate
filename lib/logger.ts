/**
 * Minimal logger with PII redaction.
 * Strips BVN/NIN (11-digit), emails, and Nigerian phone numbers from any string field.
 */

const BVN_NIN = /\b\d{11}\b/g;
const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const NG_PHONE = /\b(\+?234|0)[789]\d{9}\b/g;

function redactString(input: string): string {
  return input
    .replace(BVN_NIN, "***REDACTED_ID***")
    .replace(EMAIL, "***REDACTED_EMAIL***")
    .replace(NG_PHONE, "***REDACTED_PHONE***");
}

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/bvn|nin|password|token|secret/i.test(k)) {
        out[k] = "***REDACTED***";
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

type LogLevel = "debug" | "info" | "warn" | "error";

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const safe = meta ? redact(meta) : undefined;
  const line = {
    t: new Date().toISOString(),
    level,
    msg: redactString(msg),
    ...(safe ? { meta: safe } : {}),
  };
  console[level === "debug" ? "log" : level](JSON.stringify(line));
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
