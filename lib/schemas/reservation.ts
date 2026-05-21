import { z } from "zod";

export const createReservationSchema = z.object({
  listingId: z.string().min(1),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const cancelReservationSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const convertReservationSchema = z.object({
  notes: z.string().max(500).optional(),
});
