import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";
const PUBLIC_BUCKET = process.env.R2_BUCKET ?? "realestate-listings";
const KYC_BUCKET = process.env.R2_KYC_BUCKET ?? "realestate-kyc";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

function makeClient() {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error("R2 not configured");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

export type SignUploadInput = {
  bucket: "public" | "kyc";
  key: string;
  contentType: string;
  contentLengthLimit?: number;
};

export async function signUploadUrl(input: SignUploadInput): Promise<{
  url: string;
  publicUrl: string;
  expiresIn: number;
}> {
  const client = makeClient();
  const bucket = input.bucket === "kyc" ? KYC_BUCKET : PUBLIC_BUCKET;
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.contentLengthLimit,
  });
  const url = await getSignedUrl(client, cmd, { expiresIn: 300 });
  const publicUrl =
    input.bucket === "public" && PUBLIC_URL
      ? `${PUBLIC_URL.replace(/\/$/, "")}/${input.key}`
      : "";
  return { url, publicUrl, expiresIn: 300 };
}

export function listingImageKey(listingId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const slug = filename.replace(/[^a-z0-9._-]/gi, "_");
  return `listings/${listingId}/${Date.now()}-${slug.slice(0, 40)}.${ext}`;
}

export function kycSelfieKey(userId: string): string {
  return `kyc/${userId}/selfie-${Date.now()}.jpg`;
}

export function agentAvatarKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  return `agents/${userId}/avatar-${Date.now()}.${ext}`;
}

export function agentCoverKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  return `agents/${userId}/cover-${Date.now()}.${ext}`;
}

export function listingDocumentKey(
  listingId: string,
  filename: string,
): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const slug = filename.replace(/[^a-z0-9._-]/gi, "_");
  return `listings/${listingId}/docs/${Date.now()}-${slug.slice(0, 40)}.${ext}`;
}
