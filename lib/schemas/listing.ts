import { z } from "zod";

export const PropertyTypeEnum = z.enum([
  "HOUSE",
  "APARTMENT",
  "LAND",
  "DUPLEX",
  "BUNGALOW",
  "TERRACE",
]);

export const listingImageInputSchema = z.object({
  storageKey: z.string().min(1),
  url: z.string().url(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isCover: z.boolean().default(false),
});

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createListingSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(20).max(5000),
  propertyType: PropertyTypeEnum,
  priceNgn: z.coerce.number().positive().max(1e12),
  depositNgn: z.coerce.number().positive().max(1e12),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).optional(),
  areaSqm: z.coerce.number().positive().max(1e6).optional(),
  addressLine: z.string().min(3).max(200),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  country: z.string().default("Nigeria"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  amenities: z.array(z.string().max(60)).max(30).default([]),
  images: z.array(listingImageInputSchema).min(1).max(20),
  agentCommissionPct: z.coerce.number().min(0).max(50).optional(),
  platformFeePct: z.coerce.number().min(0).max(50).default(1),
  videoUrl: optionalUrl,
  virtualTourUrl: optionalUrl,
  youtubeEmbedId: z
    .string()
    .trim()
    .max(40)
    .regex(/^[A-Za-z0-9_-]*$/, "Use the 11-char YouTube video id")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial();
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

export const listingFilterSchema = z.object({
  city: z.string().max(80).optional(),
  propertyType: PropertyTypeEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  agentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListingFilter = z.infer<typeof listingFilterSchema>;
