import { z } from "zod";

export const kycInitiateSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be 11 digits"),
  nin: z.string().regex(/^\d{11}$/, "NIN must be 11 digits").optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD"),
  selfieKey: z.string().min(1, "Selfie required"),
});

export type KycInitiateInput = z.infer<typeof kycInitiateSchema>;
