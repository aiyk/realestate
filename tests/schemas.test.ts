import { describe, it, expect } from "vitest";
import { kycInitiateSchema } from "@/lib/schemas/kyc";
import { createListingSchema } from "@/lib/schemas/listing";
import { signupSchema } from "@/lib/schemas/auth";
import { payoutStepSchema } from "@/lib/schemas/agent";

describe("kycInitiateSchema", () => {
  it("rejects non-11-digit BVN", () => {
    const r = kycInitiateSchema.safeParse({
      bvn: "1234",
      dob: "1990-05-15",
      selfieKey: "k",
    });
    expect(r.success).toBe(false);
  });
  it("accepts valid input", () => {
    const r = kycInitiateSchema.safeParse({
      bvn: "22222222222",
      dob: "1990-05-15",
      selfieKey: "k",
    });
    expect(r.success).toBe(true);
  });
});

describe("createListingSchema", () => {
  const valid = {
    title: "A really lovely 3-bedroom house in town",
    description: "Long enough description with at least twenty chars.",
    propertyType: "HOUSE",
    priceNgn: 100000,
    depositNgn: 1000,
    addressLine: "12 Lane",
    city: "Lagos",
    state: "Lagos",
    images: [{ storageKey: "k", url: "https://example.com/x.jpg" }],
  };
  it("accepts a minimal valid payload", () => {
    expect(createListingSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects negative price", () => {
    expect(
      createListingSchema.safeParse({ ...valid, priceNgn: -1 }).success,
    ).toBe(false);
  });
  it("requires at least one image", () => {
    expect(
      createListingSchema.safeParse({ ...valid, images: [] }).success,
    ).toBe(false);
  });
});

describe("signupSchema", () => {
  it("rejects bad email", () => {
    expect(
      signupSchema.safeParse({
        email: "not-an-email",
        password: "12345678",
        fullName: "X",
      }).success,
    ).toBe(false);
  });
  it("rejects short password", () => {
    expect(
      signupSchema.safeParse({
        email: "a@b.co",
        password: "short",
        fullName: "X Y",
      }).success,
    ).toBe(false);
  });
});

describe("payoutStepSchema", () => {
  it("requires 10-digit account number", () => {
    expect(
      payoutStepSchema.safeParse({ bankCode: "058", bankAccountNo: "123" })
        .success,
    ).toBe(false);
    expect(
      payoutStepSchema.safeParse({ bankCode: "058", bankAccountNo: "0123456789" })
        .success,
    ).toBe(true);
  });
});
