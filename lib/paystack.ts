import crypto from "node:crypto";

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const BASE = "https://api.paystack.co";

type PaystackResponse<T> = { status: boolean; message: string; data: T };

async function call<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaystackResponse<T>> {
  if (!SECRET) throw new Error("PAYSTACK_SECRET_KEY not configured");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const json = (await res.json()) as PaystackResponse<T>;
  if (!res.ok || !json.status) {
    throw new Error(`Paystack ${path} failed: ${json.message}`);
  }
  return json;
}

export type InitializeArgs = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type InitializeResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export async function initializeTransaction(
  args: InitializeArgs,
): Promise<InitializeResult> {
  const { data } = await call<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata,
    }),
  });
  return data;
}

export type VerifyResult = {
  status: string;
  reference: string;
  amount: number;
  paid_at: string | null;
  customer: { email: string };
  metadata?: Record<string, unknown>;
};

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const { data } = await call<VerifyResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  return data;
}

export type ResolveAccountResult = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export async function resolveAccount(
  accountNumber: string,
  bankCode: string,
): Promise<ResolveAccountResult> {
  const { data } = await call<ResolveAccountResult>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
  );
  return data;
}

export type TransferRecipient = {
  recipient_code: string;
  type: string;
  details: { account_number: string; account_name: string; bank_code: string };
};

export async function createTransferRecipient(args: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<TransferRecipient> {
  const { data } = await call<TransferRecipient>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: args.name,
      account_number: args.accountNumber,
      bank_code: args.bankCode,
      currency: "NGN",
    }),
  });
  return data;
}

export type InitiateTransferResult = {
  transfer_code: string;
  reference: string;
  status: string;
  amount: number;
};

export async function initiateTransfer(args: {
  amountKobo: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}): Promise<InitiateTransferResult> {
  const { data } = await call<InitiateTransferResult>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: args.amountKobo,
      recipient: args.recipientCode,
      reference: args.reference,
      reason: args.reason,
    }),
  });
  return data;
}

export type ListBanksResult = Array<{ name: string; code: string; slug: string }>;

export async function listBanks(): Promise<ListBanksResult> {
  const { data } = await call<ListBanksResult>("/bank?country=nigeria&perPage=100");
  return data;
}

/**
 * Verify a Paystack webhook HMAC signature.
 * Header: `x-paystack-signature` (HMAC-SHA512 of raw body with secret key).
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!SECRET) return false;
  const expected = crypto
    .createHmac("sha512", SECRET)
    .update(rawBody)
    .digest("hex");
  // Length-safe comparison
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
