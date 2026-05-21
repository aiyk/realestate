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
