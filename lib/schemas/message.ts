import { z } from "zod";

export const createThreadSchema = z.object({
  listingId: z.string().min(1),
  initialMessage: z.string().min(1).max(2000).optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
