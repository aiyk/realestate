import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, errorResponse } from "@/lib/rbac";
import { signUploadUrl, listingImageKey, kycSelfieKey } from "@/lib/storage";

const schema = z.object({
  purpose: z.enum(["listing", "kyc-selfie", "agent-avatar"]),
  filename: z.string().min(1).max(200),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]),
  listingId: z.string().optional(),
  contentLength: z.coerce.number().int().max(10 * 1024 * 1024).optional(), // 10 MB cap
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: "invalid_input", issues: parsed.error.issues } },
        { status: 400 },
      );
    }
    const { purpose, filename, contentType, listingId, contentLength } =
      parsed.data;

    let key: string;
    let bucket: "public" | "kyc" = "public";
    if (purpose === "listing") {
      if (!listingId) {
        return Response.json(
          { error: { code: "invalid_input", message: "listingId required" } },
          { status: 400 },
        );
      }
      key = listingImageKey(listingId, filename);
    } else if (purpose === "kyc-selfie") {
      key = kycSelfieKey(user.id);
      bucket = "kyc";
    } else {
      key = `agents/${user.id}/${Date.now()}-${filename}`;
    }

    const signed = await signUploadUrl({
      bucket,
      key,
      contentType,
      contentLengthLimit: contentLength,
    });

    return Response.json({
      uploadUrl: signed.url,
      publicUrl: signed.publicUrl,
      storageKey: key,
      expiresIn: signed.expiresIn,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
