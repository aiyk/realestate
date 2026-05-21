import { z } from "zod";

export const businessStepSchema = z.object({
  businessName: z.string().min(2).max(120),
  cacNumber: z.string().max(40).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional(),
});

export type BusinessStepInput = z.infer<typeof businessStepSchema>;

export const payoutStepSchema = z.object({
  bankCode: z.string().min(2).max(10),
  bankAccountNo: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
});

export type PayoutStepInput = z.infer<typeof payoutStepSchema>;

export const approveAgentSchema = z.object({
  defaultCommissionPct: z.coerce.number().min(0).max(50).optional(),
});

export const rejectAgentSchema = z.object({
  reason: z.string().min(5).max(500),
});

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const PropertyTypeEnum = z.enum([
  "HOUSE",
  "APARTMENT",
  "LAND",
  "DUPLEX",
  "BUNGALOW",
  "TERRACE",
]);

export const profileBasicsSchema = z.object({
  businessName: z.string().min(2).max(120),
  bio: z.string().max(2000).optional(),
  tagline: z.string().max(160).optional(),
  cacNumber: z.string().max(40).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  whatsappNumber: z
    .string()
    .max(20)
    .regex(/^[+0-9 ()-]*$/, "Use digits, +, spaces, ()-")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  avatarUrl: optionalUrl,
  coverPhotoUrl: optionalUrl,
});
export type ProfileBasicsInput = z.infer<typeof profileBasicsSchema>;

export const profileSocialsSchema = z.object({
  twitterUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  websiteUrl: optionalUrl,
});
export type ProfileSocialsInput = z.infer<typeof profileSocialsSchema>;

export const profileLanguagesSchema = z.object({
  languages: z.array(z.string().min(2).max(40)).max(10),
});

export const profileCredentialsSchema = z.object({
  credentials: z.array(z.string().min(2).max(80)).max(10),
});

export const profileSpecialtiesSchema = z.object({
  specialties: z.array(PropertyTypeEnum).max(6),
});

export const profileServiceAreasSchema = z.object({
  serviceAreas: z
    .array(
      z.object({
        city: z.string().min(2).max(80),
        state: z.string().min(2).max(80),
        radiusKm: z.coerce.number().int().min(0).max(500).optional(),
        isPrimary: z.boolean().optional().default(false),
      }),
    )
    .max(20),
});

export const profileFaqsSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string().min(3).max(200),
        answer: z.string().min(3).max(2000),
        isPublished: z.boolean().optional().default(true),
      }),
    )
    .max(20),
});

export const agentDirectoryFilterSchema = z.object({
  q: z.string().max(80).optional(),
  city: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) =>
      Array.isArray(v) ? v : v ? [v] : undefined,
    ),
  state: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) =>
      Array.isArray(v) ? v : v ? [v] : undefined,
    ),
  type: z
    .union([PropertyTypeEnum, z.array(PropertyTypeEnum)])
    .optional()
    .transform((v) =>
      Array.isArray(v) ? v : v ? [v] : undefined,
    ),
  sort: z
    .enum(["recent", "mostListings", "mostSold", "alpha", "rating"])
    .optional()
    .default("recent"),
  tier: z.enum(["top", "rising", "verified"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(24),
});

export const contactInquirySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  phone: z
    .string()
    .max(20)
    .regex(/^[+0-9 ()-]*$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: z.string().min(10).max(2000),
  kind: z.enum(["MESSAGE", "VIEWING_REQUEST"]).default("MESSAGE"),
  viewingAt: z.string().datetime().optional(),
  listingId: z.string().optional(),
  _hp: z.string().optional(),
});

export const agentReviewSchema = z.object({
  reservationId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(1).max(2000).optional(),
});

export const agentReviewReplySchema = z.object({
  body: z.string().min(1).max(2000),
});

export const agentReviewFlagSchema = z.object({
  reason: z.string().min(3).max(400),
});
