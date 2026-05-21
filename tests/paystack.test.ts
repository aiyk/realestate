import crypto from "node:crypto";
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test_dummy";
});

describe("paystack.verifyWebhookSignature", () => {
  it("accepts a correctly signed payload", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    const body = JSON.stringify({ event: "charge.success" });
    const sig = crypto
      .createHmac("sha512", "sk_test_dummy")
      .update(body)
      .digest("hex");
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it("rejects a tampered payload", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    const body = JSON.stringify({ event: "charge.success" });
    const sig = crypto
      .createHmac("sha512", "sk_test_dummy")
      .update(body)
      .digest("hex");
    expect(verifyWebhookSignature(body + "x", sig)).toBe(false);
  });

  it("rejects a signature of the wrong length", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature("hello", "deadbeef")).toBe(false);
  });
});
