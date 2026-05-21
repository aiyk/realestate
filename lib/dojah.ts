import crypto from "node:crypto";

const APP_ID = process.env.DOJAH_APP_ID ?? "";
const SECRET = process.env.DOJAH_PRIVATE_KEY ?? "";
const WEBHOOK_SECRET = process.env.DOJAH_WEBHOOK_SECRET ?? "";
const BASE = process.env.DOJAH_BASE_URL ?? "https://sandbox.dojah.io";

type DojahResponse<T> = { entity: T } | { error: string };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!APP_ID || !SECRET) throw new Error("Dojah not configured");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      AppId: APP_ID,
      Authorization: SECRET,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const json = (await res.json()) as DojahResponse<T>;
  if (!res.ok || "error" in json) {
    const msg = "error" in json ? json.error : `Dojah ${path} failed`;
    throw new Error(msg);
  }
  return json.entity;
}

export type BvnLookupResult = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  phone_number1?: string;
};

export async function lookupBvn(bvn: string): Promise<BvnLookupResult> {
  return call<BvnLookupResult>(`/api/v1/kyc/bvn/full?bvn=${encodeURIComponent(bvn)}`);
}

export type NinLookupResult = {
  first_name: string;
  middle_name?: string;
  surname: string;
  date_of_birth: string;
};

export async function lookupNin(nin: string): Promise<NinLookupResult> {
  return call<NinLookupResult>(`/api/v1/kyc/nin?nin=${encodeURIComponent(nin)}`);
}

export type LivenessCheckResult = {
  liveness_check: { liveness: { liveness_check: boolean; liveness_probability: number } };
};

export async function checkLiveness(imageBase64: string): Promise<LivenessCheckResult> {
  return call<LivenessCheckResult>("/api/v1/ml/liveness", {
    method: "POST",
    body: JSON.stringify({ image: imageBase64 }),
  });
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function hashId(value: string): string {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}
