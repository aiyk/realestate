import crypto from "node:crypto";
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DOJAH_WEBHOOK_SECRET = "wh_secret";
  process.env.DOJAH_APP_ID = "x";
  process.env.DOJAH_PRIVATE_KEY = "x";
});

describe("dojah.hashId", () => {
  it("produces a stable sha256 for the same input", async () => {
    const { hashId } = await import("@/lib/dojah");
    expect(hashId("22222222222")).toBe(hashId("22222222222"));
    expect(hashId("22222222222")).not.toBe(hashId("22222222223"));
  });
  it("ignores surrounding whitespace", async () => {
    const { hashId } = await import("@/lib/dojah");
    expect(hashId("22222222222")).toBe(hashId("  22222222222  "));
  });
});

describe("dojah.verifyWebhookSignature", () => {
  it("accepts a valid HMAC", async () => {
    const { verifyWebhookSignature } = await import("@/lib/dojah");
    const body = JSON.stringify({ status: "verified" });
    const sig = crypto
      .createHmac("sha256", "wh_secret")
      .update(body)
      .digest("hex");
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });
  it("rejects an invalid HMAC", async () => {
    const { verifyWebhookSignature } = await import("@/lib/dojah");
    expect(verifyWebhookSignature("payload", "ff".repeat(32))).toBe(false);
  });
});
