import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, errorResponse } from "@/lib/rbac";
import {
  signUploadUrl,
  listingImageKey,
  kycSelfieKey,
  agentAvatarKey,
  agentCoverKey,
  listingDocumentKey,
} from "@/lib/storage";

const schema = z.object({
  purpose: z.enum([
    "listing",
    "kyc-selfie",
    "agent-avatar",
    "agent-cover",
    "listing-doc",
  ]),
  filename: z.string().min(1).max(200),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "application/pdf",
  ]),
  listingId: z.string().optional(),
  contentLength: z.coerce.number().int().max(25 * 1024 * 1024).optional(),
});

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

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

    if (purpose === "listing-doc") {
      if (contentType !== "application/pdf") {
        return Response.json(
          {
            error: {
              code: "invalid_input",
              message: "Listing documents must be PDF",
            },
          },
          { status: 400 },
        );
      }
      if (contentLength && contentLength > 25 * 1024 * 1024) {
        return Response.json(
          {
            error: {
              code: "invalid_input",
              message: "Document must be ≤25 MB",
            },
          },
          { status: 400 },
        );
      }
    } else if (!IMAGE_TYPES.has(contentType)) {
      return Response.json(
        {
          error: {
            code: "invalid_input",
            message: `${contentType} not allowed for ${purpose}`,
          },
        },
        { status: 400 },
      );
    } else if (contentLength && contentLength > 10 * 1024 * 1024) {
      return Response.json(
        {
          error: { code: "invalid_input", message: "Image must be ≤10 MB" },
        },
        { status: 400 },
      );
    }

    let key: string;
    let bucket: "public" | "kyc" = "public";
    if (purpose === "listing" || purpose === "listing-doc") {
      if (!listingId) {
        return Response.json(
          { error: { code: "invalid_input", message: "listingId required" } },
          { status: 400 },
        );
      }
      key =
        purpose === "listing"
          ? listingImageKey(listingId, filename)
          : listingDocumentKey(listingId, filename);
    } else if (purpose === "kyc-selfie") {
      key = kycSelfieKey(user.id);
      bucket = "kyc";
    } else if (purpose === "agent-avatar") {
      key = agentAvatarKey(user.id, filename);
    } else if (purpose === "agent-cover") {
      key = agentCoverKey(user.id, filename);
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
